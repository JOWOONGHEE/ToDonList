'use client';

import Link from 'next/link';
import LogoutButton from './LogoutButton';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function Header() {
    const pathname = usePathname();
    const [headerClasses, setHeaderClasses] = useState('py-2 px-4 transition flex items-center bg-white text-black'); // 초기 클래스 상태 설정

    useEffect(() => {
        // 페이지 경로에 따라 headerClasses 상태 업데이트
        if (pathname === '/accountbook' || pathname === '/aichat') {
            setHeaderClasses('py-2 px-4 transition flex items-center bg-custom-green-light text-white ');
        } else {
            setHeaderClasses('py-2 px-4 transition flex items-center bg-white text-black');
        }
    }, [pathname]); // pathname이 변경될 때마다 useEffect 실행
  
    return (
        <div className={headerClasses}>
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