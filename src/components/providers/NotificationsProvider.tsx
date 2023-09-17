"use client";
import { useState, useEffect, createContext, useContext } from "react";
import type { User } from "@prisma/client";
import { type NotificationDetails } from "@/lib/db/getNotifications";
import { pusherClient } from "@/lib/pusher";
import { useToast } from "../ui/use-toast";
import Link from "next/link";
import { ToastAction } from "../ui/toast";
import { usePathname } from "next/navigation";

interface NotificationsContextType {
  notifications: NotificationDetails;
  addUnreadMessage: (fromUserId: string) => void;
  addUnreadOffer: (fromUserId: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(
  null
);

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
}

export default function NotificationsProvider({
  initialNotifications,
  currentUser,
  children,
}: {
  initialNotifications: NotificationDetails;
  currentUser: User;
  children: React.ReactNode;
}) {
  const { toast } = useToast();
  const pathname = usePathname();
  const [notifications, setNotifications] =
    useState<NotificationDetails>(initialNotifications);

  const addUnreadMessage = (fromUserId: string) => {
    setNotifications((prevNotifications) => {
      return {
        ...prevNotifications,
        hasUnreadMessages: true,
        totalUnreadMessages: prevNotifications.totalUnreadMessages + 1,
        totalUnreads: prevNotifications.totalUnreads + 1,
        unreadMessages: {
          ...prevNotifications.unreadsBySender,
          [fromUserId]: prevNotifications.unreadsBySender[fromUserId] + 1,
        },
      };
    });
  };

  const addUnreadOffer = (fromUserId: string) => {
    setNotifications((prevNotifications) => {
      return {
        ...prevNotifications,
        hasUnreadOffers: true,
        unreadOffers: {
          ...prevNotifications.unreadsBySender,
          [fromUserId]: prevNotifications.unreadsBySender[fromUserId] + 1,
        },
      };
    });
  };

  // Subscribe to the pusher channel for new messages
  useEffect(() => {
    const incomingChannel = pusherClient.getOneWayChannel(currentUser.id);

    pusherClient.subscribeAndBind(incomingChannel, "message", (message) => {
      // Don't send the message toast if you're alrady on that conversation page
      if (pathname === `/dashboard/inbox/${message.fromUser.id}`) {
        return;
      }
      toast({
        title: `New message from ${message.fromUser.name}`,
        description: message.message,
        duration: 5000,
        action: (
          <ToastAction altText="View Conversation">
            <Link href={`/dashboard/inbox/${message.fromUser.id}`}>View</Link>
          </ToastAction>
        ),
      });
      addUnreadMessage(message.fromUserId);
    });

    pusherClient.subscribeAndBind(incomingChannel, "offer", (offer) => {
      toast({
        title: `New offer from ${offer.offerUser.name}`,
        description: offer.offerMessage,
        duration: 5000,
        action: (
          <ToastAction altText="View Conversation">
            <Link href={`/dashboard/inbox/${offer.offerUser.id}`}>View</Link>
          </ToastAction>
        ),
      });
      addUnreadOffer(offer.offerUserId);
    });

    pusherClient.subscribeAndBind(
      incomingChannel,
      "offerUpdate",
      (offerUpdate) => {
        toast({
          // TODO: Have a more specific title for this type of notification
          // (Could copy some of the text from the message we construct in ConversationPanel)
          title: `Offer update from ${offerUpdate.actorUser.name}`,
          description: offerUpdate.message,
          duration: 5000,
          action: (
            <ToastAction altText="View Conversation">
              <Link href={`/dashboard/inbox/${offerUpdate.actorUser.id}`}>
                View
              </Link>
            </ToastAction>
          ),
        });
        // TODO: This should be a different type of notification
        // addUnreadOffer(data.fromUserId);
      }
    );

    return () => {
      pusherClient.unsubscribe(incomingChannel);
      pusherClient.typedUnbind("message");
      pusherClient.typedUnbind("offer");
      pusherClient.typedUnbind("offerUpdate");

      // This is okay because this component should always be mounted
      pusherClient.unbind_global();
    };
  }, [currentUser.id, toast, pathname]);

  return (
    <NotificationsContext.Provider
      value={{ notifications, addUnreadMessage, addUnreadOffer }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
