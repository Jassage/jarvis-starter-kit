import { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { fetchMatches } from "../../api/swipes.api";
import { MatchListItem } from "../../types";
import Avatar from "../../components/Avatar";
import type { AppTabsParamList } from "../../navigation/AppTabs";

export default function MatchesScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const results = await fetchMatches();
      setMatches(results);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openConversation = (item: MatchListItem) => {
    if (!item.conversationId) return;
    navigation.navigate("Chat", {
      screen: "Conversation",
      params: { conversationId: item.conversationId, otherFirstName: item.user.firstName },
    });
  };

  if (loading && matches.length === 0) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator size="large" color="#E11D74" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Text style={styles.title}>Matchs</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.matchId}
        contentContainerStyle={matches.length === 0 ? styles.emptyContainer : undefined}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Pas encore de match. Continue à explorer !</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => openConversation(item)}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
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
