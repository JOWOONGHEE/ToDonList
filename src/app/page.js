"use client"

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './signup/page.jsx'; // Signup 컴포넌트 경로를 맞춰주세요
import Login from './login/page.jsx'; // Login 컴포넌트 경로를 맞춰주세요
import './globals.css';

function Home() {
  return (
    // <SessionProvider session={session}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    // </SessionProvider>
  );
}


export default Home;

// function MyApp({ Component, pageProps }) {
  
//   const { data: session, status } = useSession();

//   return (
//     <>
//       <SessionProvider session={session}>
//         <Login />
//         <Component {...pageProps} />
//       </SessionProvider>
//     </>
//   );
// }

// export default MyApp;


