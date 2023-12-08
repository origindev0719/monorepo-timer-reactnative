import { Provider as AppProvider } from 'react-redux'
import { Provider } from 'app/provider'
import store from '../../shared/redux/store'
import { Stack } from 'expo-router'

export default function Root() {
  return (
    <AppProvider store={store}>
      <Provider>
        <Stack screenOptions={{ headerShown: false }} />
      </Provider>
    </AppProvider>
  )
}
