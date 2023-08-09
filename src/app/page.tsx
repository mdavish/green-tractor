"use client";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTransition } from "react";
import joinWaitlist from "@/actions/joinWaitlist";
import { useToast } from "@/components/ui/use-toast";
import { signIn } from "next-auth/react";

export default function Home() {
  const { toast } = useToast();

  const formSchema = z.object({
    email: z.string().email(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const [isPending, startTransition] = useTransition();

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        await joinWaitlist(values);
        toast({
          title: "Success",
          description: "You've been added to the waitlist!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again later.",
          variant: "destructive",
        });
      } finally {
        form.reset();
      }
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-y-6 p-24">
      <div className="max-w-md flex flex-col gap-y-4">
        <h1 className="text-7xl text-center">🚜</h1>
        <h1 className="mx-auto text-4xl font-bold">Green Tractor</h1>
        <p className=" text-center">
          Green Tractor makes it easy to buy and sell farm equipment, seeds, and
          more.
        </p>
        <Button className="w-fit mx-auto" onClick={() => signIn()}>
          Sign In
        </Button>
      </div>
    </main>
  );
}
