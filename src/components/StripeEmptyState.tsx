"use client";
import { useTransition } from "react";
import setupStripe from "@/actions/setupStripe";
import EmptyState from "./EmptyState";
import { FaBusinessTime } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function StripeEmptyState() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStripeSetup = () => {
    console.log("in the callback");
    startTransition(async () => {
      console.log("setting up stripe");
      const url = await setupStripe();
      router.push(url);
    });
  };

  return (
    <EmptyState
      title="Set up your Business Account"
      subtitle="In order to receive payments from Green Tractor, you need to set up your business account."
      buttonText="Set Up Now"
      Icon={FaBusinessTime}
      buttonLoading={isPending}
      onClick={handleStripeSetup}
    />
  );
}
