import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { EventSchemas, Inngest } from "inngest";
import type { InngestFunction } from "inngest/components/InngestFunction";
import type { Listing } from "@prisma/client";
import type { ExpandedOfferUpdate, ExpandedOffer } from "@/lib/prisma";
import OfferEmail from "@/components/email/OfferEmail";
import OfferUpdateEmail from "@/components/email/OfferUpdateEmail";
import { indexEverything } from "../algolia";

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

export const inngestClient = new Inngest({
  name: "Green Tractor",
  schemas: new EventSchemas().fromRecord<InngestEvents>(),
});

export const newOffer = inngestClient.createFunction(
  {
    name: "New Offer",
  },
  {
    event: "offer.new",
  },
  async ({ event, step }) => {
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
        from: "Green Tractor <max@greentractor.us>",
        to: email,
        subject: `New Offer on ${listing.title}`,
        react: OfferEmail({ offer: event.data }),
      });
      return emailResponse;
    });

    // Then you could sleep again if you wanted and do something else?
  }
);

export const offerUpdate = inngestClient.createFunction(
  {
    name: "Offer Update",
  },
  {
    event: "offer.update",
  },
  async ({ event, step }) => {
    const recipientUser = ["ACCEPTED", "REJECTED", "COUNTERED"].includes(
      event.data.newStatus
    )
      ? event.data.offer.offerUser
      : event.data.offer.listing.listingUser;

    await step.run("Send Offer Update Email", async () => {
      const emailResponse = await resend.emails.send({
        from: "Green Tractor <max@greentractor.us>",
        to: recipientUser.email!,
        subject: `Offer Update on ${event.data.offer.listing.title}`,
        react: OfferUpdateEmail({ offerUpdate: event.data, recipientUser }),
      });
    });
  }
);

export const identifyUnreadUsers = inngestClient.createFunction(
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

export const unreadMessages = inngestClient.createFunction(
  {
    name: "Notify User About Unread Messages",
  },
  {
    event: "messages.unread",
  },
  async ({ event, step }) => {
    console.log(`User ${event.data.userId} has some unread messages ooh wee`);
    // TODO: Implement this
  }
);

export const indexRecordsForSearch = inngestClient.createFunction(
  {
    name: "Index Records for Search",
  },
  {
    cron: "0 0 * * *",
  },
  async ({ step }) => {
    await step.run("Indexing all listings in Algolia for Search", async () => {
      await indexEverything();
    });
  }
);

export const allFunctions: InngestFunction<any, any, any>[] = [
  newOffer,
  offerUpdate,
  identifyUnreadUsers,
  unreadMessages,
  indexRecordsForSearch,
];
