import { getCurrentUserStrict } from "../auth";
import { prisma } from "../prisma";

export interface NotificationDetails {
  // Right now, the only type of notification is a message notification.
  // But in the future, we might want to add other types of notifications.
  hasUnreads: boolean;
  totalUnreads: number;
  totalUnreadMessages: number;
  totalUnreadOffers: number;
  unreadMessagesBySender: {
    [userId: string]: number;
  };
  unreadOffersBySender: {
    [userId: string]: number;
  };
  unreadsBySender: {
    [userId: string]: number;
  };
}

export default async function getNotifications(): Promise<NotificationDetails> {
  const currentUser = await getCurrentUserStrict();

  const unreadMessagesByUser = await prisma.message.groupBy({
    by: ["fromUserId"],
    _count: {
      _all: true,
    },
    where: {
      seen: false,
      toUserId: currentUser.id,
    },
  });

  const unreadOffersByUser = await prisma.offer.groupBy({
    by: ["offerUserId"],
    _count: {
      _all: true,
    },
    where: {
      seen: false,
      listing: {
        listingUserId: currentUser.id,
      },
    },
  });

  const unreadsBySender: { [userId: string]: number } = {};
  const unreadMessagesBySender: { [userId: string]: number } = {};
  const unreadOffersBySender: { [userId: string]: number } = {};
  let totalUnreads = 0;
  let totalUnreadMessages = 0;
  let totalUnreadOffers = 0;

  for (const { fromUserId, _count } of unreadMessagesByUser) {
    unreadsBySender[fromUserId] = _count._all;
    unreadMessagesBySender[fromUserId] = _count._all;
    totalUnreads += _count._all;
    totalUnreadMessages += _count._all;
  }
  for (const { offerUserId, _count } of unreadOffersByUser) {
    unreadsBySender[offerUserId] =
      (_count._all ?? 0) + (unreadsBySender[offerUserId] ?? 0);
    unreadOffersBySender[offerUserId] = _count._all;
    totalUnreads += _count._all;
    totalUnreadOffers += _count._all;
  }

  return {
    hasUnreads: totalUnreads > 0,
    totalUnreads,
    totalUnreadMessages,
    totalUnreadOffers,
    unreadMessagesBySender,
    unreadOffersBySender,
    unreadsBySender,
  };
}
