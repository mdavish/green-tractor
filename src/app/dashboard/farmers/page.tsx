import Page from "@/components/Page";
import { prisma } from "@/lib/prisma";
import FarmerPreview from "@/components/FarmerPreview";

export default async function FarmersPage() {
  const users = await prisma.user.findMany();
  return (
    <Page title="Farmers">
      <div className="flex flex-col gap-y-3 max-w-xl">
        {users.map((user) => {
          return (
            <FarmerPreview
              key={user.id}
              {...user}
              className="flex flex-row p-4 rounded-md border border-slate-200 shadow-sm"
            />
          );
        })}
      </div>
    </Page>
  );
}
