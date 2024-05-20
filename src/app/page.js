import Login from './login/page.jsx';
import React from 'react';
import './globals.css'
import { useSession, SessionProvider } from 'next-auth/react';

function Home() {
  return (
      <Login/>
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


