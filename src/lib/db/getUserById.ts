import { prisma } from "../prisma";

export default async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  if (!user) {
    throw new Error(`User ${id} not found`);
  }
  return user;
}
