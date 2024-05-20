import Authprovider from '@/components/Authprovider/Authprovider'
import './globals.css'
import { Inter } from 'next/font/google'
import AuthContext from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'To-Don List',
  description: 'To-Don List',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      
      <body className={inter.className}>
        
        <AuthContext>
        <Authprovider>
        {children}
        </Authprovider>
        </AuthContext>
        </body>
    </html>
  )
}
