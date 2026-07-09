import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { fetchMessages, sendMediaMessage } from "../../api/messages.api";
import { useSocketStore } from "../../store/socket.store";
import { useAuthStore } from "../../store/auth.store";
import { env } from "../../config/env";
import { Message } from "../../types";
import type { ChatStackParamList } from "../../navigation/ChatStack";

const resolveMediaUrl = (url: string) => (url.startsWith("/") ? `${env.socketUrl}${url}` : url);

type Props = NativeStackScreenProps<ChatStackParamList, "Conversation">;

let typingTimeout: ReturnType<typeof setTimeout> | null = null;

export default function ConversationScreen({ route, navigation }: Props) {
  const { conversationId, otherFirstName } = route.params;
  const myUserId = useAuthStore((s) => s.user?.id);
  const socket = useSocketStore((s) => s.socket);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [otherTyping, setOtherTyping] = useState(false);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const listRef = useRef<FlatList<Message>>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ title: otherFirstName ?? "Conversation" });
  }, [navigation, otherFirstName]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const result = await fetchMessages(conversationId);
        if (!mounted) return;
        setMessages(result.messages);
        setOtherUserId(result.otherUser?.userId ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [conversationId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("conversation:join", conversationId);

    const onNewMessage = (message: Message) => {
      if (message.conversationId !== conversationId) return;
      setMessages((prev) => [...prev, message]);
      setOtherTyping(false);
    };

    const onRead = (data: { conversationId: string }) => {
      if (data.conversationId !== conversationId) return;
      setMessages((prev) => prev.map((m) => (m.senderId === myUserId ? { ...m, status: "READ" } : m)));
    };

    const onTypingStart = (data: { userId: string }) => {
      if (data.userId === otherUserId) setOtherTyping(true);
    };

    const onTypingStop = (data: { userId: string }) => {
      if (data.userId === otherUserId) setOtherTyping(false);
    };

    socket.on("message:new", onNewMessage);
    socket.on("message:read", onRead);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);

    return () => {
      socket.emit("conversation:leave", conversationId);
      socket.off("message:new", onNewMessage);
      socket.off("message:read", onRead);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
    };
  }, [socket, conversationId, myUserId, otherUserId]);

  const onChangeText = (value: string) => {
    setText(value);
    if (!socket) return;
    socket.emit("typing:start", conversationId);
    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => socket.emit("typing:stop", conversationId), 2000);
  };

  const send = () => {
    const content = text.trim();
    if (!content || !socket) return;
    socket.emit("message:send", { conversationId, content });
    setText("");
    socket.emit("typing:stop", conversationId);
  };

  // La route REST média ne diffuse pas d'event socket "message:new" (contrairement
  // à l'envoi de texte) : on ajoute donc le message localement côté expéditeur.
  // Le destinataire le verra à la prochaine ouverture/rechargement de la conversation.
  const onAttachPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const uploaded = await sendMediaMessage(conversationId, {
      uri: asset.uri,
      name: asset.fileName ?? "photo.jpg",
      type: asset.mimeType ?? "image/jpeg",
    });
    setMessages((prev) => [...prev, uploaded]);
  };

  const renderStatus = useCallback((status: Message["status"]) => {
    if (status === "READ") return <Text style={styles.statusRead}>✓✓</Text>;
    if (status === "DELIVERED") return <Text style={styles.statusDefault}>✓✓</Text>;
    return <Text style={styles.statusDefault}>✓</Text>;
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#E11D74" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          const isMine = item.senderId === myUserId;
          return (
            <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
              <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                {item.type === "IMAGE" && item.mediaUrl ? (
                  <Image source={{ uri: resolveMediaUrl(item.mediaUrl) }} style={styles.bubbleImage} />
                ) : (
                  <Text style={isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>{item.content}</Text>
                )}
              </View>
              {isMine && renderStatus(item.status)}
            </View>
          );
        }}
      />
      {otherTyping && <Text style={styles.typing}>{otherFirstName ?? "..."} est en train d'écrire...</Text>}
      <View style={styles.inputRow}>
        <Pressable style={styles.attachButton} onPress={onAttachPhoto}>
          <Ionicons name="image" size={22} color="#666" />
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder="Écrire un message..."
          value={text}
          onChangeText={onChangeText}
          multiline
        />
        <Pressable style={styles.sendButton} onPress={send} disabled={!text.trim()}>
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  list: { padding: 12 },
  bubbleRow: { marginBottom: 8, flexDirection: "row", alignItems: "flex-end", gap: 4 },
  bubbleRowMine: { justifyContent: "flex-end" },
  bubbleRowTheirs: { justifyContent: "flex-start" },
  bubble: { maxWidth: "78%", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMine: { backgroundColor: "#E11D74" },
  bubbleTheirs: { backgroundColor: "#f0f0f0" },
  bubbleTextMine: { color: "#fff", fontSize: 15 },
  bubbleTextTheirs: { color: "#222", fontSize: 15 },
  bubbleImage: { width: 200, height: 200, borderRadius: 10 },
  statusRead: { fontSize: 11, color: "#3b82f6" },
  statusDefault: { fontSize: 11, color: "#999" },
  typing: { paddingHorizontal: 16, paddingBottom: 4, color: "#999", fontSize: 13, fontStyle: "italic" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: "#E11D74",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
