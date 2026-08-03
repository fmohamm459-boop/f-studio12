import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { verifyOwnerCredentials } from "@/lib/owner-store";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        username: {
          label: "Username",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const owner = await verifyOwnerCredentials(
          String(credentials.username),
          String(credentials.password),
        );

        if (!owner) {
          return null;
        }

        return {
          id: owner.username,
          name: owner.name,
          username: owner.username,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/admin/login",
  },

  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name;
      }

      return session;
    },
  },
});
