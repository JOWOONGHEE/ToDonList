import Image from 'next/image'
import styles from './page.module.css'
import React from 'react';
import Link from 'next/link';


function HomePage() {
  
  return (
    <div>
      <h1>환영합니다!</h1>
      <ul>
        <li>
          <Link href="/accountbook"
            style={{ cursor: 'pointer' }}>가계부
          </Link>
        </li>
        <li>
          <Link href="/aichat"
            style={{ cursor: 'pointer' }}>ai챗
          </Link>
        </li>
        <li>
          <Link href="/login"
            style={{ cursor: 'pointer' }}>로그인
          </Link>
        </li>
        <li>
          <Link href="/main"
            style={{ cursor: 'pointer' }}>메인
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default HomePage;

