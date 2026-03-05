import NextAuth from "next-auth"
import "next-auth/jwt"

import GitHub from "next-auth/providers/github"
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import Notion from "next-auth/providers/notion"
import { db } from "./db"
import { credits } from "./db/schema"

// Utility functions
const createId = () => crypto.randomUUID();

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: !!process.env.AUTH_DEBUG,
  theme: { logo: "https://authjs.dev/img/logo-sm.png" },
  adapter: DrizzleAdapter(db),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Notion({
      clientId: process.env.AUTH_NOTION_ID,
      clientSecret: process.env.AUTH_NOTION_SECRET,
      redirectUri: process.env.AUTH_NOTION_REDIRECT_URI as string,
      allowDangerousEmailAccountLinking: true,
      token: {
        url: "https://api.notion.com/v1/oauth/token",
        async conform(response: Response) {
          const body = await response.json();
          body.refresh_token = '1234567890';
          return new Response(JSON.stringify(body), response);
        },
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  basePath: "/api/auth",
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl
      if (pathname === "/middleware-example") return !!auth
      return true
    },
    jwt({ token, trigger, session, account }) {
      if (trigger === "update") token.name = session.user.name
      if (account?.provider === "keycloak") {
        return { ...token, accessToken: account.access_token }
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        // @ts-expect-error
        id: token.sub,
        // @ts-expect-error
        username: token?.user?.username || token?.user?.gh_username,
      };
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.email) throw Error("Provider did not forward email but it is required");

      const userId = user.id || createId();

      if (process.env.DISABLE_SIGNUP) {
        const adminEmails = process.env.ADMIN_EMAIL?.split(",") || [];
        if (!adminEmails.includes(user.email)) {
          throw Error("New users are forbidden");
        }
      }

      await db.insert(credits).values({
        userId,
        totalCredits: 0,
        usedCredits: 0,
      });
    },
  },
  experimental: { enableWebAuthn: true },
})

declare module "next-auth" {
  interface Session {
    accessToken?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
  }
}
