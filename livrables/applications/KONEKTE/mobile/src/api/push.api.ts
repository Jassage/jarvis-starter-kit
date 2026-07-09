import api from "./client";

export const registerPushToken = async (token: string) => {
  await api.put("/notifications/push-token", { token });
};
