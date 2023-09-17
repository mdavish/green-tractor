import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { EventSchemas, Inngest } from "inngest";
import type { InngestFunction } from "inngest/components/InngestFunction";
import type { Listing } from "@prisma/client";
import type { ExpandedOfferUpdate, ExpandedOffer } from "@/lib/prisma";

const resend = new Resend(process.env.RESEND_API_KEY);

type InngestEvents = {
  "test/hello.world": {
    data: {};
  };
  "listing.new": {
    data: Listing;
  };
  "offer.update": {
    data: ExpandedOfferUpdate;
  };
  "offer.new": {
    data: ExpandedOffer;
  };
  "messages.unread": {
    data: {
      userId: string;
    };
  };
};

export const inngest = new Inngest({
  name: "Green Tractor",
  schemas: new EventSchemas().fromRecord<InngestEvents>(),
});

export const helloWorld = inngest.createFunction(
  { name: "Hello World" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("1s");
    return { event, body: "Hello, World!" };
  }
);

export const newOffer = inngest.createFunction(
  {
    name: "New Offer",
  },
  {
    event: "offer.new",
  },
  async ({ event, step }) => {
    console.log("This is where I handle the new offer");
    console.log({ event, step });
    const { listing } = event.data;
    const { email, name } = listing.listingUser;

    if (!email) {
      throw new Error(
        `No email found for user ${listing.listingUser.id}. This should never happen.`
      );
    }

    // You could do this if you wanted, but it should probably be immedate
    // await step.sleep("10 hour")
    await step.run("Send Offer Update Email", async () => {
      const emailResponse = await resend.emails.send({
        from: "max@greentractor.us",
        to: email,
        subject: `New Offer on ${listing}`,
        // TODO: Make this actually good?
        text: `Congratulations, ${name}! You received an offer on your listing.`,
      });
      return emailResponse;
    });

    // Then you could sleep again if you wanted and do something else?
  }
);

export const identifyUnreadUsers = inngest.createFunction(
  {
    name: "Identify Users with Unreads",
  },
  {
    // Happens once per day
    cron: "0 0 * * *",
  },
  async ({ event, step }) => {
    const usersWithUnread = await step.run(
      "Fetch Users with Unread Messages",
      async () => {
        return await prisma.message.groupBy({
          by: ["toUserId"],
          _count: {
            toUserId: true,
          },
        });
      }
    );

    // TODO: Actually write this function and QA it and such
    usersWithUnread.forEach((user) => {
      step.sendEvent({
        name: "messages.unread",
        data: {
          userId: user.toUserId,
        },
      });
    });

    return {
      count: usersWithUnread.length,
      userIds: usersWithUnread.map((user) => user.toUserId),
    };
  }
);

export const unreadMessages = inngest.createFunction(
  {
    name: "Notify User About Unread Messages",
  },
  {
    event: "messages.unread",
  },
  async ({ event, step }) => {
    console.log(`User ${event.data.userId} has some unread messages ooh wee`);
  }
);

export const allFunctions: InngestFunction<any, any, any>[] = [
  helloWorld,
  newOffer,
  identifyUnreadUsers,
  unreadMessages,
];
