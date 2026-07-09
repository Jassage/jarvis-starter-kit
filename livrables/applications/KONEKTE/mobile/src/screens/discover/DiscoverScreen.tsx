import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import Swiper from "react-native-deck-swiper";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { fetchDiscoverProfiles } from "../../api/discover.api";
import { sendSwipe, undoLastSwipe } from "../../api/swipes.api";
import { useAuthStore } from "../../store/auth.store";
import { DiscoverProfile, SwipeAction } from "../../types";
import MatchModal from "../../components/MatchModal";
import type { AppTabsParamList } from "../../navigation/AppTabs";
import type { DiscoverStackParamList } from "../../navigation/DiscoverStack";

type Props = NativeStackScreenProps<DiscoverStackParamList, "Discover">;

export default function DiscoverScreen({ navigation }: Props) {
  const myUserId = useAuthStore((s) => s.user?.id);
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [matchedFirstName, setMatchedFirstName] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const swiperRef = useRef<Swiper<DiscoverProfile>>(null);

  const loadPage = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const results = await fetchDiscoverProfiles({ page: p, limit: 15 });
      setProfiles((prev) => (p === 1 ? results : [...prev, ...results]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  const handleSwipe = async (cardIndex: number, action: SwipeAction) => {
    const profile = profiles[cardIndex];
    if (!profile) return;
    try {
      const result = await sendSwipe(profile.userId, action);
      setCanUndo(true);
      if (result.isMatch && result.match) {
        const otherSnapshot = result.match.userAId === myUserId ? result.match.userB : result.match.userA;
        setMatchedFirstName(otherSnapshot.profile?.firstName ?? null);
      }
    } catch {
      // swipe déjà envoyé ou profil devenu indisponible : on ignore silencieusement,
      // la carte a de toute façon déjà quitté l'écran côté UI
    }
  };

  const handleSwipedAll = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadPage(nextPage);
  };

  const handleUndo = async () => {
    try {
      await undoLastSwipe();
      swiperRef.current?.swipeBack();
      setCanUndo(false);
    } catch {
      // rien à annuler
    }
  };

  if (loading && profiles.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E11D74" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.swiperWrapper}>
        {profiles.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>Plus personne à découvrir pour le moment</Text>
          </View>
        ) : (
          <Swiper
            ref={swiperRef}
            cards={profiles}
            renderCard={(card) =>
              card ? (
                <View style={styles.card}>
                  {card.mainPhoto ? (
                    <Image source={{ uri: card.mainPhoto }} style={styles.cardImage} />
                  ) : (
                    <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                      <Ionicons name="person" size={64} color="#bbb" />
                    </View>
                  )}
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>
                      {card.firstName}, {card.age}
                    </Text>
                    <Text style={styles.cardCity}>{card.city}</Text>
                    {card.bio ? <Text style={styles.cardBio}>{card.bio}</Text> : null}
                  </View>
                </View>
              ) : null
            }
            onSwipedLeft={(i) => handleSwipe(i, "PASS")}
            onSwipedRight={(i) => handleSwipe(i, "LIKE")}
            onSwipedTop={(i) => handleSwipe(i, "SUPER_LIKE")}
            onSwipedAll={handleSwipedAll}
            backgroundColor="transparent"
            stackSize={3}
            cardIndex={0}
            cardVerticalMargin={20}
            cardHorizontalMargin={16}
            disableBottomSwipe
            animateCardOpacity
          />
        )}
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.actionButton, styles.undoButton, !canUndo && styles.actionButtonDisabled]}
          onPress={handleUndo}
          disabled={!canUndo}
        >
          <Ionicons name="arrow-undo" size={22} color={canUndo ? "#f5a623" : "#ccc"} />
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => swiperRef.current?.swipeLeft()}>
          <Ionicons name="close" size={28} color="#999" />
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => swiperRef.current?.swipeTop()}>
          <Ionicons name="star" size={24} color="#3b82f6" />
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => swiperRef.current?.swipeRight()}>
          <Ionicons name="heart" size={28} color="#E11D74" />
        </Pressable>
      </View>

      <MatchModal
        visible={!!matchedFirstName}
        otherFirstName={matchedFirstName ?? undefined}
        onClose={() => setMatchedFirstName(null)}
        onSendMessage={() => {
          setMatchedFirstName(null);
          navigation.getParent<BottomTabNavigationProp<AppTabsParamList>>()?.navigate("Matches");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  swiperWrapper: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  emptyText: { fontSize: 16, color: "#666", textAlign: "center", paddingHorizontal: 32 },
  card: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#eee",
    overflow: "hidden",
  },
  cardImage: { width: "100%", height: "75%", backgroundColor: "#ddd" },
  cardImagePlaceholder: { alignItems: "center", justifyContent: "center" },
  cardInfo: { padding: 16 },
  cardName: { fontSize: 22, fontWeight: "700" },
  cardCity: { fontSize: 14, color: "#666", marginTop: 2 },
  cardBio: { fontSize: 14, color: "#333", marginTop: 8 },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingVertical: 16,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  undoButton: { width: 44, height: 44, borderRadius: 22 },
  actionButtonDisabled: { shadowOpacity: 0, elevation: 0 },
});
