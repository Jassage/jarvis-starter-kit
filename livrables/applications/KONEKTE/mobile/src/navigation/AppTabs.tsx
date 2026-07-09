import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { NavigatorScreenParams } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DiscoverStack, { DiscoverStackParamList } from "./DiscoverStack";
import MatchesScreen from "../screens/matches/MatchesScreen";
import ChatStack, { ChatStackParamList } from "./ChatStack";
import ProfileStack, { ProfileStackParamList } from "./ProfileStack";

export type AppTabsParamList = {
  Discover: NavigatorScreenParams<DiscoverStackParamList>;
  Matches: undefined;
  Chat: NavigatorScreenParams<ChatStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

const ICONS: Record<keyof AppTabsParamList, keyof typeof Ionicons.glyphMap> = {
  Discover: "flame",
  Matches: "heart",
  Chat: "chatbubble",
  Profile: "person",
};

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name as keyof AppTabsParamList]} size={size} color={color} />
        ),
        tabBarActiveTintColor: "#E11D74",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverStack} options={{ title: "Découverte" }} />
      <Tab.Screen name="Matches" component={MatchesScreen} options={{ title: "Matchs" }} />
      <Tab.Screen name="Chat" component={ChatStack} options={{ title: "Messages" }} />
      <Tab.Screen name="Profile" component={ProfileStack} options={{ title: "Profil" }} />
    </Tab.Navigator>
  );
}
