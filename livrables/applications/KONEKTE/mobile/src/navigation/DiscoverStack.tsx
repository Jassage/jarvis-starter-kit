import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DiscoverScreen from "../screens/discover/DiscoverScreen";
import SearchScreen from "../screens/discover/SearchScreen";
import LikesReceivedScreen from "../screens/discover/LikesReceivedScreen";
import ProfileDetailScreen from "../screens/discover/ProfileDetailScreen";

export type DiscoverStackParamList = {
  Discover: undefined;
  Search: undefined;
  LikesReceived: undefined;
  ProfileDetail: { userId: string };
};

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverStack() {
  return (
    <Stack.Navigator screenOptions={{ statusBarTranslucent: true }}>
      <Stack.Screen
        name="Discover"
        component={DiscoverScreen}
        options={({ navigation }) => ({
          title: "Découverte",
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 16 }}>
              <Pressable onPress={() => navigation.navigate("Search")}>
                <Ionicons name="search" size={22} color="#E11D74" />
              </Pressable>
              <Pressable onPress={() => navigation.navigate("LikesReceived")}>
                <Ionicons name="heart" size={22} color="#E11D74" />
              </Pressable>
            </View>
          ),
        })}
      />
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: "Rechercher" }} />
      <Stack.Screen name="LikesReceived" component={LikesReceivedScreen} options={{ title: "Qui m'a liké" }} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} options={{ title: "Profil" }} />
    </Stack.Navigator>
  );
}
