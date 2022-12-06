import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { ApolloProvider } from '@apollo/client';
import { client } from 'constant';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const theme = createTheme({
  // only light mode 
  palette: {
    mode: 'light',
  },
});



export default function App({ Component, pageProps }: AppProps) {
  return <ApolloProvider client={client}>
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </LocalizationProvider>

    <ToastContainer />
  </ApolloProvider>
}
