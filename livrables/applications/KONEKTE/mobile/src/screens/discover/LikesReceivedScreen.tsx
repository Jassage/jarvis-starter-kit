import { useCallback, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { fetchLikesReceived, sendSwipe } from "../../api/swipes.api";
import { LikeReceived } from "../../types";
import Avatar from "../../components/Avatar";
import MatchModal from "../../components/MatchModal";
import type { DiscoverStackParamList } from "../../navigation/DiscoverStack";

type Props = NativeStackScreenProps<DiscoverStackParamList, "LikesReceived">;

export default function LikesReceivedScreen({ navigation }: Props) {
  const [likes, setLikes] = useState<LikeReceived[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchedFirstName, setMatchedFirstName] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchLikesReceived();
      setLikes(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onLikeBack = async (like: LikeReceived) => {
    try {
      const result = await sendSwipe(like.user.id, "LIKE");
      setLikes((prev) => prev.filter((l) => l.swipeId !== like.swipeId));
      if (result.isMatch) setMatchedFirstName(like.user.firstName ?? "cette personne");
    } catch {
      // déjà swipé entre-temps : on retire quand même de la liste locale
      setLikes((prev) => prev.filter((l) => l.swipeId !== like.swipeId));
    }
  };

  if (loading && likes.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E11D74" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={likes}
        keyExtractor={(item) => item.swipeId}
        numColumns={2}
        contentContainerStyle={likes.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={<Text style={styles.emptyText}>Personne ne t'a encore liké</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => item.user.id && navigation.navigate("ProfileDetail", { userId: item.user.id })}
          >
            <Avatar uri={item.user.mainPhoto} size={100} />
            <Text style={styles.name}>{item.user.firstName ?? "Compte Premium requis"}</Text>
            {item.user.city ? <Text style={styles.city}>{item.user.city}</Text> : null}
            <Pressable style={styles.likeButton} onPress={() => onLikeBack(item)}>
              <Ionicons name="heart" size={20} color="#fff" />
            </Pressable>
          </Pressable>
        )}
      />

      <MatchModal
        visible={!!matchedFirstName}
        otherFirstName={matchedFirstName ?? undefined}
        onClose={() => setMatchedFirstName(null)}
        onSendMessage={() => setMatchedFirstName(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  list: { padding: 8 },
  emptyContainer: { flexGrow: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#666", fontSize: 15, paddingHorizontal: 32, textAlign: "center" },
  card: {
    flex: 1,
    margin: 8,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 14,
    padding: 16,
  },
  name: { fontSize: 15, fontWeight: "600", marginTop: 10, textAlign: "center" },
  city: { fontSize: 12, color: "#777", marginTop: 2 },
  likeButton: {
    marginTop: 12,
    backgroundColor: "#E11D74",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
