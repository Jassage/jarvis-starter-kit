import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuthStore } from "../../store/auth.store";
import type { AuthStackParamList } from "../../navigation/AuthStack";

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const GENDERS = ["HOMME", "FEMME", "AUTRE"] as const;

const today = new Date();
const MAX_BIRTH_DATE = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
const MIN_BIRTH_DATE = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
const DEFAULT_BIRTH_DATE = new Date(today.getFullYear() - 25, 0, 1);

const toApiDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const toDisplayDate = (d: Date) => d.toLocaleDateString("fr-FR");

export default function RegisterScreen({ navigation }: Props) {
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [pendingDate, setPendingDate] = useState<Date>(DEFAULT_BIRTH_DATE);
  const [showPicker, setShowPicker] = useState(false);
  const [gender, setGender] = useState<(typeof GENDERS)[number]>("HOMME");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);

  const openPicker = () => {
    setPendingDate(birthDate ?? DEFAULT_BIRTH_DATE);
    setShowPicker(true);
  };

  const onChangeDate = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
      if (event.type === "set" && selected) setBirthDate(selected);
      return;
    }
    if (selected) setPendingDate(selected);
  };

  const onSubmit = async () => {
    setError(null);
    if (!birthDate) {
      setError("Sélectionne ta date de naissance");
      return;
    }
    try {
      await register({
        email: email.trim(),
        password,
        firstName,
        birthDate: toApiDate(birthDate),
        gender,
        city,
      });
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Inscription impossible");
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Créer un compte</Text>
        <TextInput
          style={styles.input}
          placeholder="Prénom"
          autoCapitalize="words"
          returnKeyType="next"
          value={firstName}
          onChangeText={setFirstName}
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <TextInput
          ref={emailRef}
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          keyboardType="email-address"
          returnKeyType="next"
          value={email}
          onChangeText={setEmail}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <View style={styles.passwordWrap}>
          <TextInput
            ref={passwordRef}
            style={[styles.input, styles.passwordInput]}
            placeholder="Mot de passe (8+ caractères)"
            secureTextEntry={!showPassword}
            autoComplete="password-new"
            textContentType="newPassword"
            returnKeyType="done"
            value={password}
            onChangeText={setPassword}
          />
          <Pressable
            style={styles.eyeButton}
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={10}
          >
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#999" />
          </Pressable>
        </View>

        <Pressable style={styles.input} onPress={openPicker}>
          <Text style={birthDate ? styles.dateText : styles.datePlaceholder}>
            {birthDate ? toDisplayDate(birthDate) : "Date de naissance"}
          </Text>
        </Pressable>

        <TextInput
          ref={cityRef}
          style={styles.input}
          placeholder="Ville"
          autoCapitalize="words"
          returnKeyType="done"
          value={city}
          onChangeText={setCity}
        />
        <View style={styles.genderRow}>
          {GENDERS.map((g) => (
            <Pressable
              key={g}
              style={[styles.genderChip, gender === g && styles.genderChipActive]}
              onPress={() => setGender(g)}
            >
              <Text style={gender === g ? styles.genderTextActive : styles.genderText}>{g}</Text>
            </Pressable>
          ))}
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.button} onPress={onSubmit} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>S'inscrire</Text>}
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
        </Pressable>
      </ScrollView>

      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={pendingDate}
          mode="date"
          display="default"
          maximumDate={MAX_BIRTH_DATE}
          minimumDate={MIN_BIRTH_DATE}
          onChange={onChangeDate}
        />
      )}

      {Platform.OS === "ios" && (
        <Modal visible={showPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setShowPicker(false)}>
                  <Text style={styles.modalCancel}>Annuler</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setBirthDate(pendingDate);
                    setShowPicker(false);
                  }}
                >
                  <Text style={styles.modalConfirm}>Valider</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={pendingDate}
                mode="date"
                display="spinner"
                maximumDate={MAX_BIRTH_DATE}
                minimumDate={MIN_BIRTH_DATE}
                onChange={onChangeDate}
              />
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 24, color: "#E11D74" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  passwordWrap: { justifyContent: "center" },
  passwordInput: { paddingRight: 44 },
  eyeButton: { position: "absolute", right: 14, top: 14 },
  dateText: { fontSize: 16, color: "#111" },
  datePlaceholder: { fontSize: 16, color: "#999" },
  genderRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  genderChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  genderChipActive: { backgroundColor: "#E11D74", borderColor: "#E11D74" },
  genderText: { color: "#333" },
  genderTextActive: { color: "#fff", fontWeight: "600" },
  button: {
    backgroundColor: "#E11D74",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { textAlign: "center", marginTop: 16, color: "#E11D74" },
  error: { color: "#d00", marginBottom: 8, textAlign: "center" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.35)" },
  modalSheet: { backgroundColor: "#fff", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalCancel: { color: "#999", fontSize: 16 },
  modalConfirm: { color: "#E11D74", fontSize: 16, fontWeight: "700" },
});
