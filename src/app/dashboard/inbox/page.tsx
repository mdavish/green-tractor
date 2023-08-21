import EmptyState from "@/components/EmptyState";
import { FaInbox } from "react-icons/fa";

export default function InboxPage() {
  return (
    <div className="mx-auto my-auto">
      <EmptyState
        className="mx-auto my-auto"
        Icon={FaInbox}
        subtitle="You don't have any conversations yet"
        title="Inbox"
      />
    </div>
  );
}
