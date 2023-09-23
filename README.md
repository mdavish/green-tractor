# Green Tractor
This is the codebase for [Green Tractor](https://greentractor.us/). It is maintained by Max Davish. We have no official documentation system, so anything worth knowing is written down in this README.

## Our Stack
Here is a list of the main technologies we use:
**Open Source**
- [Prisma](https://www.prisma.io/) for ORM
- [NextJS](https://nextjs.org/) for main application
- [TailwindCSS](https://tailwindcss.com/) for CSS
- [Shadcn](https://ui.shadcn.com/) for UI components
**Paid**
- [Vercel](https://vercel.com/) for hosting
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (Neon) for database
- [Pusher](https://pusher.com/) for realtime events
- [Inngest](https://www.inngest.com/) for queues and background jobs
- [Stripe](https://stripe.com/) for payments
- [Resend](https://resend.com/) for email
- [Segment](https://segment.com/) for analytics
- [Mapbox](https://www.mapbox.com/) for geosearch, maps, etc.
**Coming Soon**
- [Algolia](https://www.algolia.com/) for search
- [Open AI](https://openai.com/) for AI stuff
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) + [Cloudflare](https://www.cloudflare.com/) for image hosting

## Prisma and Side Effects
For the most part we use Prisma pretty normally, but there are some cases where we want to always trigger side effects when a database record is created or updated. For example:
- Send an update to Pusher every time a message, offer, or offer update is created
- Queue up an email to be sent in Inngest every time an offer or offer update is created
- Update the status of a listing to `PAID` every time an offer update with status `PAYMENT` happens

All of this logic lives in the `PrismaSuperClient`, which exposes some new methods for creating certain objects. These methods work just like regular Prisma methods (same `data` argument) except that they trigger these side effects for you and also don't have an `include` argument, because they need to include certain other data themselves in order to trigger the right side effects. 

Make sure to always use these methods in place of the raw Prisma methods, so use...
- `prisma.createOfferUpdate` not `prisma.offerUpdate.create`
- `prisma.createOffer` not `prisma.offer.create`
- `prisma.createMessage` not `prisma.message.create`

## Realtime Messages + Notifications with Pusher
We use [Pusher](http://pusher.com/) to listen to various events like new messages, new offers, etc.

There are TWO pusher channels that we care about:

1. **One Way Channel**: (`to-${userId}`) This channel is how users get notifications from any of the conversations they're having with any other users. The logic for these notifications lives in the `<NotificationsProvider/>` component, which shows a toast when new messages arrive in the one way channel. Because the `NotificationsProvider` wraps the entire app, the one way channel is basically always subscribed to.
2. **Two Way Channel:** (`from-${fromUserId}-to-${toUserId}`) This channel is for listening a _specific_ conversation beteen two users. We listen to this channel only when the user is on the `/dashboard/conversations/{otherUserId}` page. The logic lives in the `<ConversationPanel/>` component. In that component, we subscribe two _two_ two-way channels - the "outgoing" and the "incoming" channel. That way, the UI updates every time that either user sends a message, or makes an offer, or updates an offer. Unlike the one way channel, we only subscribe to the two way channel when the user is on the conversation page. 

In the `pusher.ts` file, we create superclasses for `PusherClient` and `PusherServer` that add extra methods with added type safety to ensure that we are sending the right data on the server and reading the right data on the client.

From the `pusherServer`, you should always use `typedTrigger` to trigger events, and from `pusherServer` you should use `subscribeAndBind` and `unsubscribeAndBind`. These methods will give you nice type safety!

## Payments with Stripe
We use Stripe for handling payments. Specifically we use [Stripe Connect](https://stripe.com/connect) which is their product for marketplaces like ours. [This guide](https://stripe.com/docs/connect/collect-then-transfer-guide?payment-ui=elements) basically explains the architecture we use.

Here are the main points you should know:

1. In order to sell stuff on Green Tractor , a user first has to set up a "Connected Account" with us. When they do this, they enter some information with Stripe, and Stripe handles all the tricky KYC stuff that we don't want to handle. You can find the logic for this in `setupStripe.ts`.
2. If a user wants to buy something on Green Tractor, they don't need a connected account. When a user goes to buy something on Green Tractor, we simply use [Stripe Checkout](https://stripe.com/docs/payments/checkout). With Stripe Checkout, Stripe hosts and handles the checkout page. You can find the logic for this in `createCheckoutSession.ts`. Some day, we might use Stripe Elements to host our own checkout page, but for now Stripe Checkout is easiest. 
3. Once a user has purchased something, we pay the seller out using the logic in `<INSERT FILE HERE>`. (This part isn't quite done yet.)

### Local Development
During local development with Stripe, you should use [the CLI](https://github.com/stripe/stripe-cli) to receive webhook events. You can find more information about this [here](https://stripe.com/docs/webhooks/quickstart).

Run this command:
```bash
stripe listen --forward-to localhost:3000/api/payments/stripe-webhook
```

This will point Stripe events to the API route at `app/api/payments/stripe-webhook/route.ts`. This endpoint is in charge of handling Stripe events, such as when a payment succeeds. 

You can also simulate fake events by using commands like...
```bash
stripe trigger payment_intent.succeeded
```

## Inngest
We use [Inngest](https://www.inngest.com/) for stuff that would otherwise require queues, background jobs, cron jobs, etc. For example, we use Inngest to...
- Pay out sellers one week after a transaction closes, as long as the item wasn't returned/disputed
- Send a reminder email to a user if they haven't responded to an offer within a day
- Send users periodic weekly emails about listings they might be interested in

To use Inngest in local development, run this:
```bash
npx inngest-cli@latest dev
```

## Email with Resend and React Email
We use [Resend](https://resend.com/) and [React Email](https://react.email/) to send emails to users.

Under the `src/components/email` you'll find the actual email templates that we use to send emails. To develop these 
templates locally, you can run `npm run dev:email` which will start the React Email dev server (which, frankly, is a little buggy). 

Importantly, you _can't_ just use any old React component from this project in developing your emails. You have to use React Email's special components such as the [Tailwind](https://react.email/docs/components/tailwind) component or the [Image](https://react.email/docs/components/image) component. These components ensure that things appear roughly consistently across email clients. 

This also unfortunately means that we have to recreate some of our utilities like the `cn` function and the `FormattedDate` function. Overall you should think of the email templates as a separate project from the rest of the codebase.

The emails themselves are sent by Inngest - most of the code for that lives in `src/lib/inngest/index.ts`.

## Cloudinary
### Uploading Photos
We use Cloudinary for uploading and serving photos. This is very tricky, and there are a few things you need to know to understand how this is handled.

First, because we use NextJS server actions, you can't pass files directly to the actions. You can only pass plain objects. Additionally, because we use a [Zod Resolver](https://github.com/react-hook-form/resolvers) in react-hook-form, we can't pass a file to the resolver either. So, we have to upload the file to Cloudinary _before_ we send it to the server.

So the recommended approach, according to this [Github Issue](https://github.com/orgs/react-hook-form/discussions/10091), is to generate the Cloudinary URL on the client, and then pass that URL to the server. The server can then use that URL to download the file from Cloudinary and save it to the database.

We can do this using [client side uploading](https://cloudinary.com/documentation/upload_images#client_side_uploading) with cloudinary. More specifically, we use the [upload endpoint](https://cloudinary.com/documentation/react_image_and_video_upload#upload_endpoint) as opposed to their upload widget, because I think the widget is ugly.

### Serving Photos
We use next-cloudinary to serve the images. Responsize sizing is really tricky, but [this](https://next.cloudinary.dev/guides/responsive-images) is a great explainer on how to do it. 