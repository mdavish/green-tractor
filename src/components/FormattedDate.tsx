export default function FormattedDate({ date }: { date: Date | string }) {
  // If the date is a string
  // It may be of this format
  // 2023-09-03T16:51:22.495Z
  // And we need to parse it into a Date object
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  /* Follow the format 9/2/23 12:45 pm */
  return (
    <span className="text-xs text-slate-600 font-normal">
      {" "}
      {parsedDate.toLocaleString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "2-digit",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      })}
    </span>
  );
}
