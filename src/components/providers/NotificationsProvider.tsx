"use client";
import { useState, useEffect, createContext, useContext } from "react";
import type { User } from "@prisma/client";
import type { SendMessageResponse } from "@/actions/sendMessage";
import { type NotificationDetails } from "@/lib/db/getNotifications";
import { pusherClient } from "@/lib/pusher";
import { useToast } from "../ui/use-toast";
import Link from "next/link";
import { ToastAction } from "../ui/toast";

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
    const incomingChanel = `messagesTo-${currentUser.id}`;
    const channel = pusherClient.subscribe(incomingChanel);
    channel.bind("newMessage", (data: SendMessageResponse) => {
      toast({
        title: `New message from ${data.fromUser.name}`,
        description: data.message,
        duration: 5000,
        action: (
          <ToastAction altText="View Conversation">
            <Link href={`/dashboard/inbox/${data.fromUser.id}`}>View</Link>
          </ToastAction>
        ),
      });
      addUnreadMessage(data.fromUserId);
    });
    return () => {
      pusherClient.unsubscribe(incomingChanel);
      pusherClient.unbind("newMessage");
    };
  }, []);

  // Subscribe to the pusher channel for new offers
  useEffect(() => {
    const incomingChanel = `offersTo-${currentUser.id}`;
    const channel = pusherClient.subscribe(incomingChanel);
    channel.bind("newOffer", (data: SendMessageResponse) => {
      toast({
        title: `New offer from ${data.fromUser.name}`,
        description: data.message,
        duration: 5000,
        action: (
          <ToastAction altText="View Conversation">
            <Link href={`/dashboard/inbox/${data.fromUser.id}`}>View</Link>
          </ToastAction>
        ),
      });
      addUnreadOffer(data.fromUserId);
    });
    return () => {
      pusherClient.unsubscribe(incomingChanel);
      pusherClient.unbind("newOffer");
    };
  }, []);

  // Subscribe to the pusher channel for offer updates
  useEffect(() => {
    const incomingChanel = `offerUpdatesTo-${currentUser.id}`;
    const channel = pusherClient.subscribe(incomingChanel);
    channel.bind("offerUpdate", (data: SendMessageResponse) => {
      toast({
        // TODO: Have a more specific title for this type of notification
        // (Could copy some of the text from the message we construct in ConversationPanel)
        title: `Offer update from ${data.fromUser.name}`,
        description: data.message,
        duration: 5000,
        action: (
          <ToastAction altText="View Conversation">
            <Link href={`/dashboard/inbox/${data.fromUser.id}`}>View</Link>
          </ToastAction>
        ),
      });
      // TODO: This should be a different type of notification
      // addUnreadOffer(data.fromUserId);
    });
    return () => {
      pusherClient.unsubscribe(incomingChanel);
      pusherClient.unbind("offerUpdate");
    };
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ notifications, addUnreadMessage, addUnreadOffer }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
