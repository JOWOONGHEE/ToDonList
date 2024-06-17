"use client";
import Authprovider from '@/components/Authprovider/Authprovider';
import './globals.css';
import { Inter } from 'next/font/google';
import AuthContext from '@/context/AuthContext';
import Axios from 'axios';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const Header = dynamic(() => import('@/components/Header'), { ssr: false });

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'To-Don List',
  description: 'To-Don List',
};

export default function RootLayout({ children }) {
  Axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/api";
  Axios.defaults.withCredentials = true;

  const pathname = usePathname(); // 현재 경로 가져오기
  const isExcludedPage = pathname === '/' || pathname === '/login' || pathname === '/signup';

  return (
    <html>
      <body className={inter.className}>
        <AuthContext>
          <Authprovider>
            {!isExcludedPage && <Header />}
            {children}
          </Authprovider>
        </AuthContext>
      </body>
    </html>
  );
}

export function Page() {
  return <h1>Hello, Next.js!</h1>;
}