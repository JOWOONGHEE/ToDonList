"use client"
import React, { useState } from 'react';
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { useNavigate } from 'react-router-dom';
import { useRouter } from 'next/navigation';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });


const Signup = () => {
    
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const api = axios.create({
      baseURL: 'http://localhost:5000/api'
    });
    
    // 이제 api 인스턴스를 사용하여 요청을 보낼 때, baseURL이 자동으로 적용됩니다.
    //api.post('/auth/signup', { email, password });
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
        // 요청 데이터 로깅
        console.log("Sending data:", { email, password });

        try {
            const response = await api.post('/signup', { email, password });
            if (response.status === 201) {
                console.log("회원가입 성공", response.data);
                // 추가적인 성공 처리 로직, 예: 페이지 리다이렉션
                alert("회원가입이 완료되었습니다.");
                router.push('/login');
            } else {
                console.error("회원가입 실패", response.status);
                alert("회원가입에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("회원가입 실패", error);
            if (error.response) {
                // 서버 응답이 있는 경우
                alert(`회원가입에 실패했습니다: ${error.response.data.error}`);
            } else {
                // 서버 응답이 없는 경우
                alert("회원가입 요청에 실패했습니다. 서버 연결을 확인해주세요.");
            }
        }
    };

    return (
        <main className='flex min-h-screen flex-col items-center space-y-10 p-24'>
            <h1 className='text-4xl font-semibold'>회원가입</h1>
                <form onSubmit={handleSubmit} >
                    <div className="mb-4">
                        
                        <div className='mt-1'>
                            <input id="email" name="email" type="email" placeholder="Email" required
                               onChange={e => setEmail(e.target.value)}
                               className="mt-2 block w-full rounded-md border bg-white px-4 py-2 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-blue-300"/>
                        </div>
                    </div>
                    <div className="mb-6">
                        
                        <div className='mt-1'>
                            <input id="password" name="password" type="password" placeholder="비밀번호" required
                                onChange={e => setPassword(e.target.value)}
                                className='mt-2 block w-full rounded-md border bg-white px-4 py-2 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:focus:border-blue-300'/>
                        </div>
                    </div>
                    <div className='mt-6'>
                        <button type="submit" className='w-full transform rounded-md bg-gray-700 px-4 py-2 tracking-wide text-white transition-colors duration-200 hover:bg-gray-600 focus:bg-gray-600 focus:outline-none'>
                            회원가입
                        </button>
                    </div>
                </form>
        </main>
    );
};

export default Signup;