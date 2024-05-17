"use client"
import React, { useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

const Login = () => {
    const { data: session, status } = useSession();

    // useEffect(() => {
    //     if (status === 'authenticated') {
    //         // 로그아웃 로직을 여기에 배치
    //     }
    // }, [status]); // status가 변경될 때만 이펙트 실행

    if (status === 'loading') {
        return <p>Loading....</p>;
    }
    if (status === 'authenticated') {
        return <button onClick={() => signOut()}>Logout</button>;
    }
    return (
        <div>
            Not signed in <br />
            <button onClick={() => signIn()}>Sign in</button>
            <div>
                <button onClick={() => signIn("google")}>Login with Google</button>
            </div>
        </div>
    );
};

export default Login;