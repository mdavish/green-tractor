import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async redirect({ url, baseUrl }) {
      return "/dashboard";
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};

export async function getCurrentSession() {
  // This is a more lightweight function for when
  // you don't also need to do a database lookup
  // and the information on the token suffices
  const session = await getServerSession(authOptions);
  return session;
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session) return null;
  const currentUserEmail = session.user?.email!;
  const currentUser = await prisma.user.findUnique({
    where: { email: currentUserEmail },
  });
  return currentUser;
}
