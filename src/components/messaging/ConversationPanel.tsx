"use client";
import { useState, useEffect, useRef, useTransition } from "react";
import { Input } from "@/components/ui/input";
import type { Conversation } from "@/lib/db/getConversationByUserId";
import ConversationElementBubble from "./ConversationElementBubble";
import sendMessage from "@/actions/sendMessage";
import startStopTyping from "@/actions/startStopTyping";
import markConversationSeen from "@/actions/markConversationSeen";
import { pusherClient } from "@/lib/pusher";
import { motion } from "framer-motion";
import { User } from "@prisma/client";
import { ScrollArea } from "../ui/scroll-area";

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
  const [lastKeyStroke, setLastKeyStroke] = useState<number>(0);
  const [conversationElements, setConversationElements] =
    useState<Conversation>(conversation);
  const bottomDivRef = useRef<HTMLDivElement>(null);

  // On initial page load, mark the messages as seen
  useEffect(() => {
    startTransition(async () => {
      await markConversationSeen(otherUser.id);
    });
  }, [otherUser.id]);

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
  }, [conversationElements, otherUserIsTyping]);

  // Listen to all pusher events
  // Remember, we do this for BOTH directions!
  // (Except for the typing channel.)
  useEffect(() => {
    const incomingChannel = pusherClient.getTwoWayChannel(
      otherUser.id,
      currentUser.id
    );
    const outgoingChannel = pusherClient.getTwoWayChannel(
      currentUser.id,
      otherUser.id
    );

    pusherClient.subscribeAndBind(incomingChannel, "isTyping", (isTyping) => {
      setOtherUserIsTyping(isTyping);
    });

    pusherClient.subscribeAndBind(incomingChannel, "message", (message) => {
      setConversationElements((conversationElements) => [
        ...conversationElements,
        {
          type: "message",
          ...message,
        },
      ]);
    });
    pusherClient.subscribeAndBind(outgoingChannel, "message", (message) => {
      setConversationElements((conversationElements) => [
        ...conversationElements,
        {
          type: "message",
          ...message,
        },
      ]);
    });

    pusherClient.subscribeAndBind(incomingChannel, "offer", (offer) => {
      setConversationElements((conversationElements) => [
        ...conversationElements,
        {
          type: "offer",
          ...offer,
        },
      ]);
    });
    pusherClient.subscribeAndBind(outgoingChannel, "offer", (offer) => {
      setConversationElements((conversationElements) => [
        ...conversationElements,
        {
          type: "offer",
          ...offer,
        },
      ]);
    });

    pusherClient.subscribeAndBind(
      incomingChannel,
      "offerUpdate",
      (offerUpdate) => {
        setConversationElements((conversationElements) => [
          ...conversationElements,
          {
            type: "offerUpdate",
            ...offerUpdate,
          },
        ]);
      }
    );
    pusherClient.subscribeAndBind(
      outgoingChannel,
      "offerUpdate",
      (offerUpdate) => {
        setConversationElements((conversationElements) => [
          ...conversationElements,
          {
            type: "offerUpdate",
            ...offerUpdate,
          },
        ]);
      }
    );

    return () => {
      pusherClient.unsubscribe(incomingChannel);
      pusherClient.unsubscribe(outgoingChannel);

      pusherClient.typedUnbind("offerUpdate");
      pusherClient.typedUnbind("offer");
      pusherClient.typedUnbind("message");
      pusherClient.typedUnbind("isTyping");
    };
  }, [otherUser, currentUser]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Backspace" && event.key !== "Enter") {
      setIsTyping(true);
      setLastKeyStroke(Date.now());
    }
    if (event.key === "Enter") {
      startTransition(async () => {
        await sendMessage({ toUserId: otherUser.id, message });
      });
      setMessage("");
      setIsTyping(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  useEffect(() => {
    if (isTyping) {
      startStopTyping({ isTyping: true, otherUserId: otherUser.id });
    } else {
      startStopTyping({ isTyping: false, otherUserId: otherUser.id });
    }
  }, [isTyping, otherUser.id]);

  // Always set isTyping to false 3 seconds after the last keystroke
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isTyping, lastKeyStroke]);

  return (
    <div className="w-full flex flex-col justify-end h-full">
      {conversation.length === 0 && (
        <div className="mx-auto w-fit p-4 text-slate-700">
          <p>You haven&apos;t had any conversation with this user yet.</p>
        </div>
      )}
      <ScrollArea>
        <div className="flex flex-col justify-end gap-y-3 px-4 py-4 h-full shrink-1 overflow-scroll max-w-5xl">
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
              exit={{ opacity: 0, y: -10 }}
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
          className="max-w-5xl rounded-full"
          value={message}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          placeholder="Send a message"
        />
      </div>
    </div>
  );
}
