"use client"
import React, { useState } from 'react';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { useRouter } from 'next/navigation';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const Signup = () => {
    
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    
    
    async function handleSubmit(event) {
        event.preventDefault();

        if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
            alert("이메일 형식이 올바르지 않습니다.");
            return;
        }
        if (password.length < 6) {
            alert('비밀번호는 6자 이상이어야 합니다.');
            return;
        }

        try {
            const response = await api.post('/signup', { email, password });
            if (response.status === 201) {
                console.log("회원가입 성공", response.data);
                alert("회원가입이 완료되었습니다.");
                router.push('/login');
            } else {
                console.error("회원가입 실패", response.status);
                alert("회원가입에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("회원가입 실패", error);
            if (error.response) {
                alert(`회원가입에 실패했습니다: ${error.response.data.error}`);
            } else {
                alert("회원가입 요청에 실패했습니다. 서버 연결을 확인해주세요.");
            }
        }
    };

    return (
        <main className='flex min-h-screen flex-col items-center bg-custom-green-light space-y-8 p-16 sm:p-8 md:p-12'>
            <h1 className='text-4xl font-bold text-black mb-6'>회원가입</h1>
            <form onSubmit={handleSubmit} className='w-full max-w-sm bg-white rounded-lg p-6 shadow-lg'>
                <div className="mb-4">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        onChange={e => setEmail(e.target.value)}
                        className="mt-4 block w-full rounded-md border px-4 py-2 border-custom-green bg-white placeholder-custom-green"
                    />
                </div>
                <div className="mb-6">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="비밀번호"
                        required
                        onChange={e => setPassword(e.target.value)}
                        className='mt-4 block w-full rounded-md border px-4 py-2 border-custom-green bg-white placeholder-custom-green'
                    />
                </div>
                <div className='mt-6'>
                    <button type="submit" className='w-full rounded-md bg-custom-green px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-custom-green focus:ring-opacity-50'>
                        회원가입
                    </button>
                </div>
            </form>
        </main>
    );
};

export default Signup;