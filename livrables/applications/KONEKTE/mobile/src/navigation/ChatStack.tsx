import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ConversationsListScreen from "../screens/chat/ConversationsListScreen";
import ConversationScreen from "../screens/chat/ConversationScreen";

export type ChatStackParamList = {
  ConversationsList: undefined;
  Conversation: { conversationId: string; otherFirstName?: string };
};

const Stack = createNativeStackNavigator<ChatStackParamList>();

export default function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ statusBarTranslucent: true }}>
      <Stack.Screen name="ConversationsList" component={ConversationsListScreen} options={{ title: "Messages" }} />
      <Stack.Screen name="Conversation" component={ConversationScreen} options={{ title: "Conversation" }} />
    </Stack.Navigator>
  );
}
