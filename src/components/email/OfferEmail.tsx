import EmailTemplate from "./EmailTemplate";
import { ExpandedOffer } from "@/lib/prisma";
import {
  Img,
  Column,
  Row,
  Text,
  Section,
  Container,
} from "@react-email/components";
import { sampleOffer, sampleUser } from "./sampleData";
import FormattedDate from "./EmailDate";
import Button from "./EmailButton";

OfferEmail.PreviewProps = { offer: sampleOffer };

function OfferEmail({
  offer = sampleOffer,
  className,
}: {
  offer: ExpandedOffer;
  className?: string;
}) {
  return (
    <EmailTemplate
      className={className}
      headline="You received a new offer on your listing!"
      previewText={`You received a new offer on your listing!`}
      subheader={`Congratulations! You received an offer for $${offer.offerPrice.toLocaleString()} on your your [listing](https://www.greentractor.us/dashboard/listings/${
        offer.listingId
      }).`}
    >
      <Container
        align="center"
        className="border border-solid border-slate-200 rounded-md p-3 my-3 w-fit mx-auto"
      >
        <Row className="">
          <Img
            src={offer.offerUser.image!}
            width={40}
            height={40}
            className="rounded-full"
          />
        </Row>
        <Column className="flex flex-col text-sm p-3 gap-y-1">
          <Text className="">
            <span className="font-medium text-slate-800">
              {offer.offerUser.name} <FormattedDate date={offer.offerDate} />
            </span>
            <br />
            <span>{offer.offerMessage}</span>
          </Text>
        </Column>
      </Container>
      <Section className="text-center">
        <Button
          href={`https://greentractor.us/dashboard/inbox/${offer.offerUser.id}`}
        >
          View Offer
        </Button>
      </Section>
    </EmailTemplate>
  );
}

export default OfferEmail;
