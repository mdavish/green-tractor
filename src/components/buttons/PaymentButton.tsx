import { Button } from "../ui/button";
import { FetchedOfferUpdateWithType } from "@/lib/db/getConversationByUserId";
import { useTransition } from "react";
import createCheckoutSession from "@/actions/createCheckoutSession";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

export default function PaymentButton(props: FetchedOfferUpdateWithType) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();
  return (
    <Button
      onClick={() => {
        startTransition(async () => {
          try {
            const response = await createCheckoutSession({
              offerUpdate: props,
              successUrl: window.location.href,
              cancelUrl: window.location.href,
            });
            if (response.status === "error") {
              toast({
                title: "Error",
                description: response.message,
                variant: "destructive",
              });
            } else if (response.status === "success") {
              if (response.session?.url) {
                router.push(response.session.url);
              } else {
                toast({
                  title: "Error",
                  description: "Something went wrong. Please try again later.",
                  variant: "destructive",
                });
              }
            }
          } catch (err) {
            toast({
              title: "Error",
              description: "Something went wrong. Please try again later.",
              variant: "destructive",
            });
          }
        });
      }}
      className="w-full max-w-sm"
    >
      Proceed to Payment
    </Button>
  );
}
