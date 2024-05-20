import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './signup/page.jsx'; // Signup 컴포넌트 경로를 맞춰주세요
import Login from './login/page.jsx'; // Login 컴포넌트 경로를 맞춰주세요
import './globals.css';
import { useSession, SessionProvider } from 'next-auth/react';

function MyApp() {
  const { data: session } = useSession();

  return (
    <SessionProvider session={session}>
      <Router>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </SessionProvider>
  );
}

import './globals.css'
import { useSession, SessionProvider } from 'next-auth/react';


export default MyApp;

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


