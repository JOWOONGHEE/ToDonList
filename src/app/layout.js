import Authprovider from '@/components/Authprovider/Authprovider'
import './globals.css'
import { Inter } from 'next/font/google'
import AuthContext from '@/context/AuthContext';
import Axios from 'axios';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'To-Don List',
  description: 'To-Don List',
}

export default function RootLayout({ children }) {
  Axios.defaults.baseURL = process.env.NEXT_PUBLIC_SERVER_BASE_URL + "/api"; 
  Axios.defaults.withCredentials = true;

  return (
    <html>
      <body className={inter.className}>
        <AuthContext>
          <Authprovider>
            <div className="header">
              <Link href="/main" passHref>
                <button className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition">
                  홈
                </button>
              </Link>
              <LogoutButton />
            </div>
            
            {children}
          </Authprovider>
        </AuthContext>
      </body>
    </html>
  )
}

export function Page() {
  return <h1>Hello, Next.js!</h1>;
}
