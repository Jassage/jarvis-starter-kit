import { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { fetchProfile } from "../../api/profiles.api";
import { sendSwipe } from "../../api/swipes.api";
import { ViewedProfile } from "../../types";
import Avatar from "../../components/Avatar";
import MatchModal from "../../components/MatchModal";
import type { DiscoverStackParamList } from "../../navigation/DiscoverStack";

type Props = NativeStackScreenProps<DiscoverStackParamList, "ProfileDetail">;

export default function ProfileDetailScreen({ route, navigation }: Props) {
  const { userId } = route.params;
  const [profile, setProfile] = useState<ViewedProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionDone, setActionDone] = useState(false);
  const [matched, setMatched] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const result = await fetchProfile(userId);
        if (mounted) setProfile(result);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const onAction = async (action: "LIKE" | "PASS") => {
    try {
      const result = await sendSwipe(userId, action);
      setActionDone(true);
      if (result.isMatch) setMatched(true);
    } catch {
      setActionDone(true);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E11D74" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Profil introuvable</Text>
      </View>
    );
  }

  const mainPhoto = profile.photos.find((p) => p.isMain)?.url ?? profile.photos[0]?.url ?? null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarWrapper}>
        <Avatar uri={mainPhoto} size={140} />
      </View>
      <Text style={styles.name}>
        {profile.firstName}, {profile.age}
      </Text>
      {profile.city ? <Text style={styles.meta}>{profile.city}</Text> : null}
      {profile.occupation ? <Text style={styles.meta}>{profile.occupation}</Text> : null}
      {profile.compatibility > 0 && <Text style={styles.compat}>{profile.compatibility}% de points communs</Text>}
      {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

      {profile.commonInterests.length > 0 && (
        <View style={styles.interestsRow}>
          {profile.commonInterests.map((interest) => (
            <View key={interest} style={styles.interestChip}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      )}

      {profile.photos.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
          {profile.photos.map((p) => (
            <Image key={p.id} source={{ uri: p.url }} style={styles.galleryImage} />
          ))}
        </ScrollView>
      )}

      {profile.conversationId ? (
        <Pressable
          style={styles.messageButton}
          onPress={() =>
            navigation.getParent()?.navigate("Chat", {
              screen: "Conversation",
              params: { conversationId: profile.conversationId!, otherFirstName: profile.firstName },
            })
          }
        >
          <Ionicons name="chatbubble" size={18} color="#fff" />
          <Text style={styles.messageButtonText}>Envoyer un message</Text>
        </Pressable>
      ) : actionDone ? (
        <Text style={styles.doneText}>{matched ? "C'est un match !" : "Action enregistrée"}</Text>
      ) : (
        <View style={styles.actionsRow}>
          <Pressable style={[styles.actionButton, styles.passButton]} onPress={() => onAction("PASS")}>
            <Ionicons name="close" size={26} color="#999" />
          </Pressable>
          <Pressable style={[styles.actionButton, styles.likeButton]} onPress={() => onAction("LIKE")}>
            <Ionicons name="heart" size={26} color="#E11D74" />
          </Pressable>
        </View>
      )}

      <MatchModal
        visible={matched}
        otherFirstName={profile.firstName}
        onClose={() => setMatched(false)}
        onSendMessage={() => setMatched(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  emptyText: { color: "#666", fontSize: 15 },
  content: { alignItems: "center", padding: 24 },
  avatarWrapper: { marginBottom: 16 },
  name: { fontSize: 24, fontWeight: "700" },
  meta: { fontSize: 14, color: "#666", marginTop: 2 },
  compat: { fontSize: 13, color: "#E11D74", marginTop: 8, fontWeight: "600" },
  bio: { fontSize: 15, color: "#333", marginTop: 16, textAlign: "center" },
  interestsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 16 },
  interestChip: { backgroundColor: "#fce7f0", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  interestText: { color: "#E11D74", fontSize: 13 },
  gallery: { marginTop: 20, width: "100%" },
  galleryImage: { width: 100, height: 100, borderRadius: 10, marginRight: 8, backgroundColor: "#eee" },
  actionsRow: { flexDirection: "row", gap: 24, marginTop: 32 },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  passButton: {},
  likeButton: {},
  doneText: { marginTop: 32, color: "#666", fontSize: 15 },
  messageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E11D74",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 32,
  },
  messageButtonText: { color: "#fff", fontWeight: "600" },
});
