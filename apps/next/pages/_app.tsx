import 'raf/polyfill'
import 'setimmediate'

import { Provider } from 'app/provider'
import Head from 'next/head'
import { Provider as AppProvider } from 'react-redux';
import store from '../../shared/redux/store' 

import { AppProps } from 'next/app'
import '../global.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Monorepo Timer Test</title>
        <meta
          name="description"
          content="Expo + Next.js with Solito. By Fernando Rojo."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AppProvider store={store}>
        <Provider>
          <Component {...pageProps} />
        </Provider>
      </AppProvider>
    </>
  )
}

export default MyApp
