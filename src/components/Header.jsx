'use client';

import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function Header() {
    const router = useRouter();
    const [isLoginPage, setIsLoginPage] = useState(false);

//   useEffect(() => {
//     console.log("Router is ready:", router.isReady);  // 로그 추가
//     console.log("Current path:", router.pathname);  // 로그 추가
//     if (router.isReady) {
//       setIsLoginPage(router.pathname === '/login');
//     }
//   }, [router.isReady, router.pathname]);

//   if (!router.isReady || isLoginPage) {
//     return null;
//   }

  return (
    <div className="header">
      <Link href="/main" passHref>
        <button className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition">
          홈
        </button>
      </Link>
      <LogoutButton />
    </div>
  );
}

export default Header;
