# Green Tractor
This is the codebase for [Green Tractor](https://greentractor.us/). It is maintained by Max Davish. We have no official documentation system, so anything worth knowing is written down in this README.

## Realtime Messages + Notifications with Pusher
We use [Pusher](http://pusher.com/) to listen to various events like new messages, new offers, etc.

There are a few Pusher channels you need to know about:

1. `messagesFrom-<USER_ID>-to-<OTHER_USER_ID>`: This is the channel you subscribe to when you specifically want to know about any new messages that are sent from a specific user to another specific user. You need to do this when you are on a specific **conversation page** (i.e. `/dashboard/inbox/<OTHER_USER_ID>`).
2. `messagesTo-<USER_ID>`: This is the channel you subscribe to when you want to listen to _all_ messages sent to a specific user (usually the logged in user). This channel is how we show toasts when a user receives a new message and stuff like that.
3. `offersFrom-<USER_ID>-to-<OTHER_USER_ID>`: Same thing as #1 except for offers, not messages.
4. `offersTo-<USER_ID>`: Same thing as #2 except for offers, not messages.
5. `isTyping-<USER_ID>`: Indicates whether a specific user is typing. Actually, I'm realizing that I messed this up and this should be `isTyping-<USER_ID>-to-<OTHER_USER_ID>`, because right now it'll just show if that user is typing to _anyone_. So that's a mistake. Gotta fix that.
6. `offerUpdatesFrom-<USER>-to-<OTHER_USER_ID>`: Same thing as #2 except for offer updates
7. `offerUpdatesTo-<USER>`

In essence, the "two way" channels (`thingsTo-UserA-from-UserB`) are for populating the convesation page, because that page needs to update every time a new conversation element from _either_ user shows up.

Then the "one way" channels (`thingsTo-UserC`) are for toast notifications, because those only need to happen whenever something happens for User C, regardless of whom its from.

You can find some more information about this under `sendMessage.ts`.

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