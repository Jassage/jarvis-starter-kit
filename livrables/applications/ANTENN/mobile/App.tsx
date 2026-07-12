import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import WatchScreen from './src/screens/WatchScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <WatchScreen />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
