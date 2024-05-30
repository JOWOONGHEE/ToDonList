'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      className="bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition"
      onClick={() => signOut({ callbackUrl: '/login' })}
    >
      로그아웃
    </button>
  );
}