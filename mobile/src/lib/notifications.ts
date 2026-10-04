import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { Href } from "expo-router";
import { api } from "@/api/client";
import { safeNotificationPath } from "@/lib/retention-policy";

const DEVICE_ID_KEY = "toeicgym.mobile.push-device.v1";

export function safeNotificationHref(target: unknown): Href | null {
  return safeNotificationPath(target) as Href | null;
}

export async function registerNotifications(token: string) {
  if (!Device.isDevice || !["android", "ios"].includes(Platform.OS)) throw new Error("Push notifications require a supported physical device.");
  if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("learning-reminders", { name: "Learning reminders", importance: Notifications.AndroidImportance.DEFAULT });
  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  if (!permission.granted) throw new Error("Notification permission was not granted.");
  const projectId = Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) throw new Error("EAS project ID is not configured for this build.");
  const expoPushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  const response = await api.registerPushDevice(token, { expoPushToken, platform: Platform.OS as "android" | "ios" });
  await SecureStore.setItemAsync(DEVICE_ID_KEY, response.data.id);
  return response.data.id;
}

export async function revokeNotifications(token: string) {
  const id = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (id) await api.revokePushDevice(token, id).catch(() => undefined);
  await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
}

export async function clearLocalNotificationDevice() {
  await SecureStore.deleteItemAsync(DEVICE_ID_KEY);
}
