import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"
import KakaoProvider from "next-auth/providers/kakao"
import NaverProvider from "next-auth/providers/naver";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

import connectDB from "../../../../lib/mongodb.js";
import bcrypt from 'bcrypt';
const mongoose = require('mongoose');

export const authOptions =({
  
  providers:[
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
          email: { label: "Email", type: "email", placeholder: "Email" },
          password: { label: "Password", type: "password", placeholder: "비밀번호" }
      },
      
      async authorize(credentials){
        console.log('Received credentials:', credentials);
        try {
          await connectDB();
          const db = mongoose.connection.useDb('forum');
          let user = await db.collection('user_cred').findOne({ email: credentials.email });
          if (!user) {
            console.log('No user found with that email');
            return null;
          }
          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          console.log('Password verification result:', isPasswordCorrect);
          if (!isPasswordCorrect) {
            console.log('Incorrect password');
            return null;
          }
          return user;
        } catch (error) {
          console.error('Error in authorize function:', error);
          return null;
        }
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
    session: async (session, user) => {
      session.user.email = user.email; // DB에서 이메일을 가져와 세션에 추가
      return session;
    },
    async signIn({ user, account, profile, email, credentials, password }) {
      // SNS 로그인 처리
      if (account && account.provider) {
        // SNS 제공자에 따른 추가적인 검증이 필요하다면 여기에 로직 추가
        return true;  // SNS 로그인은 기본적으로 성공으로 간주
      }
    
      // 이메일과 비밀번호를 사용한 로그인 처리
      if (email && password) {
        console.log(db.databaseName);
        const userDB = await db.collection('user_cred').findOne({ email });
        if (!userDB) {
          return false;  // 사용자가 없으면 로그인 거부
        }
        const isPasswordCorrect = await bcrypt.compare(password, userDB.password);
        return isPasswordCorrect;  // 비밀번호가 맞으면 true, 틀리면 false 반환
      }
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
  
  // adapter: MongoDBAdapter(connectDB),
  database: process.env.MONGODB_URI,
  secret: process.env.NEXTAUTH_SECRET
})


const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }