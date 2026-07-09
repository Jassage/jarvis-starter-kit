import { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Image,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useOnboardingStore } from "../../store/onboarding.store";

type Slide = {
  key: string;
  image: number;
  title: string;
  subtitle: string;
};

// Pour remplacer une photo : dépose le nouveau fichier dans assets/onboarding/
// avec le même nom (slide-1.jpg / slide-2.jpg / slide-3.jpg), même ratio 3:4.
const SLIDES: Slide[] = [
  {
    key: "discover",
    image: require("../../../assets/onboarding/slide-1.jpg"),
    title: "Découvre des célibataires près de toi",
    subtitle: "Swipe et trouve des profils qui te correspondent vraiment, où que tu sois en Haïti.",
  },
  {
    key: "chat",
    image: require("../../../assets/onboarding/slide-2.jpg"),
    title: "Discute en toute confiance",
    subtitle: "Messages, photos et messages vocaux dans un espace pensé pour ta sécurité.",
  },
  {
    key: "match",
    image: require("../../../assets/onboarding/slide-3.jpg"),
    title: "Fè bon koneksyon",
    subtitle: "Quand ça matche des deux côtés, la conversation peut commencer. Prêt à te lancer ?",
  },
];

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const listRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLast = activeIndex === SLIDES.length - 1;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== activeIndex) setActiveIndex(index);
  };

  const goNext = () => {
    if (isLast) {
      completeOnboarding();
      return;
    }
    listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => (
          <View style={{ width, height }}>
            <Image source={item.image} style={StyleSheet.absoluteFill} resizeMode="cover" />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.25)", "rgba(17,17,17,0.95)"]}
              locations={[0, 0.45, 0.8]}
              style={StyleSheet.absoluteFill}
            />
          </View>
        )}
      />

      {!isLast && (
        <Pressable style={styles.skip} onPress={completeOnboarding} hitSlop={12}>
          <Text style={styles.skipText}>Passer</Text>
        </Pressable>
      )}

      <View style={styles.footer} pointerEvents="box-none">
        <Text style={styles.title}>{SLIDES[activeIndex].title}</Text>
        <Text style={styles.subtitle}>{SLIDES[activeIndex].subtitle}</Text>

        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View key={s.key} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>

        <Pressable style={styles.button} onPress={goNext}>
          <Text style={styles.buttonText}>{isLast ? "Commencer" : "Suivant"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  skip: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 10,
  },
  skipText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 8,
  },
  title: { fontSize: 26, fontWeight: "700", color: "#fff", marginBottom: 10 },
  subtitle: { fontSize: 15, color: "rgba(255,255,255,0.85)", lineHeight: 22, marginBottom: 24 },
  dots: { flexDirection: "row", gap: 8, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.35)" },
  dotActive: { width: 22, backgroundColor: "#E11D74" },
  button: {
    backgroundColor: "#E11D74",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
