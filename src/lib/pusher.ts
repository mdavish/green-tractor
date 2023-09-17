import PusherServer from "pusher";
import PusherClient from "pusher-js";
import type {
  ExpandedOfferUpdate,
  ExpandedOffer,
  ExpandedMessage,
} from "./prisma";

export type PusherEventNames = "offerUpdate" | "offer" | "message" | "isTyping";

type EventMap = {
  offerUpdate: ExpandedOfferUpdate;
  offer: ExpandedOffer;
  message: ExpandedMessage;
  isTyping: boolean;
};

export type PusherTriggerPayload<T extends PusherEventNames> = {
  type: T;
  data: EventMap[T];
};

function getPusherOneWayChannel(userId: string) {
  return `to-${userId}`;
}

function getPusherTwoWayChannel(fromUserId: string, toUserId: string) {
  return `from-${fromUserId}-to-${toUserId}`;
}

export class PusherServerSuper extends PusherServer {
  constructor() {
    super({
      appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID!,
      key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: "us2",
      useTLS: true,
    });
  }

  public typedTrigger<T extends PusherEventNames>({
    channel,
    type,
    data,
  }: PusherTriggerPayload<T> & { channel: string }) {
    return this.trigger(channel, type, data);
  }

  public getOneWayChannel(userId: string) {
    return getPusherOneWayChannel(userId);
  }

  public getTwoWayChannel(fromUserId: string, toUserId: string) {
    return getPusherTwoWayChannel(fromUserId, toUserId);
  }
}

export class PusherClientSuper extends PusherClient {
  constructor() {
    super(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: "us2",
    });
  }

  public subscribeAndBind<T extends PusherEventNames>(
    channelName: string,
    eventName: T,
    callback: (data: PusherTriggerPayload<T>["data"]) => void
  ) {
    this.subscribe(channelName);
    return this.channel(channelName).bind(eventName, callback);
  }

  public typedUnbind(event: PusherEventNames) {
    this.unbind(event);
  }

  public getOneWayChannel(userId: string) {
    return getPusherOneWayChannel(userId);
  }

  public getTwoWayChannel(fromUserId: string, toUserId: string) {
    return getPusherTwoWayChannel(fromUserId, toUserId);
  }
}

export const pusherServer = new PusherServerSuper();
export const pusherClient = new PusherClientSuper();
