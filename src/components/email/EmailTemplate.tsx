import {
  Tailwind,
  Html,
  Head,
  Preview,
  Section,
  Row,
  Column,
  Img,
  Heading,
  Text,
  Hr,
  Container,
  Body,
} from "@react-email/components";
import { Markdown } from "@react-email/markdown";
import cn from "./emailCn";
interface EmailTemplateProps {
  headline: string;
  subheader?: string;
  children: React.ReactNode;
  className?: string;
  previewText: string;
}

export default function EmailTemplate({
  headline = "Sample Email!",
  subheader = "This is a sample email.",
  children,
  className,
  previewText,
}: EmailTemplateProps) {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              primary: "#16a34a",
            },
          },
        },
      }}
    >
      <Head>
        {/* Omitting for now because you can only have one font */}
        {/* <Font
          fontFamily="Patua One"
          fallbackFontFamily="Times New Roman"
          webFont={{
            url: "https://fonts.gstatic.com/s/patuaone/v20/ZXuke1cDvLCKLDcimxB44_luFgxbuQ.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="Normal"
        /> */}
      </Head>
      <Preview>{previewText}</Preview>
      <Html>
        <Body className="bg-white my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] w-[640px]">
            <Section
              className={cn(
                "bg-white font-sans w-full h-full flex text-slate-900",
                className
              )}
            >
              <Section className="mx-auto my-auto w-full h-3/4 max-w-3xl border border-slate-200 rounded-md p-4 flex flex-col gap-y-5">
                <Row className="flex flex-row gap-x-2">
                  <Column>
                    <Img
                      className="my-auto"
                      // This always needs to be a PNG!
                      src="https://www.greentractor.us/logoGreen.png"
                      width={50}
                      height={30}
                    />
                  </Column>
                  <Column>
                    <Text className="text-xl my-auto text-primary font-serif font-bold p-1">
                      Green Tractor
                    </Text>
                  </Column>
                </Row>
                <Heading className="text-2xl font-medium">{headline}</Heading>
                <Markdown>{`${subheader}`}</Markdown>
                <Section className="w-full">{children}</Section>
                <Hr />
                <Section className="w-full pt-3 border-slate-200 text-slate-700 text-sm flex flex-col gap-y-2">
                  <Row>Green Tractor</Row>
                  <Row>205 President Street</Row>
                  <Row>Brooklyn, NY, 11231</Row>
                </Section>
              </Section>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
