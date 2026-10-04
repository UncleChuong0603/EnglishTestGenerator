import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { setAudioModeAsync } from "expo-audio";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/auth/auth-context";
import { colors } from "@/theme";
import { safeNotificationHref } from "@/lib/notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldPlaySound: false, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
});

function Navigation() {
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  useEffect(() => {
    void setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: "doNotMix" });
  }, []);
  useEffect(() => {
    if (!auth.token) return;
    const redirect = (notification: Notifications.Notification) => {
      const href = safeNotificationHref(notification.request.content.data?.target);
      if (href) router.push(href);
    };
    const response = Notifications.getLastNotificationResponse();
    if (response?.notification) redirect(response.notification);
    const subscription = Notifications.addNotificationResponseReceivedListener((next) => redirect(next.notification));
    return () => subscription.remove();
  }, [auth.token]);
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: colors.paper }, headerTintColor: colors.ink, headerShadowVisible: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Protected guard={Boolean(auth.token)}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="practice/[id]" options={{ title: vi ? "Luyện tập" : "Practice", headerBackTitle: vi ? "Trang chủ" : "Home" }} />
          <Stack.Screen name="result/[id]" options={{ title: vi ? "Kết quả" : "Result", headerBackVisible: false }} />
          <Stack.Screen name="mistakes" options={{ title: vi ? "Câu sai cần ôn" : "Mistake Bank" }} />
          <Stack.Screen name="vocabulary" options={{ title: vi ? "Từ vựng" : "Vocabulary" }} />
          <Stack.Screen name="account-data" options={{ title: vi ? "Tài khoản & dữ liệu" : "Account & data" }} />
          <Stack.Screen name="notification-settings" options={{ title: vi ? "Nhắc học" : "Reminders" }} />
          <Stack.Screen name="workout" options={{ title: vi ? "Bài tập hôm nay" : "Today’s Workout" }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
