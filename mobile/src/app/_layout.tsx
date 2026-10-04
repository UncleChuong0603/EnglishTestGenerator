import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "@/auth/auth-context";
import { colors } from "@/theme";

function Navigation() {
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerStyle: { backgroundColor: colors.paper }, headerTintColor: colors.ink, headerShadowVisible: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="practice/[id]" options={{ title: vi ? "Luyện tập" : "Practice", headerBackTitle: vi ? "Trang chủ" : "Home" }} />
        <Stack.Screen name="result/[id]" options={{ title: vi ? "Kết quả" : "Result", headerBackVisible: false }} />
        <Stack.Screen name="mistakes" options={{ title: vi ? "Câu sai cần ôn" : "Mistake Bank" }} />
        <Stack.Screen name="vocabulary" options={{ title: vi ? "Từ vựng" : "Vocabulary" }} />
        <Stack.Screen name="account-data" options={{ title: vi ? "Tài khoản & dữ liệu" : "Account & data" }} />
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
