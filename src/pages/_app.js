// src/pages/_app.js
import '../styles/globals.css';
import Navbar from '../components/Navbar';
import { SnackbarProvider } from 'notistack';

export default function MyApp({ Component, pageProps }) {
  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Navbar />
      <Component {...pageProps} />
    </SnackbarProvider>
  );
}
