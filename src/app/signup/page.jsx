"use client"
import React, { useState } from 'react';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { useRouter } from 'next/navigation';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

export default function SignUp() {
    
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // 추가된 부분
    const [isCodeSent, setIsCodeSent] = useState(false);
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    
    async function handleSendCode(event) {
        event.preventDefault();
        if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
            alert("이메일 형식이 올바르지 않습니다.");
            return;
        }

        try {
            const response = await api.post('/sendVerification', { email });
            if (response.status === 201) {
                console.log("인증번호 전송 성공", response.data);
                alert("인증번호가 이메일로 전송되었습니다.");
                setIsCodeSent(true);
            } else {
                console.error("인증번호 전송 실패", response.status);
                alert("인증번호 전송에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("인증번호 전송 실패", error);
            alert("인증번호 전송 요청에 실패했습니다. 서버 연결을 확인해주세요.");
        }
    }

    async function handleVerifyCode(event) {
        event.preventDefault();
        if (!verificationCode) {
            alert('인증번호를 입력해주세요.');
            return;
        }

        try {
            const response = await api.post('/verifyCode', { email, verificationCode });
            if (response.status === 200) {
                console.log("인증번호 확인 성공", response.data);
                alert("인증번호가 확인되었습니다.");
            } else {
                console.error("인증번호 확인 실패", response.status);
                alert("인증번호 확인에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("인증번호 확인 실패", error);
            alert("인증번호 확인 요청에 실패했습니다. 서버 연결을 확인해주세요.");
        }
    }
    
    async function handleSubmit(event) {
        event.preventDefault();
        if (!verificationCode) {
            alert('인증번호를 입력해주세요.');
            return;
        }
        if (password.length < 6) {
            alert('비밀번호는 6자 이상이어야 합니다.');
            return;
        }
        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const response = await api.post('/verifyPassword', { email, verificationCode, password });
            if (response.status === 200) {
                console.log("회원가입 성공", response.data);
                alert("회원가입이 완료되었습니다.");
                router.push('/login');
            } else {
                console.error("회원가입 실패", response.status);
                alert("회원가입에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("회원가입 실패", error);
            alert("회원가입 요청에 실패했습니다. 서버 연결을 확인해주세요.");
        }
    }

    return (
        <main className='flex min-h-screen flex-col items-center bg-custom-green-light space-y-8 p-16 sm:p-8 md:p-12'>
        <h1 className='text-4xl font-bold text-black mb-6'>회원가입</h1>
        <div className='w-full max-w-lg bg-white rounded-lg p-6 shadow-lg'>
        <form onSubmit={handleSendCode} className='space-y-4'>
          <div className="mb-2 flex items-center">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email"
              required
              onChange={e => setEmail(e.target.value)}
              className="flex-grow block rounded-md border px-4 py-2 border-custom-green bg-white placeholder-custom-green w-full"
            />
            <button type="submit" className='ml-2 rounded-md bg-custom-green px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-custom-green-light focus:ring-opacity-50 whitespace-nowrap'>
              전송
            </button>
          </div>
        </form>
        <form onSubmit={handleSubmit} className='space-y-4 mt-4'>
          <div className="mb-4 flex items-center">
            <input
              id="verificationCode"
              name="verificationCode"
              type="text"
              placeholder="인증번호"
              required
              onChange={e => setVerificationCode(e.target.value)}
              className="flex-grow block rounded-md border px-4 py-2 border-custom-green bg-white placeholder-custom-green w-full"
            />
            <button type="button" onClick={handleVerifyCode} className='ml-2 rounded-md bg-custom-green px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-custom-green-light focus:ring-opacity-50 whitespace-nowrap'>
              확인
            </button>
          </div>
          <div className="mb-4">
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
          <div className="mb-6">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="비밀번호 확인"
              required
              onChange={e => setConfirmPassword(e.target.value)}
              className='mt-4 block w-full rounded-md border px-4 py-2 border-custom-green bg-white placeholder-custom-green'
            />
          </div>
          <div className='mt-6'>
            <button type="submit" className='w-full rounded-md bg-custom-green px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-custom-green-light focus:ring-opacity-50'>
              회원가입
            </button>
          </div>
        </form>
        </div>
    </main>
    );
};
