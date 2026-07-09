import { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Modal, ActivityIndicator, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { useAuthStore } from "../../store/auth.store";
import { fetchPaymentStatus, createStripeCheckout, createMoncashPayment } from "../../api/payments.api";

WebBrowser.maybeCompleteAuthSession();

const FEATURES: { icon: keyof typeof Ionicons.glyphMap; label: string; desc: string }[] = [
  { icon: "eye", label: "Voir qui t'a liké", desc: "Accède à la liste complète des personnes qui t'ont liké" },
  { icon: "star", label: "Super Likes illimités", desc: "Envoie autant de Super Likes que tu veux chaque jour" },
  { icon: "refresh", label: "Retour en arrière illimité", desc: "Annule autant de swipes que tu veux" },
  { icon: "flash", label: "Boost mensuel", desc: "Ton profil est mis en avant pendant 30 minutes" },
  { icon: "heart", label: "Plus de matchs", desc: "Priorité dans le discover pour tous les utilisateurs" },
];

const PLANS = [
  { id: "1mo", label: "1 mois", price: "$5", monthly: "$5/mois", popular: false, save: null as string | null },
  { id: "3mo", label: "3 mois", price: "$12", monthly: "$4/mois", popular: true, save: "Économise 20%" },
  { id: "6mo", label: "6 mois", price: "$20", monthly: "$3.3/mois", popular: false, save: "Économise 33%" },
];

export default function PremiumScreen() {
  const refreshUser = useAuthStore((s) => s.refreshUser);
  const user = useAuthStore((s) => s.user);
  const [isPremium, setIsPremium] = useState(user?.subscriptionPlan !== "FREE");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState<"stripe" | "moncash" | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const status = await fetchPaymentStatus();
      setIsPremium(status.subscriptionPlan !== "FREE");
    } catch {
      // garde l'état courant si le statut ne peut pas être rafraîchi
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkStatus();
    }, [checkStatus])
  );

  const openPlan = (planId: string) => {
    setSelectedPlan(planId);
    setShowModal(true);
  };

  const payWithStripe = async () => {
    if (!selectedPlan) return;
    setLoading("stripe");
    try {
      const { url } = await createStripeCheckout(selectedPlan);
      const result = await WebBrowser.openAuthSessionAsync(url, "konekte://premium");
      setShowModal(false);
      if (result.type === "success") {
        await refreshUser();
        await checkStatus();
        Alert.alert("Paiement réussi", "Ton compte est maintenant Premium.");
      }
    } catch {
      Alert.alert("Erreur", "Impossible de démarrer le paiement par carte.");
    } finally {
      setLoading(null);
    }
  };

  const payWithMoncash = async () => {
    if (!selectedPlan) return;
    setLoading("moncash");
    try {
      const { redirectUrl } = await createMoncashPayment(selectedPlan);
      await WebBrowser.openBrowserAsync(redirectUrl);
      setShowModal(false);
      await refreshUser();
      await checkStatus();
    } catch {
      Alert.alert("MonCash indisponible", "Le paiement MonCash n'est pas encore actif pour le moment.");
    } finally {
      setLoading(null);
    }
  };

  if (isPremium) {
    return (
      <View style={styles.premiumDone}>
        <Text style={styles.premiumEmoji}>✨</Text>
        <Text style={styles.premiumTitle}>Tu es déjà Premium !</Text>
        <Text style={styles.premiumSubtitle}>Profite de tous les avantages sans limite.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={["#e8688a", "#D4537E", "#993556"]} style={styles.header}>
        <Text style={styles.headerEmoji}>✨</Text>
        <Text style={styles.headerTitle}>Konekte Premium</Text>
        <Text style={styles.headerSubtitle}>Trouve l'amour plus vite avec tous les avantages</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Ce que tu obtiens</Text>
        {FEATURES.map((f) => (
          <View key={f.label} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name={f.icon} size={17} color="#D4537E" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureLabel}>{f.label}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
            <Ionicons name="checkmark" size={16} color="#4ade80" style={{ marginTop: 2 }} />
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Choisir un plan</Text>
      {PLANS.map((plan) => (
        <View key={plan.id} style={[styles.planCard, plan.popular && styles.planCardPopular]}>
          <View>
            <View style={styles.planHeaderRow}>
              <Text style={styles.planLabel}>{plan.label}</Text>
              {plan.popular && (
                <View style={styles.badgePopular}>
                  <Text style={styles.badgePopularText}>POPULAIRE</Text>
                </View>
              )}
              {plan.save && !plan.popular && (
                <View style={styles.badgeSave}>
                  <Text style={styles.badgeSaveText}>{plan.save}</Text>
                </View>
              )}
            </View>
            <Text style={styles.planMonthly}>{plan.monthly}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.planPrice}>{plan.price}</Text>
            <Pressable
              style={[styles.chooseButton, { backgroundColor: plan.popular ? "#D4537E" : "#9ca3af" }]}
              onPress={() => openPlan(plan.id)}
            >
              <Text style={styles.chooseButtonText}>Choisir</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <Text style={styles.footerNote}>Paiement sécurisé · Annulation à tout moment · Sans engagement</Text>

      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowModal(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Choisir le paiement</Text>
            <Text style={styles.modalSubtitle}>
              Plan sélectionné : {PLANS.find((p) => p.id === selectedPlan)?.label} —{" "}
              {PLANS.find((p) => p.id === selectedPlan)?.price}
            </Text>

            <Pressable style={styles.payOption} onPress={payWithStripe} disabled={loading !== null}>
              <View style={[styles.payIcon, { backgroundColor: "#2563eb" }]}>
                <Ionicons name="card" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.payLabel}>Carte bancaire</Text>
                <Text style={styles.payDesc}>Visa, Mastercard, via Stripe</Text>
              </View>
              {loading === "stripe" && <ActivityIndicator color="#2563eb" />}
            </Pressable>

            <Pressable style={styles.payOption} onPress={payWithMoncash} disabled={loading !== null}>
              <View style={[styles.payIcon, { backgroundColor: "#E30613" }]}>
                <Ionicons name="phone-portrait" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.payLabel}>MonCash</Text>
                <Text style={styles.payDesc}>Paiement mobile Digicel</Text>
              </View>
              {loading === "moncash" && <ActivityIndicator color="#E30613" />}
            </Pressable>

            <Pressable style={styles.modalCancel} onPress={() => setShowModal(false)}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f8" },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  premiumDone: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 32 },
  premiumEmoji: { fontSize: 40 },
  premiumTitle: { fontSize: 20, fontWeight: "700", color: "#222" },
  premiumSubtitle: { fontSize: 14, color: "#999", textAlign: "center" },
  header: { borderRadius: 24, padding: 24, alignItems: "center" },
  headerEmoji: { fontSize: 36, marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#fff", marginBottom: 4 },
  headerSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.85)", textAlign: "center" },
  card: { backgroundColor: "#fff", borderRadius: 18, padding: 18, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#222" },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#FBEAF0",
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { flex: 1 },
  featureLabel: { fontSize: 13, fontWeight: "600", color: "#222" },
  featureDesc: { fontSize: 12, color: "#999", marginTop: 2 },
  planCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "transparent",
  },
  planCardPopular: { borderColor: "#D4537E" },
  planHeaderRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  planLabel: { fontSize: 15, fontWeight: "700", color: "#222" },
  planMonthly: { fontSize: 12, color: "#999", marginTop: 2 },
  badgePopular: { backgroundColor: "#D4537E", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgePopularText: { fontSize: 9, fontWeight: "700", color: "#fff" },
  badgeSave: { backgroundColor: "#ecfdf5", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeSaveText: { fontSize: 9, fontWeight: "600", color: "#16a34a" },
  planPrice: { fontSize: 18, fontWeight: "800", color: "#222" },
  chooseButton: { marginTop: 4, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  chooseButtonText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  footerNote: { textAlign: "center", fontSize: 11, color: "#aaa", paddingHorizontal: 16 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalSheet: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 17, fontWeight: "700", color: "#222", marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: "#999", marginBottom: 18 },
  payOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#f3f4f6",
    marginBottom: 10,
  },
  payIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  payLabel: { fontSize: 14, fontWeight: "700", color: "#222" },
  payDesc: { fontSize: 12, color: "#999", marginTop: 1 },
  modalCancel: { paddingVertical: 12, alignItems: "center", marginTop: 4 },
  modalCancelText: { fontSize: 14, color: "#999" },
});
