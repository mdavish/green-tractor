import { ExpandedOffer } from "@/lib/prisma";
import { EmailTemplate } from "./EmailTemplate";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import FormattedDate from "@/components/FormattedDate";

export default function OfferEmail({
  offer,
  className,
}: {
  offer: ExpandedOffer;
  className?: string;
}) {
  return (
    <EmailTemplate
      className={className}
      headline="You received a new offer on your listing!"
      subheader={
        <>
          Congratulations! You received an offer for ${offer.offerPrice} on your
          listing{" "}
          <a
            className="text-blue-600 hover:underline"
            href={`/dashboard/listings/${offer.listingId}`}
          >
            {offer?.listing.title}
          </a>
          .
        </>
      }
    >
      <div className="flex flex-row gap-x-3 border border-slate-200 rounded-md p-4">
        <Avatar>
          <AvatarImage
            src={offer.offerUser.image!}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback />
        </Avatar>
        <div className="flex flex-col gap-y-1 text-sm">
          <div className="font-medium text-slate-800">
            {offer.offerUser.name} <FormattedDate date={offer.offerDate} />
          </div>
          <div>{offer.offerMessage}</div>
        </div>
      </div>
      <Button asChild>
        <a href={`/dashboard/inbox/${offer.offerUser.id}`}>View Offer</a>
      </Button>
    </EmailTemplate>
  );
}
