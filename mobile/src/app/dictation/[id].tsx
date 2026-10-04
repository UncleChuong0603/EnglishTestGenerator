import Ionicons from "@expo/vector-icons/Ionicons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { api, apiOrigin } from "@/api/client";
import type {
  DictationAttemptResponse,
  DictationHintResponse,
  DictationSessionResponse,
} from "@/api/types";
import { useAuth } from "@/auth/auth-context";
import {
  Card,
  ErrorBanner,
  Loading,
  Muted,
  PrimaryButton,
  Screen,
  Title,
} from "@/components/ui";
import { colors, radius, space } from "@/theme";

export default function DictationPracticeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  const [session, setSession] = useState<
    DictationSessionResponse["data"] | null
  >(null);
  const [answer, setAnswer] = useState("");
  const [hint, setHint] = useState<DictationHintResponse["data"] | null>(null);
  const [result, setResult] = useState<
    DictationAttemptResponse["data"]["result"] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [speed, setSpeed] = useState<0.75 | 1>(1);
  const audioUrl = session
    ? session.audioUrl.startsWith("http")
      ? session.audioUrl
      : `${apiOrigin}${session.audioUrl}`
    : null;
  const player = useAudioPlayer(audioUrl, { updateInterval: 500 });
  const status = useAudioPlayerStatus(player);
  useEffect(() => {
    if (!auth.token || !id) return;
    void api
      .dictation(auth.token, id)
      .then((response) => setSession(response.data))
      .catch(() =>
        setError(
          vi ? "Không thể tải buổi luyện." : "Could not load this session.",
        ),
      );
  }, [auth.token, id, vi]);
  useEffect(() => () => player.setActiveForLockScreen(false), [player]);
  async function toggle() {
    if (status.playing) {
      player.pause();
      return;
    }
    if (status.duration > 0 && status.currentTime >= status.duration - 0.15)
      await player.seekTo(0);
    player.play();
  }
  async function repeat() {
    await player.seekTo(0);
    player.play();
  }
  function changeSpeed() {
    const next = speed === 1 ? 0.75 : 1;
    setSpeed(next);
    player.setPlaybackRate(next);
  }
  async function showHint() {
    if (!auth.token || !id) return;
    setBusy(true);
    try {
      setHint((await api.dictationHint(auth.token, id)).data);
    } catch {
      setError(vi ? "Không thể mở gợi ý." : "Could not load hint.");
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!auth.token || !id) return;
    if (!answer.trim()) {
      setError(
        vi ? "Hãy nhập điều bạn nghe được." : "Type what you heard first.",
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const response = await api.submitDictation(auth.token, id, { answer });
      setSession(response.data);
      setResult(response.data.result);
    } catch {
      setError(vi ? "Chưa thể kiểm tra." : "Could not check your answer.");
    } finally {
      setBusy(false);
    }
  }
  if (!session)
    return (
      <Screen>{error ? <ErrorBanner message={error} /> : <Loading />}</Screen>
    );
  return (
    <Screen keyboardShouldPersistTaps="handled">
      <Title>{vi ? session.title.vi : session.title.en}</Title>
      <Muted>
        {vi
          ? "Nghe toàn bộ segment và chép lại. Dấu câu, chữ hoa được bỏ qua; từ thiếu hoặc thay thế vẫn được tính."
          : "Listen to the full segment and transcribe it. Punctuation and capitals are ignored; missing or substituted words still count."}
      </Muted>
      <Card>
        <View style={styles.audioRow}>
          <Pressable
            accessibilityLabel={
              status.playing
                ? vi
                  ? "Tạm dừng"
                  : "Pause"
                : vi
                  ? "Phát audio"
                  : "Play audio"
            }
            accessibilityRole="button"
            onPress={() => void toggle()}
            style={styles.roundButton}
          >
            <Ionicons
              color="#fff"
              name={status.playing ? "pause" : "play"}
              size={24}
            />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={styles.audioTitle}>
              {vi ? "Segment 1 phút" : "One-minute segment"}
            </Text>
            <Text style={styles.time}>
              {Math.floor(status.currentTime)}s / {Math.floor(status.duration)}s
            </Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => void repeat()}
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>
              {vi ? "Nghe lại" : "Repeat"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={changeSpeed}
            style={styles.secondary}
          >
            <Text style={styles.secondaryText}>{speed}×</Text>
          </Pressable>
        </View>
      </Card>
      <Text style={styles.label}>
        {vi ? "Điều bạn nghe được" : "What you heard"}
      </Text>
      <TextInput
        accessibilityLabel={vi ? "Nội dung chính tả" : "Dictation answer"}
        autoCapitalize="none"
        multiline
        onChangeText={setAnswer}
        spellCheck={false}
        style={styles.input}
        textAlignVertical="top"
        value={answer}
      />
      {error ? <ErrorBanner message={error} /> : null}
      <View style={styles.actions}>
        <View style={{ flex: 1 }}>
          <PrimaryButton
            busy={busy}
            label={vi ? "Kiểm tra" : "Check"}
            onPress={() => void submit()}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={busy || Boolean(hint)}
          onPress={() => void showHint()}
          style={styles.secondary}
        >
          <Text style={styles.secondaryText}>{vi ? "Gợi ý" : "Hint"}</Text>
        </Pressable>
      </View>
      {hint ? (
        <Card>
          <Text>
            {vi
              ? `Có ${hint.wordCount} từ; bắt đầu bằng “${hint.openingWord}”.`
              : `${hint.wordCount} words; starts with “${hint.openingWord}”.`}
          </Text>
        </Card>
      ) : null}
      {result ? (
        <Card>
          <Text accessibilityLiveRegion="polite" style={styles.result}>
            {result.exact
              ? vi
                ? "Đã chép chính xác — segment đã thành thạo."
                : "Exact transcription — segment mastered."
              : vi
                ? `Khớp ${result.accuracy}%. Nghe lại rồi thử tiếp.`
                : `${result.accuracy}% matched. Listen again and retry.`}
          </Text>
          {result.missingWords.length ? (
            <Muted>
              {vi
                ? `Từ cần nghe lại: ${result.missingWords.join(", ")}`
                : `Words to listen for: ${result.missingWords.join(", ")}`}
            </Muted>
          ) : null}
        </Card>
      ) : null}
      {session.transcript ? (
        <Card>
          <Text style={styles.audioTitle}>Transcript</Text>
          <Text style={styles.transcript}>{session.transcript}</Text>
          <Muted>
            {vi
              ? "Kết quả segment này không quy đổi thành điểm TOEIC."
              : "This segment result is not converted into a TOEIC score."}
          </Muted>
        </Card>
      ) : (
        <Card>
          <Muted>
            {vi
              ? "Transcript sẽ hiện sau lần kiểm tra đầu."
              : "The transcript appears after your first check."}
          </Muted>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  audioRow: { flexDirection: "row", alignItems: "center", gap: space.md },
  roundButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.forest,
    alignItems: "center",
    justifyContent: "center",
  },
  audioTitle: { color: colors.ink, fontSize: 18, fontWeight: "800" },
  time: { color: colors.muted, marginTop: 3 },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.sm,
    alignItems: "center",
  },
  secondary: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.forest,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryText: { color: colors.forest, fontWeight: "800" },
  label: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  input: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    padding: space.md,
    color: colors.ink,
    fontSize: 16,
    lineHeight: 24,
  },
  result: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  transcript: { color: colors.ink, fontSize: 16, lineHeight: 25 },
});
