import Ionicons from "@expo/vector-icons/Ionicons";
import { Redirect, Tabs } from "expo-router";
import { useAuth } from "@/auth/auth-context";
import { Loading, Screen } from "@/components/ui";
import { colors } from "@/theme";

export default function TabsLayout() {
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  if (auth.loading) return <Screen><Loading label={vi ? "Đang tải dữ liệu…" : "Loading…"} /></Screen>;
  if (!auth.token) return <Redirect href="/sign-in" />;
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.forest,
      tabBarInactiveTintColor: colors.muted,
      tabBarStyle: { minHeight: 64, paddingTop: 6, backgroundColor: colors.surface, borderTopColor: colors.rule },
      tabBarLabelStyle: { fontSize: 12, fontWeight: "600" },
    }}>
      <Tabs.Screen name="index" options={{ title: vi ? "Hôm nay" : "Today", tabBarIcon: ({ color, size }) => <Ionicons color={color} name="home-outline" size={size} /> }} />
      <Tabs.Screen name="practice" options={{ title: vi ? "Luyện tập" : "Practice", tabBarIcon: ({ color, size }) => <Ionicons color={color} name="barbell-outline" size={size} /> }} />
      <Tabs.Screen name="progress" options={{ title: vi ? "Tiến độ" : "Progress", tabBarIcon: ({ color, size }) => <Ionicons color={color} name="stats-chart-outline" size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: vi ? "Cài đặt" : "Settings", tabBarIcon: ({ color, size }) => <Ionicons color={color} name="settings-outline" size={size} /> }} />
    </Tabs>
  );
}
