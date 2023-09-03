"use client";
import { useState, useEffect, useRef, useTransition } from "react";
import { Input } from "@/components/ui/input";
import type { Conversation } from "@/lib/db/getConversationByUserId";
import { Message } from "@prisma/client";
import ConversationElementBubble from "./ConversationElementBubble";
import sendMessage from "@/actions/sendMessage";
import startStopTyping from "@/actions/startStopTyping";
import { pusherClient } from "@/lib/pusher";
import { motion } from "framer-motion";
import { User } from "@prisma/client";
import { ScrollArea } from "./ui/scroll-area";

export default function ConversationPanel({
  conversation,
  currentUser,
  otherUser,
}: {
  conversation: Conversation;
  currentUser: User;
  otherUser: User;
}) {
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserIsTyping, setOtherUserIsTyping] = useState(false);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [conversationElements, setConversationElements] =
    useState<Conversation>(conversation);
  const bottomDivRef = useRef<HTMLDivElement>(null);

  // On the initial page load, the bottom div should be scrolled immediately into view
  // There should be no animation
  useEffect(() => {
    if (bottomDivRef.current) {
      bottomDivRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, []);

  // When a new message is sent or received, scroll the bottom div into view
  // with a smooth animation
  useEffect(() => {
    if (bottomDivRef.current) {
      bottomDivRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationElements]);

  useEffect(() => {
    const channel = `isTyping-${otherUser.id}`;
    const channelObject = pusherClient.subscribe(channel);
    channelObject.bind("typing", (data: { isTyping: boolean }) => {
      setOtherUserIsTyping(data.isTyping);
    });
    return () => {
      pusherClient.unsubscribe(channel);
      pusherClient.unbind("typing");
    };
  }, []);

  useEffect(() => {
    const incomingChannel = `messagesFrom-${otherUser.id}-to-${currentUser.id}`;
    const outgoingChannel = `messagesFrom-${currentUser.id}-to-${otherUser.id}`;
    const incomingChannelObject = pusherClient.subscribe(incomingChannel);
    const outgoingChannelObject = pusherClient.subscribe(outgoingChannel);
    incomingChannelObject.bind("newMessage", (data: Message) => {
      setConversationElements((conversationElements) => [
        ...conversationElements,
        {
          type: "message",
          fromUser: otherUser,
          fromUserId: data.fromUserId,
          id: data.id,
          message: data.message,
          sentAt: new Date(data.sentAt),
          toUserId: data.toUserId,
          toUser: currentUser,
          seen: data.seen,
        },
      ]);
    });
    outgoingChannelObject.bind("newMessage", (data: Message) => {
      setConversationElements((conversationElements) => [
        ...conversationElements,
        {
          type: "message",
          fromUser: currentUser,
          fromUserId: data.fromUserId,
          id: data.id,
          message: data.message,
          sentAt: data.sentAt,
          toUserId: data.toUserId,
          toUser: otherUser,
          seen: data.seen,
        },
      ]);
    });
    return () => {
      pusherClient.unsubscribe(incomingChannel);
      pusherClient.unsubscribe(outgoingChannel);
      pusherClient.unbind("newMessage");
    };
  }, []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setIsTyping(true);
    if (event.key === "Enter") {
      startTransition(async () => {
        await sendMessage({ toUserId: otherUser.id, message });
      });
      setMessage("");
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsTyping(true);
    setMessage(event.target.value);
  };

  useEffect(() => {
    if (isTyping) {
      startStopTyping({ isTyping: true });
    } else {
      startStopTyping({ isTyping: false });
    }
  }, [isTyping]);

  // Set not typing after 5 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, [isTyping]);

  return (
    <div className="w-full flex flex-col justify-end h-full">
      {conversation.length === 0 && (
        <div className="mx-auto w-fit p-4 text-slate-700">
          <p>You haven&apos;t had any conversation with this user yet.</p>
        </div>
      )}
      <ScrollArea>
        <div className="flex flex-col justify-end gap-y-2 px-4 py-4 h-full shrink-1 overflow-scroll">
          {conversationElements.map((conversationElement, index) => {
            const { type } = conversationElement;
            // The user ID who originated this conversation element
            // (I.e. the user who sent the message or made the offer)
            return (
              <ConversationElementBubble
                key={`${conversationElement.type}-${conversationElement.id}`}
                otherUserId={otherUser.id}
                conversationElement={conversationElement}
                index={index}
              />
            );
          })}
          {otherUserIsTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex flex-row justify-start gap-x-2 px-10 text-sm"
            >
              <div className="my-auto w-2 h-2 bg-slate-500 rounded-full animate-bounce" />
              <p className="my-auto text-slate-700">Typing ...</p>
            </motion.div>
          )}
        </div>
        <div ref={bottomDivRef} />
      </ScrollArea>
      <div className="w-full h-fit p-4 border-t shrink-0">
        <Input
          value={message}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          placeholder="Send a message"
        />
      </div>
    </div>
  );
}
