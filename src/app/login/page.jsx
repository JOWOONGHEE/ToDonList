"use client"
import React, { useRef, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';


const Login = () => {
    
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const { data: sessionData, status: sessionStatus } = useSession();
    const router = useRouter();

    console.log("세션 데이터:", sessionData);
    console.log("인증 상태:", sessionStatus);

    const handleSignIn = async (provider) => {
        console.log('로그인 시도:', provider);
        const res = await signIn(provider, { callbackUrl: '/main' });
        console.log('로그인 응답:', res);
        if (res?.ok) {
            router.push('/main');
        } else {
            console.error('로그인 실패');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const email = emailRef.current.value;
        const password = passwordRef.current.value;

        const res = await signIn("credentials",{
            redirect: false,
            email, 
            password
        });
        
        if (res?.ok) {
            router.push('/main');
        } else {
            console.error("로그인 실패");
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

    // if (status === 'loading') {
    //     return <p>Loading....</p>;
    // }
    // if (status === 'authenticated') {
    //     router.push('/main');
    //     return <button onClick={() => signOut()}>로그아웃</button>;
    // }
    return (
        <main className='flex min-h-screen flex-col items-center space-y-8 p-16 sm:p-8 md:p-12 lg:p-24'>
            <h1 className='text-4xl'>로그인</h1>
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
            <button onClick={() => signOut({ callbackUrl: '/login' })}>
                로그아웃
            </button>
            {/* 회원가입 */}
            <p className="whitespace-nowrap">계정이 없으신가요? <a href="/signup" className="text-blue-500 hover:text-blue-700">회원가입</a></p>
            {/* 소셜 로그인 */}
            <div className="flex items-center justify-center my-4 h-1 w-full">
                <div className="w-24 border-t-2 border-black"></div>
                <span className="mx-4 text-black-900">OR</span>
                <div className="w-24 border-t-2 border-black"></div>
            </div>
            <div className="flex flex-col space-y-3 justify-center items-center">
            {/* 구글 로그인 */}
            <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <button onClick={() => handleSignIn("google")} className="flex items-center bg-white dark:bg-gray-300 rounded-lg shadow-md px-3 py-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-gray-500 h-12 w-60">
                    <img src="/google_login.svg" alt="Google" className="w-5 h-5 mr-11" />
                    <span className='ml-3 font-semibold font-kakao'>구글     로그인</span>
                </button>
            </div>
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

export default Login;