import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from 'next/app';

const theme = createTheme({
  // 테마 설정
});

class MyApp extends App {
  render() {
    const { Component, pageProps } = this.props;
    return (
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    );
  }
}

export default MyApp;