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

  return (
    <NotificationsContext.Provider
      value={{ notifications, addUnreadMessage, addUnreadOffer }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}
