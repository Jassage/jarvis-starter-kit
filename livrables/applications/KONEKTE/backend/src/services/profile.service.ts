import { prisma } from "../lib/prisma";
import { Gender, RelationType } from "@prisma/client";

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  occupation?: string;
  city?: string;
  height?: number;
  religion?: string;
  hasChildren?: boolean;
  wantsChildren?: boolean;
  educationLevel?: string;
  interests?: string[];
  lookingFor?: Gender[];
  relationTypes?: RelationType[];
  minAge?: number;
  maxAge?: number;
  maxDistance?: number;
  prompt1Question?: string;
  prompt1Answer?: string;
  prompt2Question?: string;
  prompt2Answer?: string;
  prompt3Question?: string;
  prompt3Answer?: string;
}

export const getProfileService = async (targetUserId: string, viewerId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId, isActive: true, isBanned: false },
    include: {
      profile: true,
      photos: { orderBy: { order: "asc" } },
    },
  });

  if (!user || !user.profile) throw new Error("Profil introuvable");

  const isOwn = viewerId === targetUserId;

  const isBlocked = !isOwn && await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: viewerId, blockedId: targetUserId },
        { blockerId: targetUserId, blockedId: viewerId },
      ],
    },
  });
  if (isBlocked) throw new Error("Profil introuvable");

  const age = Math.floor(
    (Date.now() - user.profile.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  // Conversation partagée avec le viewer
  let conversationId: string | null = null;
  let compatibility = 0;
  let commonInterests: string[] = [];

  if (!isOwn) {
    const [userAId, userBId] = [viewerId, targetUserId].sort();
    const match = await prisma.match.findFirst({
      where: { userAId, userBId, isActive: true },
      include: { conversation: { select: { id: true } } },
    });
    conversationId = match?.conversation?.id ?? null;

    const viewerProfile = await prisma.profile.findUnique({ where: { userId: viewerId }, select: { interests: true } });
    const viewerInterests = (viewerProfile?.interests as string[]) ?? [];
    const targetInterests = (user.profile.interests as string[]) ?? [];
    commonInterests = viewerInterests.filter((i) => targetInterests.includes(i));
    compatibility = targetInterests.length > 0
      ? Math.round((commonInterests.length / Math.max(viewerInterests.length, targetInterests.length)) * 100)
      : 0;
  }

  return {
    userId: user.id,
    email: viewerId === targetUserId ? user.email : undefined,
    isEmailVerified: viewerId === targetUserId ? user.isEmailVerified : undefined,
    subscriptionPlan: viewerId === targetUserId ? user.subscriptionPlan : undefined,
    firstName: user.profile.firstName,
    lastName: user.profile.lastName,
    age,
    gender: user.profile.gender,
    bio: user.profile.bio,
    occupation: user.profile.occupation,
    city: user.profile.city,
    country: user.profile.country,
    height: user.profile.height,
    religion: user.profile.religion,
    hasChildren: user.profile.hasChildren,
    wantsChildren: user.profile.wantsChildren,
    educationLevel: user.profile.educationLevel,
    interests: user.profile.interests,
    lookingFor: user.profile.lookingFor,
    relationTypes: user.profile.relationTypes,
    minAge: user.profile.minAge,
    maxAge: user.profile.maxAge,
    maxDistance: user.profile.maxDistance,
    prompt1: user.profile.prompt1Question
      ? { q: user.profile.prompt1Question, a: user.profile.prompt1Answer }
      : null,
    prompt2: user.profile.prompt2Question
      ? { q: user.profile.prompt2Question, a: user.profile.prompt2Answer }
      : null,
    prompt3: user.profile.prompt3Question
      ? { q: user.profile.prompt3Question, a: user.profile.prompt3Answer }
      : null,
    isVerified: user.profile.isVerified,
    profileComplete: user.profile.profileComplete,
    isOnline: Date.now() - user.lastSeenAt.getTime() < 5 * 60 * 1000,
    conversationId,
    compatibility,
    commonInterests,
    photos: user.photos.map((p) => ({
      id: p.id,
      url: p.url,
      isMain: p.isMain,
      order: p.order,
    })),
  };
};

export const updateProfileService = async (userId: string, data: UpdateProfileData) => {
  const updated = await prisma.profile.update({
    where: { userId },
    data: {
      ...data,
      lookingFor: data.lookingFor ?? undefined,
      relationTypes: data.relationTypes ?? undefined,
      interests: data.interests ?? undefined,
    },
  });

  const completionScore = computeCompletion(updated);
  await prisma.profile.update({
    where: { userId },
    data: { profileComplete: completionScore },
  });

  return { ...updated, profileComplete: completionScore };
};

const computeCompletion = (profile: {
  bio: string | null;
  occupation: string | null;
  height: number | null;
  religion: string | null;
  educationLevel: string | null;
  interests: unknown;
  prompt1Question: string | null;
  prompt2Question: string | null;
}): number => {
  let score = 40;
  if (profile.bio) score += 15;
  if (profile.occupation) score += 5;
  if (profile.height) score += 5;
  if (profile.religion) score += 5;
  if (profile.educationLevel) score += 5;
  const interests = (profile.interests as string[]) ?? [];
  if (interests.length >= 3) score += 10;
  if (profile.prompt1Question) score += 7;
  if (profile.prompt2Question) score += 8;
  return Math.min(100, score);
};

export const getUserNotifications = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};

export const markNotificationsRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
};
