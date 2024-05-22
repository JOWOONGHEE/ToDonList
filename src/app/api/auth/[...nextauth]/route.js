import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"
import KakaoProvider from "next-auth/providers/kakao"
import NaverProvider from "next-auth/providers/naver";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

import connectDB from "../../../../lib/mongodb";
import bcrypt from 'bcrypt';
const mongoose = require('mongoose');

export const authOptions =({
  providers:[
    CredentialsProvider({
      name: "credentials",
      credentials: {
          email: { label: "Email", type: "email", placeholder: "Email" },
          password: { label: "Password", type: "password", placeholder: "비밀번호" }
      },
      
      async authorize(credentials){
        const db = mongoose.connection.useDb('forum');
        console.log(db.databaseName);
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
    allowDangerousEmailAccountLinking: true, // 이전에 연동된 계정이 있어도 새로 연동할 수 있도록 함
  }),
  KakaoProvider({
    clientId:process.env.KAKAO_CLIENT_ID,
    clientSecret:process.env.KAKAO_CLIENT_SECRET,
    allowDangerousEmailAccountLinking: true,
  }),
  NaverProvider({
    clientId:process.env.NAVER_CLIENT_ID,
    clientSecret:process.env.NAVER_CLIENT_SECRET,
    allowDangerousEmailAccountLinking: true,
  }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ email, password }) {
      const user = await db.collection('user_cred').findOne({ email });
        if (!user) {
          return false;  // 사용자가 없으면 로그인 거부
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        return isPasswordCorrect;  // 비밀번호가 맞으면 true, 틀리면 false 반환
    },
    async jwt(token, user) {
      if (user) {
        token.user.email = user.email
      } 
      return token;
    },
    session: async ({ session, token }) => {
      if (token.user) {
        session.user = {
          email: token.user.email
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signUp: "/signup",
  },
  
  adapter: MongoDBAdapter(connectDB),
  database: process.env.MONGODB_URI,
  secret: process.env.NEXTAUTH_SECRET
})


const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }