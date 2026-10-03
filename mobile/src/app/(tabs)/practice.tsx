import { useState } from "react";
import { router } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { api, MobileApiError } from "@/api/client";
import { useAuth } from "@/auth/auth-context";
import { Card, ErrorBanner, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { colors } from "@/theme";

export default function PracticeTab() {
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (!auth.token) return;
    setBusy(true);
    setError(null);
    try {
      const response = await api.startPractice(auth.token, { kind: "CUSTOM", skillArea: "READING", part: 5, questionCount: 10 });
      router.push(`/practice/${response.data.id}`);
    } catch (cause) {
      if (cause instanceof MobileApiError && cause.code === "UNAUTHENTICATED") {
        await auth.signOut();
        return;
      }
      setError(cause instanceof Error ? cause.message : (vi ? "Không thể bắt đầu bài luyện." : "Could not start practice."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>{vi ? "Luyện tập" : "Practice"}</Title>
      <Muted>{vi ? "Mobile V1 hỗ trợ Part 5 đầy đủ. Câu hỏi do máy chủ chọn và kết quả được chấm trên máy chủ." : "Mobile V1 fully supports Part 5. The server chooses questions and scores the result."}</Muted>
      {error ? <ErrorBanner message={error} /> : null}
      <Card>
        <Text style={styles.title}>Reading · Part 5</Text>
        <Muted>{vi ? "10 câu hoàn thành câu. Mỗi lựa chọn được lưu trên máy chủ để bạn có thể mở lại ứng dụng." : "10 sentence-completion questions. Every selection is saved on the server so you can reopen the app."}</Muted>
        <PrimaryButton busy={busy} label={vi ? "Luyện 10 câu Part 5" : "Practice 10 Part 5 questions"} onPress={() => void start()} />
      </Card>
      <Card>
        <Text style={styles.title}>Today’s Workout</Text>
        <Muted>{vi ? "Bài luyện thích ứng dùng cùng recommendation engine với web." : "Your adaptive workout uses the same recommendation engine as the web app."}</Muted>
        <PrimaryButton busy={busy} label={vi ? "Mở bài hôm nay" : "Open today’s workout"} onPress={() => router.navigate("/(tabs)")} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({ title: { color: colors.ink, fontSize: 20, fontWeight: "800" } });
