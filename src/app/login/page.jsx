"use client"
import React, { useRef } from 'react';
import { signIn, signOut, useSession, getProviders } from 'next-auth/react';
// import '../globals.css';

const Login = () => {
    
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const { data: session, status } = useSession();

    const handleSubmit = async (event) => {
        event.preventDefault();
        const email = emailRef.current.value;
        const password = passwordRef.current.value;
        signIn("credentials", { email, password });
    };

    if (status === 'loading') {
        return <p>Loading....</p>;
    }
    if (status === 'authenticated') {
        return <button onClick={() => signOut()}>로그아웃</button>;
    }
    return (
        <main className='flex min-h-screen flex-col items-center space-y-10 p-24'>
            <h1 className='text-4xl font-sans'>로그인</h1>
            <div>
                <div>
                    
                    <div className='mt-1'>
                        <input
                            ref={emailRef}
                            id='email'
                            name='email'
                            type='email'
                            required
                            autoFocus={true}
                            placeholder='Email'
                            className='mt-2 block w-full rounded-md border bg-white px-4 py-2 text-gray-7000 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-blue-300'
                        />
                    </div>
                </div>

                <div className='mt-4'>
                    
                    <div className='mt-1'>
                        <input
                            type='password'
                            id='password'
                            name='password'
                            ref={passwordRef}
                            placeholder='비밀번호'
                            className='mt-2 block w-full rounded-md border bg-white px-4 py-2 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-blue-300'
                        />
                    </div>
                </div>

                <div className='mt-6'>
                    <button
                        onClick={handleSubmit}
                        className='w-full transform rounded-md bg-gray-700 px-4 py-2 tracking-wide text-white transition-colors duration-200 hover:bg-gray-600 focus:bg-gray-600 focus:outline-none'
                    >
                        로그인
                    </button>
                </div>
            </div>
            <p>계정이 없으신가요? <a href="/signup" className="text-blue-500 hover:text-blue-700">회원가입</a></p>
            <div className="flex flex-col space-y-4 justify-center items-center">
            {/* 구글 로그인 */}
            <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <button className="flex items-center bg-white dark:bg-gray-300 border border-gray-100 rounded-lg shadow-md px-3 py-3 text-sm text-gray-800 dark:text-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 h-12 w-48">
                    <img src="/google_login.svg" alt="Google" className="w-5 h-5 mr-6" />
                    <span className='ml-3 font-semibold font-kakao'>구글 로그인</span>
                </button>
            </div>
            {/* 카카오 로그인 */}
            <button onClick={() => signIn("kakao")} className="flex justify-center items-center w-full">
                <img src="/assets/kakao_login2.png" alt="Kakao" className="w-48 h-12"/>
            </button>              
            {/* 네이버 로그인 */}
            <button onClick={() => signIn("naver")} className="flex justify-center items-center w-full">
                <img src="/assets/naver_login2.png" alt="Naver" className="w-48 h-12" />
            </button>
                        
        </div>
        </main>
    );
};

export default Login;