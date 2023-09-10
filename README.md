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