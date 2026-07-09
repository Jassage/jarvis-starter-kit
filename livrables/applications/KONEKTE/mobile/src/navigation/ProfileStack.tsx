import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ProfileScreen from "../screens/profile/ProfileScreen";
import PremiumScreen from "../screens/profile/PremiumScreen";

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Premium: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Premium" component={PremiumScreen} options={{ title: "Premium" }} />
    </Stack.Navigator>
  );
}
