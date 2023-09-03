"use client";
import { useState, useEffect, useTransition } from "react";
import { Input } from "@/components/ui/input";
import type { Conversation } from "@/lib/db/getConversationByUserId";
import ConversationElementBubble from "./ConversationElementBubble";
import sendMessage from "@/actions/sendMessage";

export default function ConversationPanel({
  conversation,
  userId,
}: {
  conversation: Conversation; // This is confusing - in the future, this will be a union of offers and messages and other things
  userId: string; // The OTHER user's ID, not the current user
}) {
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState("");

  const [isPending, startTransition] = useTransition();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    setIsTyping(true);
    if (event.key === "Enter") {
      startTransition(async () => {
        await sendMessage({ toUserId: userId, message });
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
      console.log("This is where I would send a message to the server");
    } else {
      console.log("This is where I would send a message to the server");
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
    <div className="w-full h-full flex flex-col justify-end">
      {conversation.length === 0 && (
        <div className="mx-auto w-fit p-4 text-slate-700">
          <p>You haven&apos;t had any conversation with this user yet.</p>
        </div>
      )}
      <div className="flex flex-col justify-end gap-y-3 px-4 py-4">
        {conversation.map((conversationElement, index) => {
          const { type } = conversationElement;
          // The user ID who originated this conversation element
          // (I.e. the user who sent the message or made the offer)
          return (
            <ConversationElementBubble
              key={`${conversationElement.type}-${conversationElement.id}`}
              otherUserId={userId}
              conversationElement={conversationElement}
              index={index}
            />
          );
        })}
      </div>
      <div className="w-full h-fit p-3 border-t">
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
