export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export type SwipeAction = "LIKE" | "PASS" | "SUPER_LIKE";

export interface Prompt {
  q: string;
  a: string;
}

export interface DiscoverProfile {
  userId: string;
  firstName: string;
  age: number;
  city: string;
  bio?: string | null;
  occupation?: string | null;
  photos: string[];
  mainPhoto: string | null;
  isVerified: boolean;
  isOnline: boolean;
  compatibility: number;
  commonInterests: string[];
  distanceKm: number | null;
  prompt1?: Prompt | null;
  prompt2?: Prompt | null;
}

export type MessageType = "TEXT" | "IMAGE" | "VOICE";
export type MessageStatus = "SENT" | "DELIVERED" | "READ";

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  type: MessageType;
  content?: string;
  mediaUrl?: string;
  status: MessageStatus;
  createdAt: string;
}

// Réponse brute Prisma incluse dans POST /swipes quand un match se crée
// (voir swipe.service.ts) : pas de conversationId direct ici, il faut
// repasser par GET /swipes/matches pour l'obtenir.
export interface SwipeMatchUserSnapshot {
  id: string;
  profile?: { firstName: string } | null;
  photos: { url: string }[];
}

export interface SwipeMatch {
  id: string;
  userAId: string;
  userBId: string;
  userA: SwipeMatchUserSnapshot;
  userB: SwipeMatchUserSnapshot;
}

export interface SwipeResult {
  action: SwipeAction;
  isMatch: boolean;
  match: SwipeMatch | null;
}

export interface MatchUser {
  id: string;
  firstName?: string;
  age: number | null;
  city?: string;
  mainPhoto: string | null;
  isOnline: boolean;
  isVerified: boolean;
}

export interface MatchLastMessage {
  content?: string;
  createdAt: string;
  isFromMe: boolean;
  status: MessageStatus;
}

export interface MatchListItem {
  matchId: string;
  conversationId: string | null;
  matchedAt: string;
  user: MatchUser;
  lastMessage: MatchLastMessage | null;
  unreadCount: number;
}

export interface ProfilePhoto {
  id: string;
  url: string;
  isMain: boolean;
  order: number;
}

export interface MyProfile {
  userId: string;
  email?: string;
  subscriptionPlan?: string;
  firstName: string;
  age: number;
  bio?: string | null;
  occupation?: string | null;
  city?: string | null;
  isVerified: boolean;
  profileComplete: number;
  photos: ProfilePhoto[];
}

// GET /profiles/:userId — même service que MyProfile mais pour un tiers :
// pas de photos[] détaillées (le endpoint des tiers ne les renvoie pas dans
// ce shape), en revanche conversationId/compatibility/commonInterests en plus.
export interface ViewedProfile {
  userId: string;
  firstName: string;
  age: number;
  bio?: string | null;
  occupation?: string | null;
  city?: string | null;
  isVerified: boolean;
  isOnline: boolean;
  conversationId: string | null;
  compatibility: number;
  commonInterests: string[];
  prompt1?: Prompt | null;
  prompt2?: Prompt | null;
  photos: ProfilePhoto[];
}

export interface SearchResult {
  userId: string;
  firstName: string;
  age: number;
  city: string;
  mainPhoto: string | null;
  isVerified: boolean;
}

export interface LikeReceived {
  swipeId: string;
  action: SwipeAction;
  createdAt: string;
  user: {
    id: string;
    firstName: string | null;
    age: number | null;
    city: string | null;
    mainPhoto: string | null;
  };
}
