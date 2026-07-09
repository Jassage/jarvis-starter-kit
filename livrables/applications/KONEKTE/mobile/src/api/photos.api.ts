import api from "./client";
import { ProfilePhoto } from "../types";

export const uploadPhoto = async (file: { uri: string; name: string; type: string }, isMain = false) => {
  const form = new FormData();
  form.append("photo", file as unknown as Blob);
  form.append("isMain", String(isMain));
  const { data } = await api.post<{ success: boolean; data: ProfilePhoto }>("/photos", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
};
