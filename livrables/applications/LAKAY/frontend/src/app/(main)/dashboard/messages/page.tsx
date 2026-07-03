'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { messagesApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/hooks/useSocket';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { firstName: string; lastName: string };
}

interface MessagesPage {
  data: { messages: Message[] };
  meta?: { pagination?: { hasMore?: boolean; nextCursor?: string | null } };
}

interface Conversation {
  id: string;
  listing: { id: string; title: string; images: Array<{ url: string }> } | null;
  participants: Array<{ userId: string; user: { firstName: string; lastName: string } }>;
  messages: Message[];
  _count: { messages: number };
  unreadCount?: number;
}

export default function MessagesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const { joinConversation, leaveConversation, on, sendTyping } = useSocket();

  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: convsData, isLoading: convsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesApi.getConversations().then((r) => r.data.data as { conversations: Conversation[] }),
    refetchInterval: 30000,
  });

  const {
    data: msgData, isLoading: msgLoading, fetchNextPage, hasNextPage, isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['messages', selectedConvId],
    queryFn: ({ pageParam }) =>
      messagesApi.getMessages(selectedConvId!, pageParam ? { cursor: pageParam } : undefined)
        .then((r) => r.data as MessagesPage),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta?.pagination?.nextCursor ?? undefined,
    enabled: !!selectedConvId,
  });

  const sendMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      messagesApi.sendMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConvId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageText('');
    },
  });

  useEffect(() => {
    if (!selectedConvId) return;
    joinConversation(selectedConvId);
    return () => leaveConversation(selectedConvId);
  }, [selectedConvId, joinConversation, leaveConversation]);

  useEffect(() => {
    const cleanup = on('new_message', (msg: unknown) => {
      const typedMsg = msg as Message & { conversationId: string };
      // pages[0] = le lot le plus récent (le seul chargé sans curseur) : c'est là
      // que vient s'ajouter un message qui vient d'arriver en temps réel.
      queryClient.setQueryData(
        ['messages', typedMsg.conversationId],
        (old: InfiniteData<MessagesPage, string | undefined> | undefined) => {
          if (!old || old.pages.length === 0) return old;
          const pages = [...old.pages];
          pages[0] = { ...pages[0], data: { messages: [...pages[0].data.messages, typedMsg] } };
          return { ...old, pages };
        },
      );
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });
    return cleanup;
  }, [on, queryClient]);

  useEffect(() => {
    const cleanup = on('user_typing', (raw: unknown) => {
      const data = raw as { userId: string; conversationId: string };
      if (data.conversationId !== selectedConvId) return;
      setTypingUsers(prev => new Set([...prev, data.userId]));
      setTimeout(() => {
        setTypingUsers(prev => {
          const next = new Set(prev);
          next.delete(data.userId);
          return next;
        });
      }, 3000);
    });
    return cleanup;
  }, [on, selectedConvId]);

  const conversations: Conversation[] = convsData?.conversations || [];
  // pages[0] = lot le plus récent ; les suivants sont progressivement plus anciens
  // (chargés via "Charger les messages précédents") → on les remet en ordre chronologique.
  const messages: Message[] = msgData ? [...msgData.pages].reverse().flatMap((p) => p.data.messages) : [];
  const lastMessageId = messages[messages.length - 1]?.id;

  // Scroll vers le bas uniquement sur nouveau message ou changement de conversation —
  // PAS quand "Charger les messages précédents" préfixe des messages plus anciens
  // (le dernier message ne change pas dans ce cas, l'effet ne se redéclenche donc pas).
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConvId, lastMessageId]);

  const selectedConv = conversations.find(c => c.id === selectedConvId);

  const getOtherParticipant = (conv: Conversation) => {
    return conv.participants.find(p => p.userId !== user?.id)?.user;
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConvId) return;
    sendMutation.mutate({ conversationId: selectedConvId, content: messageText.trim() });
  };

  const handleTyping = () => {
    if (!selectedConvId) return;
    sendTyping(selectedConvId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {}, 3000);
  };

  const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: fr });
  };

  const formatConvDate = (conv: Conversation) => {
    const lastMsg = conv.messages?.[conv.messages.length - 1];
    if (!lastMsg) return '';
    const d = new Date(lastMsg.createdAt);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return format(d, 'HH:mm');
    return format(d, 'd MMM', { locale: fr });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex" style={{ height: '70vh' }}>
        {/* Sidebar conversations */}
        <div className={`w-full sm:w-80 border-r border-gray-200 flex flex-col ${selectedConvId ? 'hidden sm:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {convsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm">Aucune conversation</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const lastMsg = conv.messages?.[conv.messages.length - 1];
                const isSelected = conv.id === selectedConvId;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}
                  >
                    <div className="w-10 h-10 rounded-full bg-navy text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
                      {other?.firstName?.[0]}{other?.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {other?.firstName} {other?.lastName}
                        </p>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-1">
                          {formatConvDate(conv)}
                        </span>
                      </div>
                      {conv.listing && (
                        <p className="text-xs text-primary truncate">{conv.listing.title}</p>
                      )}
                      {lastMsg && (
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {lastMsg.senderId === user?.id ? 'Vous: ' : ''}{lastMsg.content}
                        </p>
                      )}
                    </div>
                    {(conv.unreadCount ?? 0) > 0 && (
                      <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className={`flex-1 flex flex-col ${!selectedConvId ? 'hidden sm:flex' : 'flex'}`}>
          {!selectedConvId ? (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500">Sélectionnez une conversation</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConvId(null)}
                  className="sm:hidden p-1.5 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {selectedConv && (
                  <>
                    <div className="w-9 h-9 rounded-full bg-navy text-white text-sm font-semibold flex items-center justify-center">
                      {getOtherParticipant(selectedConv)?.firstName?.[0]}
                      {getOtherParticipant(selectedConv)?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {getOtherParticipant(selectedConv)?.firstName}{' '}
                        {getOtherParticipant(selectedConv)?.lastName}
                      </p>
                      {selectedConv.listing && (
                        <p className="text-xs text-gray-500 truncate">{selectedConv.listing.title}</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {hasNextPage && (
                      <div className="flex justify-center mb-3">
                        <button
                          onClick={() => fetchNextPage()}
                          disabled={isFetchingNextPage}
                          className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-primary px-3 py-1.5 rounded-full border border-gray-200 hover:border-primary/30 disabled:opacity-50 transition-colors"
                        >
                          {isFetchingNextPage ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Chargement...</> : 'Charger les messages précédents'}
                        </button>
                      </div>
                    )}
                    {messages.map((msg, i) => {
                      const isOwn = msg.senderId === user?.id;
                      const prevMsg = messages[i - 1];
                      const showDate = !prevMsg || new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="flex items-center justify-center my-4">
                              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                {format(new Date(msg.createdAt), 'd MMMM yyyy', { locale: fr })}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2.5 rounded-2xl ${
                              isOwn
                                ? 'bg-primary text-white rounded-br-sm'
                                : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                            }`}>
                              <p className="text-sm leading-relaxed">{msg.content}</p>
                              <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'} text-right`}>
                                {formatTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {typingUsers.size > 0 && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-gray-200 flex gap-2">
                <input
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  onKeyDown={handleTyping}
                  placeholder="Écrivez un message..."
                  className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sendMutation.isPending}
                  className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
