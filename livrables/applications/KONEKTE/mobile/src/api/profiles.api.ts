import api from "./client";
import { MyProfile, ViewedProfile } from "../types";

export const fetchMyProfile = async () => {
  const { data } = await api.get<{ success: boolean; data: MyProfile }>("/profiles/me");
  return data.data;
};

export const fetchProfile = async (userId: string) => {
  const { data } = await api.get<{ success: boolean; data: ViewedProfile }>(`/profiles/${userId}`);
  return data.data;
};

export const updateMyProfile = async (payload: Record<string, unknown>) => {
  const { data } = await api.put("/profiles/me", payload);
  return data.data;
};
