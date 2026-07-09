import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

interface Props {
  visible: boolean;
  otherFirstName?: string;
  onClose: () => void;
  onSendMessage: () => void;
}

export default function MatchModal({ visible, otherFirstName, onClose, onSendMessage }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>C'est un match !</Text>
          <Text style={styles.subtitle}>
            {otherFirstName ? `Toi et ${otherFirstName} vous êtes likés mutuellement.` : "Vous vous êtes likés mutuellement."}
          </Text>
          <Pressable style={styles.primaryButton} onPress={onSendMessage}>
            <Text style={styles.primaryButtonText}>Envoyer un message</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Continuer à explorer</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { backgroundColor: "#fff", borderRadius: 20, padding: 24, width: "100%", alignItems: "center" },
  title: { fontSize: 26, fontWeight: "700", color: "#E11D74", marginBottom: 8 },
  subtitle: { fontSize: 15, color: "#444", textAlign: "center", marginBottom: 24 },
  primaryButton: { backgroundColor: "#E11D74", borderRadius: 10, padding: 14, width: "100%", alignItems: "center", marginBottom: 8 },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  secondaryButton: { padding: 10 },
  secondaryButtonText: { color: "#666" },
});
