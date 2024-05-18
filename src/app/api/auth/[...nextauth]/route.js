import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"
import KakaoProvider from "next-auth/providers/kakao"
import NaverProvider from "next-auth/providers/naver";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "../../../../lib/mongodb";
import bcrypt from 'bcrypt';

export const authOptions =({
  providers:[
    CredentialsProvider({
      name: "credentials",
      credentials: {
          email: { label: "Email", type: "email", placeholder: "test@test.com" },
          password: { label: "Password", type: "password" }
      },
      // Sign up 버튼을 누르면 들어오는 함수
      // 해당 부분에서 들어온 데이터를 가지고 인증을 진행하면 된다.
      // (지금은 무조건 인증되는 방식으로 처리되어있음)
      async authorize(credentials){
        const client = await clientPromise;
        const db = client.db('forum');
        let user = await db.collection('user_cred').findOne({email : credentials.email})
        if (!user) {
          console.log('해당 이메일은 없음');
          return null
        }
        const pwcheck = await bcrypt.compare(credentials.password, user.password);
        if (!pwcheck) {
          console.log('비번틀림');
          return null
        }
        return user
      }
  }),
  GoogleProvider({
    clientId:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
  }),
  KakaoProvider({
    clientId:process.env.KAKAO_CLIENT_ID,
    clientSecret:process.env.KAKAO_CLIENT_SECRET,
    authorization: {
      params: {
        redirect_uri: process.env.KAKAO_REDIRECT_URI,
      },
    },
  }),
  NaverProvider({
    clientId:process.env.NAVER_CLIENT_ID,
    clientSecret:process.env.NAVER_CLIENT_SECRET,
  }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    session: async ({ session, token }) => {
      session.user = token.user;  
      return session;
    },
    async jwt(token, user) {
      if (user) {
        token.user = {};
        token.user.name = user.name
        token.user.email = user.email
      }
      return token;
    }
  },
  pages: {
    signIn: "/login",
  },
  
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.NEXTAUTH_SECRET
})


const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }