import Page from "@/components/Page";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default async function FarmersPage() {
  const users = await prisma.user.findMany();
  return (
    <Page title="Farmers">
      <div className="flex flex-col gap-y-3 max-w-xl">
        {users.map((user) => {
          return (
            <div
              key={user.id}
              className="flex flex-row p-4 rounded-md border border-slate-200 shadow-sm"
            >
              {/* TODO: Figure out why Google images 403 sometimes. */}
              <Avatar className="mr-3 my-auto">
                <AvatarImage src={user.image!} />
                <AvatarFallback>{user.name?.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-y-1 my-auto">
                <h1 className="font-medium text-slate-900">{user.name}</h1>
                <h2 className="text-sm font-normal text-slate-700">
                  {user.region ? (
                    <span>{`${user.city}, ${user.region}`}</span>
                  ) : (
                    <span className="italic text-xs text-slate-500">
                      No Location
                    </span>
                  )}
                </h2>
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
}
