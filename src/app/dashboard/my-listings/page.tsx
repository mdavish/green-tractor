import Page from "@/components/Page";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MyListingsPage() {
  return (
    <Page title="My Listings">
      <Link href="/dashboard/listings/new">
        <Button>List a New Item</Button>
      </Link>
    </Page>
  );
}
