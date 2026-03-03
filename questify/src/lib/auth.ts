import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
  },
  providers: [
    // Phase 1 使用简化的 Demo 用户
    CredentialsProvider({
      name: "Demo User",
      credentials: {},
      async authorize() {
        // 自动创建或获取 demo 用户
        let user = await prisma.user.findUnique({
          where: { email: "demo@questify.app" },
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: "demo@questify.app",
              name: "Demo 冒险者",
            },
          })

          // 创建角色
          await prisma.character.create({
            data: {
              userId: user.id,
              name: "冒险者",
              avatar: "default",
            },
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}
