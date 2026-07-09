import { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "../../store/auth.store";
import { useSocketStore } from "../../store/socket.store";
import { fetchMyProfile } from "../../api/profiles.api";
import { uploadPhoto } from "../../api/photos.api";
import { MyProfile } from "../../types";

export default function ProfileScreen() {
  const logout = useAuthStore((s) => s.logout);
  const disconnectSocket = useSocketStore((s) => s.disconnect);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchMyProfile();
      setProfile(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onLogout = async () => {
    disconnectSocket();
    await logout();
  };

  const onAddPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setUploading(true);
    try {
      const isFirstPhoto = !profile || profile.photos.length === 0;
      await uploadPhoto(
        { uri: asset.uri, name: asset.fileName ?? "photo.jpg", type: asset.mimeType ?? "image/jpeg" },
        isFirstPhoto
      );
      await load();
    } finally {
      setUploading(false);
    }
  };

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.center} edges={["top"]}>
        <ActivityIndicator size="large" color="#E11D74" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <FlatList
        data={profile?.photos ?? []}
        keyExtractor={(item) => item.id}
        numColumns={3}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.name}>
              {profile?.firstName}, {profile?.age}
            </Text>
            {profile?.city ? <Text style={styles.meta}>{profile.city}</Text> : null}
            {profile?.occupation ? <Text style={styles.meta}>{profile.occupation}</Text> : null}
            {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
            <Text style={styles.plan}>Plan : {profile?.subscriptionPlan}</Text>

            <View style={styles.completeRow}>
              <View style={styles.completeTrack}>
                <View style={[styles.completeFill, { width: `${profile?.profileComplete ?? 0}%` }]} />
              </View>
              <Text style={styles.completeText}>{profile?.profileComplete ?? 0}% complet</Text>
            </View>

            <Text style={styles.sectionTitle}>Photos</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.photoWrapper}>
            <Image source={{ uri: item.url }} style={styles.photo} />
            {item.isMain && (
              <View style={styles.mainBadge}>
                <Ionicons name="star" size={12} color="#fff" />
              </View>
            )}
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Pressable style={styles.addPhotoButton} onPress={onAddPhoto} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator color="#E11D74" />
              ) : (
                <>
                  <Ionicons name="add" size={20} color="#E11D74" />
                  <Text style={styles.addPhotoText}>Ajouter une photo</Text>
                </>
              )}
            </Pressable>
            <Pressable style={styles.logoutButton} onPress={onLogout}>
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const PHOTO_SIZE = 110;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  header: { padding: 20, alignItems: "center" },
  name: { fontSize: 24, fontWeight: "700" },
  meta: { fontSize: 14, color: "#666", marginTop: 2 },
  bio: { fontSize: 14, color: "#333", marginTop: 10, textAlign: "center" },
  plan: { fontSize: 13, color: "#999", marginTop: 8 },
  completeRow: { width: "100%", marginTop: 16 },
  completeTrack: { height: 8, borderRadius: 4, backgroundColor: "#eee", overflow: "hidden" },
  completeFill: { height: 8, backgroundColor: "#E11D74" },
  completeText: { fontSize: 12, color: "#666", marginTop: 4, textAlign: "right" },
  sectionTitle: { alignSelf: "flex-start", fontSize: 16, fontWeight: "600", marginTop: 24 },
  photoWrapper: { margin: 4 },
  photo: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: 10, backgroundColor: "#eee" },
  mainBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#E11D74",
    borderRadius: 10,
    padding: 3,
  },
  footer: { padding: 20, alignItems: "center" },
  addPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#E11D74",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  addPhotoText: { color: "#E11D74", fontWeight: "600" },
  logoutButton: { backgroundColor: "#333", borderRadius: 10, padding: 14, paddingHorizontal: 24, marginTop: 24 },
  logoutText: { color: "#fff", fontWeight: "600" },
});
