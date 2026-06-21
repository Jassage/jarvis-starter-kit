"use client";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Send, ArrowLeft, Check, CheckCheck, Smile, MoreVertical, Flag, ShieldOff, HeartOff, Mic, MicOff, ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useSocketStore } from "@/store/socket.store";
import { photoUrl } from "@/lib/photo";

interface Message {
  id: string;
  senderId: string;
  content: string;
  type: "TEXT" | "IMAGE" | "VOICE";
  mediaUrl?: string | null;
  status: "SENT" | "DELIVERED" | "READ";
  createdAt: string;
}

function MessageStatus({ status, isMe }: { status: Message["status"]; isMe: boolean }) {
  if (!isMe) return null;
  if (status === "READ") return <CheckCheck size={12} className="inline ml-1 text-blue-300" />;
  if (status === "DELIVERED") return <CheckCheck size={12} className="inline ml-1 opacity-60" />;
  return <Check size={12} className="inline ml-1 opacity-40" />;
}

export default function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuthStore();
  const { socket } = useSocketStore();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [otherName, setOtherName] = useState("Conversation");
  const [otherPhoto, setOtherPhoto] = useState<string | null>(null);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherOnline, setOtherOnline] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [imagePreview, setImagePreview] = useState<{ file: File; url: string } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.get(`/messages/${conversationId}`)
      .then((r) => {
        setMessages(r.data.data);
        const other = r.data.otherUser;
        if (other?.firstName) setOtherName(other.firstName);
        if (other?.mainPhoto) setOtherPhoto(other.mainPhoto);
        if (other?.userId) setOtherUserId(other.userId);
        if (other?.isOnline) setOtherOnline(other.isOnline);
        if (r.data.matchId) setMatchId(r.data.matchId);
      })
      .catch(() => {});
  }, [conversationId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("conversation:join", conversationId);

    const onNew = (msg: Message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === msg.id);
        if (exists) return prev.map((m) => m.id === msg.id ? msg : m);
        return [...prev, msg];
      });
    };
    const onRead = () => {
      setMessages((prev) =>
        prev.map((m) => m.senderId === user?.id ? { ...m, status: "READ" } : m)
      );
    };
    const onTypingStart = () => setIsTyping(true);
    const onTypingStop = () => setIsTyping(false);

    socket.on("message:new", onNew);
    socket.on("message:read", onRead);
    socket.on("typing:start", onTypingStart);
    socket.on("typing:stop", onTypingStop);

    return () => {
      socket.emit("conversation:leave", conversationId);
      socket.off("message:new", onNew);
      socket.off("message:read", onRead);
      socket.off("typing:start", onTypingStart);
      socket.off("typing:stop", onTypingStop);
    };
  }, [socket, conversationId, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleTyping = () => {
    socket?.emit("typing:start", conversationId);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket?.emit("typing:stop", conversationId);
    }, 1500);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);

    const tempId = `temp_${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      senderId: user!.id,
      content,
      type: "TEXT",
      status: "SENT",
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await api.post(`/messages/${conversationId}`, { content });
      const saved: Message = res.data.data;
      setMessages((prev) => prev.map((m) => m.id === tempId ? saved : m));
      socket?.emit("message:send", { conversationId, content, messageId: saved.id });
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast.error("Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleBlock = async () => {
    if (!otherUserId) return;
    if (!confirm(`Bloquer ${otherName} ? Vous ne vous verrez plus.`)) return;
    try {
      await api.post(`/moderation/block/${otherUserId}`);
      toast.success(`${otherName} a été bloqué`);
      router.push("/matches");
    } catch { toast.error("Erreur"); }
  };

  const handleUnmatch = async () => {
    if (!matchId) return;
    if (!confirm(`Dématcher avec ${otherName} ? La conversation sera supprimée.`)) return;
    try {
      await api.delete(`/swipes/match/${matchId}`);
      toast.success("Vous avez dématé");
      router.push("/matches");
    } catch { toast.error("Erreur"); }
  };

  const handleReport = async () => {
    if (!otherUserId || !reportReason) return;
    try {
      await api.post("/moderation/report", { reportedId: otherUserId, reason: reportReason });
      toast.success("Signalement envoyé");
      setShowReport(false);
      setReportReason("");
    } catch { toast.error("Erreur lors du signalement"); }
  };

  const sendMedia = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const tempId = `temp_${Date.now()}`;
    const isImage = file.type.startsWith("image/");
    const optimistic: Message = {
      id: tempId, senderId: user!.id,
      content: isImage ? "📷 Photo" : "🎤 Message vocal",
      type: isImage ? "IMAGE" : "VOICE",
      mediaUrl: isImage ? URL.createObjectURL(file) : null,
      status: "SENT", createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    try {
      const res = await api.post(`/messages/${conversationId}/media`, form);
      const saved: Message = res.data.data;
      setMessages((prev) => prev.map((m) => m.id === tempId ? saved : m));
      socket?.emit("message:send", { conversationId, content: saved.content, messageId: saved.id });
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      toast.error("Erreur lors de l'envoi");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
        sendMedia(file);
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("Microphone non disponible");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setRecording(false);
    setRecordingSeconds(0);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview({ file, url: URL.createObjectURL(file) });
    e.target.value = "";
  };

  const sendImagePreview = () => {
    if (!imagePreview) return;
    sendMedia(imagePreview.file);
    setImagePreview(null);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-HT", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative" onClick={() => { setShowMenu(false); setShowEmoji(false); }}>
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 z-10 shadow-sm">
        <Link href="/matches" className="text-gray-400 hover:text-gray-600 flex-shrink-0">
          <ArrowLeft size={22} />
        </Link>

        <Link
          href={otherUserId ? `/profile/${otherUserId}` : "#"}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="relative flex-shrink-0">
            <div
              className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm"
              style={{ background: "#FBEAF0", color: "#993556" }}
            >
              {photoUrl(otherPhoto)
                ? <img src={photoUrl(otherPhoto)!} alt="" className="w-full h-full object-cover" />
                : otherName[0]}
            </div>
            {otherOnline && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm leading-tight truncate">{otherName}</p>
            {isTyping
              ? <p className="text-xs text-pink-400">en train d&apos;écrire...</p>
              : <p className="text-xs text-gray-400">{otherOnline ? "En ligne" : "Voir le profil"}</p>
            }
          </div>
        </Link>

        {/* Bouton menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <MoreVertical size={20} className="text-gray-400" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-xl border border-gray-100 w-52 overflow-hidden z-10">
              <button
                onClick={() => { setShowMenu(false); setShowReport(true); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Flag size={16} className="text-orange-400" />
                Signaler {otherName}
              </button>
              <button
                onClick={() => { setShowMenu(false); handleBlock(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <ShieldOff size={16} className="text-red-400" />
                Bloquer {otherName}
              </button>
              <button
                onClick={() => { setShowMenu(false); handleUnmatch(); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"
              >
                <HeartOff size={16} />
                Dématcher
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal signalement */}
      {showReport && (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setShowReport(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 mb-4">Signaler {otherName}</h3>
            <div className="flex flex-col gap-2 mb-4">
              {["FAUX_PROFIL", "HARCELEMENT", "CONTENU_INAPPROPRIE"].map((r) => (
                <button
                  key={r}
                  onClick={() => setReportReason(r)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition-all"
                  style={{
                    borderColor: reportReason === r ? "#D4537E" : "#e5e7eb",
                    background: reportReason === r ? "#FBEAF0" : "white",
                    color: reportReason === r ? "#993556" : "#374151",
                  }}
                >
                  {r === "FAUX_PROFIL" ? "Faux profil" : r === "HARCELEMENT" ? "Harcèlement" : "Contenu inapproprié"}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowReport(false)} className="flex-1 py-2.5 rounded-xl border text-sm text-gray-500">Annuler</button>
              <button
                onClick={handleReport}
                disabled={!reportReason}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity"
                style={{ background: "#D4537E", opacity: reportReason ? 1 : 0.5 }}
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          const mediaFullUrl = msg.mediaUrl
            ? (msg.mediaUrl.startsWith("http") ? msg.mediaUrl : `http://localhost:4000${msg.mediaUrl}`)
            : null;
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              {msg.type === "IMAGE" && mediaFullUrl ? (
                <div
                  className="overflow-hidden rounded-2xl shadow-sm"
                  style={{
                    maxWidth: 220,
                    borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    opacity: msg.id.startsWith("temp_") ? 0.6 : 1,
                  }}
                >
                  <img
                    src={mediaFullUrl}
                    alt="Photo"
                    className="w-full object-cover max-h-64 cursor-pointer"
                    onClick={() => window.open(mediaFullUrl, "_blank")}
                  />
                </div>
              ) : msg.type === "VOICE" && mediaFullUrl ? (
                <div
                  className="px-3 py-2 rounded-2xl flex items-center gap-2"
                  style={{
                    background: isMe ? "#D4537E" : "white",
                    borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    opacity: msg.id.startsWith("temp_") ? 0.6 : 1,
                    minWidth: 180,
                  }}
                >
                  <span className="text-lg">🎤</span>
                  <audio controls src={mediaFullUrl} className="h-8" style={{ minWidth: 140 }} />
                </div>
              ) : (
                <div
                  className="max-w-xs px-4 py-2 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: isMe ? "#D4537E" : "white",
                    color: isMe ? "white" : "#374151",
                    borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    opacity: msg.id.startsWith("temp_") ? 0.6 : 1,
                  }}
                >
                  {msg.content}
                </div>
              )}
              <div className="flex items-center gap-1 mt-0.5 px-1">
                <span className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>
                <MessageStatus status={msg.status} isMe={isMe} />
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {showEmoji && (
        <div className="absolute bottom-20 left-0 right-0 z-10 px-2">
          <EmojiPicker
            theme={Theme.LIGHT}
            width="100%"
            height={320}
            onEmojiClick={(data: EmojiClickData) => {
              setInput((prev) => prev + data.emoji);
              setShowEmoji(false);
            }}
            searchDisabled={false}
            skinTonesDisabled
          />
        </div>
      )}

      {/* Prévisualisation image avant envoi */}
      {imagePreview && (
        <div className="bg-white border-t border-gray-100 px-3 pt-3 flex items-end gap-2">
          <div className="relative">
            <img src={imagePreview.url} alt="" className="h-24 w-20 object-cover rounded-xl" />
            <button onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
              <X size={11} className="text-white" />
            </button>
          </div>
          <button onClick={sendImagePreview} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white mb-0.5" style={{ background: "#D4537E" }}>
            Envoyer la photo
          </button>
        </div>
      )}

      <div className="bg-white border-t border-gray-100 px-3 py-3 flex items-center gap-2">
        {/* Emoji */}
        <button
          onClick={() => setShowEmoji((v) => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
          style={{ color: showEmoji ? "#D4537E" : "#9ca3af" }}
        >
          <Smile size={22} />
        </button>

        {recording ? (
          /* Mode enregistrement vocal */
          <div className="flex-1 flex items-center gap-2 bg-red-50 rounded-full px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <span className="text-sm text-red-400 font-medium flex-1">
              {Math.floor(recordingSeconds / 60).toString().padStart(2, "0")}:{(recordingSeconds % 60).toString().padStart(2, "0")}
            </span>
            <button onClick={stopRecording} className="text-xs text-red-400 font-semibold">Envoyer</button>
          </div>
        ) : (
          <input
            type="text"
            className="flex-1"
            placeholder="Écrire un message..."
            value={input}
            onChange={(e) => { setInput(e.target.value); handleTyping(); setShowEmoji(false); }}
            onKeyDown={handleKey}
            onFocus={() => setShowEmoji(false)}
          />
        )}

        {/* Bouton image */}
        {!recording && !input.trim() && (
          <button
            onClick={() => imageInputRef.current?.click()}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
            style={{ color: "#9ca3af" }}
          >
            <ImageIcon size={20} />
          </button>
        )}

        {/* Bouton micro / envoyer */}
        {!recording && !input.trim() ? (
          <button
            onPointerDown={startRecording}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{ background: "linear-gradient(135deg, #e8688a, #D4537E)", boxShadow: "0 3px 10px rgba(212,83,126,0.4)" }}
          >
            <Mic size={18} className="text-white" />
          </button>
        ) : !recording ? (
          <button
            onClick={sendMessage}
            disabled={sending}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
            style={{ background: "linear-gradient(135deg, #e8688a, #D4537E)", boxShadow: "0 3px 10px rgba(212,83,126,0.4)" }}
          >
            <Send size={17} className="text-white" />
          </button>
        ) : (
          <button onClick={stopRecording} className="w-10 h-10 rounded-full bg-red-400 flex items-center justify-center">
            <MicOff size={18} className="text-white" />
          </button>
        )}
      </div>

      <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageSelect} />
    </div>
  );
}
