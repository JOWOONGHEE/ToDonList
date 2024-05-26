"use client"
import React, { useRef, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import axios from 'axios';

export default function Login() {
    
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const { data: sessionData, status: sessionStatus } = useSession();
    const router = useRouter();
    const api = axios.create({
        baseURL: 'http://localhost:5000/api'
      });
      

    console.log("세션 데이터:", sessionData);
    console.log("인증 상태:", sessionStatus);

    const handleSignIn = async (provider) => {
        console.log('로그인 시도:', provider);
        const res = await signIn(provider, { 
            redirect: false,
            email: emailRef.current.value,
            password: passwordRef.current.value
        });
        console.log('로그인 응답:', res);
        if (res?.ok) {
            router.push('/main');
        } else {
            console.error('로그인 실패');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("로그인 시도");
        console.log(emailRef.current.value);
        console.log(passwordRef.current.value);
        const email = emailRef.current.value;
        const password = passwordRef.current.value;

        try {
            const result = await signIn('credentials', {
              redirect: false,
              email,
              password
            });
        
            if (result.error) {
              console.error('로그인 실패:', result.error);
              alert('로그인 실패: ' + result.error);
            } else {
              console.log('로그인 성공');
              router.push('/main'); // 성공 시 메인으로 리디렉션
            }
          } catch (error) {
            console.error('로그인 처리 중 오류 발생:', error);
            alert('로그인 처리 중 오류 발생');
          }
    };

    useEffect(() => {
        if (sessionStatus === 'loading') {
            console.log("로딩중입니다.");
        }
        if (sessionStatus === 'authenticated') {
            router.push('/main');
        }
      }, [sessionStatus, router]);

    return (
        <main className='flex min-h-screen flex-col items-center bg-custom-green-light space-y-8 p-16 sm:p-8 md:p-12'>
            <h1 className='text-4xl font-bold text-black mb-6'>To-Don List</h1>
            <form className='w-full h-full max-w-sm bg-white rounded-lg p-6 shadow-lg'>
                <input
                    ref={emailRef}
                    id='email'
                    name='email'
                    type='email'
                    required
                    autoFocus={true}
                    placeholder='Email'
                    className='mt-4 block w-full rounded-md border px-4 py-2 border-custom-green bg-white placeholder-custom-green'
                />
                <input
                    type='password'
                    id='password'
                    name='password'
                    ref={passwordRef}
                    placeholder='비밀번호'
                    className='mt-4 block w-full rounded-md border px-4 py-2 border-custom-green bg-white placeholder-custom-green'
                />
                <button
                    onClick={handleSubmit}
                    className='mt-6 w-full rounded-md bg-custom-green px-4 py-2 text-white hover:bg-custom-green-light focus:outline-none focus:ring-2 focus:ring-custom-green focus:ring-opacity-50'
                >
                로그인
                </button>
            
            </form>
            {/* 회원가입 */}
            <p className="whitespace-nowrap">계정이 없으신가요? <a href="/signup" className="ml-1 text-blue-700 hover:text-blue-700">회원가입</a></p>
            {/* 소셜 로그인 */}
            <div className="flex items-center justify-center my-4 h-1 w-full">
                <div className="w-24 border-t-2 border-black"></div>
                <span className="mx-4 text-black-900">OR</span>
                <div className="w-24 border-t-2 border-black"></div>
            </div>
            <div className="flex flex-col space-y-3 justify-center items-center">
            {/* 구글 로그인 */}
                <button onClick={() => handleSignIn("google")} className="flex items-center bg-white dark:bg-gray-300 rounded-lg shadow-md px-3 py-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-gray-500 h-12 w-60">
                    <img src="/google_login.svg" alt="Google" className="w-5 h-5 mr-11" />
                    <span className='ml-3 font-semibold font-kakao'>구글     로그인</span>
                </button>
            {/* 카카오 로그인 */}
            <button onClick={() => handleSignIn("kakao")} className="flex items-center justify-start bg-yellow-300 dark:bg-yellow-600 rounded-lg shadow-md px-2 py-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-gray-600 h-12 w-60">
                <img src="/assets/kakao_logo.png" alt="Kakao" className="w-7 h-7 mr-9" />
                <span className='ml-3 font-semibold'>카카오 로그인</span>
            </button>
            {/* 네이버 로그인 */}
            <button onClick={() => handleSignIn("naver")} className="flex items-center justify-start bg-green-500 dark:bg-green-700 rounded-lg shadow-md px-1 py-3 text-sm text-white dark:text-white focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-gray-600 h-12 w-60">
                <img src="/assets/naver_logo.png" alt="Naver" className="w-9 h-9 mr-8" />
                <span className='ml-3 font-semibold'>네이버 로그인</span>
            </button>
            </div>
        </main>
    );
};
