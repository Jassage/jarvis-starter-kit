import { prisma } from "../lib/prisma";
import { DiscoverQuery } from "../types";

export const discoverService = async (userId: string, query: DiscoverQuery) => {
  const { page = 1, limit = 20, minAge = 18, maxAge = 60, gender } = query;
  const skip = (page - 1) * limit;

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });
  if (!currentUser?.profile) throw new Error("Profil incomplet");

  const alreadySwiped = await prisma.swipe.findMany({
    where: { senderId: userId },
    select: { receiverId: true },
  });
  const blockedRelations = await prisma.block.findMany({
    where: { OR: [{ blockerId: userId }, { blockedId: userId }] },
    select: { blockerId: true, blockedId: true },
  });

  const excludedIds = [
    userId,
    ...alreadySwiped.map((s) => s.receiverId),
    ...blockedRelations.map((b) =>
      b.blockerId === userId ? b.blockedId : b.blockerId
    ),
  ];

  const minBirthDate = new Date();
  minBirthDate.setFullYear(minBirthDate.getFullYear() - maxAge);
  const maxBirthDate = new Date();
  maxBirthDate.setFullYear(maxBirthDate.getFullYear() - minAge);

  const profiles = await prisma.profile.findMany({
    where: {
      userId: { notIn: excludedIds },
      birthDate: { gte: minBirthDate, lte: maxBirthDate },
      ...(gender ? { gender: gender as "HOMME" | "FEMME" | "AUTRE" } : {}),
    },
    include: {
      user: {
        include: {
          photos: { orderBy: { order: "asc" } },
        },
      },
    },
    skip,
    take: limit,
    orderBy: [
      { user: { isBoosted: "desc" } },
      { user: { lastSeenAt: "desc" } },
    ],
  });

  return profiles.map((p) => {
    const age = Math.floor(
      (Date.now() - p.birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    const myInterests = (currentUser.profile!.interests as string[]) ?? [];
    const theirInterests = (p.interests as string[]) ?? [];
    const commonInterests = theirInterests.filter((i) => myInterests.includes(i));
    const compatibility = Math.min(
      100,
      Math.round((commonInterests.length / Math.max(myInterests.length, 1)) * 100)
    );

    const myLat = currentUser.profile!.latitude;
    const myLon = currentUser.profile!.longitude;
    const theirLat = p.latitude;
    const theirLon = p.longitude;
    const distanceKm =
      myLat && myLon && theirLat && theirLon
        ? haversineKm(myLat, myLon, theirLat, theirLon)
        : null;

    return {
      userId: p.userId,
      firstName: p.firstName,
      age,
      city: p.city,
      bio: p.bio,
      occupation: p.occupation,
      interests: p.interests,
      photos: p.user.photos.map((ph) => ph.url),
      mainPhoto: p.user.photos.find((ph) => ph.isMain)?.url ?? p.user.photos[0]?.url ?? null,
      isVerified: p.isVerified,
      isOnline: isOnline(p.user.lastSeenAt),
      compatibility,
      commonInterests,
      distanceKm,
      prompt1: p.prompt1Question ? { q: p.prompt1Question, a: p.prompt1Answer } : null,
      prompt2: p.prompt2Question ? { q: p.prompt2Question, a: p.prompt2Answer } : null,
    };
  });
};

const isOnline = (lastSeen: Date) => {
  return Date.now() - lastSeen.getTime() < 5 * 60 * 1000;
};

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};
