import React from 'react';
import Link from 'next/link';

function HomePage() {
  return (
    <div>
      <h1>환영합니다!</h1>
      <ul>
        <li>
          <Link href="/accountBook"
            style={{ cursor: 'pointer' }}>가계부
          </Link>
        </li>
        <li>
          <Link href="/aiChat"
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