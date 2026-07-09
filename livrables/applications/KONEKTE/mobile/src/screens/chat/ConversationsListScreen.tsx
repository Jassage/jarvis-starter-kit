import { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { fetchMatches } from "../../api/swipes.api";
import { MatchListItem } from "../../types";
import Avatar from "../../components/Avatar";
import type { ChatStackParamList } from "../../navigation/ChatStack";

export default function ConversationsListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ChatStackParamList>>();
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const results = await fetchMatches();
      setMatches(results.filter((m) => m.conversationId));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading && matches.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E11D74" />
      </View>
    );
  }

  return (
    <FlatList
      data={matches}
      keyExtractor={(item) => item.matchId}
      contentContainerStyle={matches.length === 0 ? styles.emptyContainer : undefined}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      ListEmptyComponent={<Text style={styles.emptyText}>Aucune conversation pour le moment</Text>}
      renderItem={({ item }) => (
        <Pressable
          style={styles.row}
          onPress={() =>
            navigation.navigate("Conversation", {
              conversationId: item.conversationId!,
              otherFirstName: item.user.firstName,
            })
          }
        >
          <Avatar uri={item.user.mainPhoto} size={56} />
          <View style={styles.rowInfo}>
            <Text style={styles.name}>{item.user.firstName}</Text>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage?.content ?? "Dites bonjour !"}
            </Text>
          </View>
          {item.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unreadCount}</Text>
            </View>
          )}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  emptyContainer: { flexGrow: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#666", fontSize: 15, paddingHorizontal: 32, textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  rowInfo: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: "600" },
  lastMessage: { fontSize: 14, color: "#777", marginTop: 2 },
  badge: {
    backgroundColor: "#E11D74",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
