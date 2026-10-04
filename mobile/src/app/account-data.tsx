import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { api, MobileApiError } from "@/api/client";
import { useAuth } from "@/auth/auth-context";
import {
  Card,
  ErrorBanner,
  Muted,
  PrimaryButton,
  Screen,
  Title,
} from "@/components/ui";
import { colors, radius, space } from "@/theme";

const PRIVACY_URL = "https://toeicgym.net/privacy";
const TERMS_URL = "https://toeicgym.net/terms";

function requestError(
  cause: unknown,
  vi: boolean,
  viFallback: string,
  enFallback: string,
) {
  if (cause instanceof MobileApiError) {
    if (cause.code === "NETWORK_ERROR") {
      return vi
        ? "Không thể kết nối mạng. Hãy kiểm tra Internet và thử lại."
        : "Could not connect. Check your internet connection and try again.";
    }
    if (cause.code === "TIMEOUT") {
      return vi
        ? "Kết nối mất quá nhiều thời gian. Vui lòng thử lại."
        : "The request timed out. Please try again.";
    }
    if (cause.code === "RATE_LIMITED") {
      return vi
        ? "Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau."
        : "Too many attempts. Please try again later.";
    }
    return vi ? viFallback : enFallback;
  }
  return cause instanceof Error
    ? cause.message
    : vi
      ? viFallback
      : enFallback;
}

export default function AccountDataScreen() {
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [acknowledge, setAcknowledge] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailMatches =
    confirmationEmail.trim().toLowerCase() ===
    (auth.me?.email ?? "").trim().toLowerCase();

  async function exportData() {
    if (!auth.token) return;
    setExporting(true);
    setError(null);
    try {
      const response = await api.exportAccountData(auth.token);
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error(
          vi
            ? "Thiết bị này chưa hỗ trợ bảng chia sẻ tệp."
            : "File sharing is not available on this device.",
        );
      }
      const date = new Date().toISOString().slice(0, 10);
      const file = new File(
        Paths.cache,
        `toeicgym-learning-data-${date}.json`,
      );
      file.create({ overwrite: true });
      file.write(JSON.stringify(response.data, null, 2));
      await Sharing.shareAsync(file.uri, {
        dialogTitle: vi ? "Lưu bản xuất dữ liệu" : "Save data export",
        mimeType: "application/json",
        UTI: "public.json",
      });
    } catch (cause) {
      if (
        cause instanceof MobileApiError &&
        cause.code === "UNAUTHENTICATED"
      ) {
        await auth.signOut();
        return;
      }
      setError(
        requestError(
          cause,
          vi,
          "Chưa thể xuất dữ liệu.",
          "Could not export your data.",
        ),
      );
    } finally {
      setExporting(false);
    }
  }

  function confirmDeletion() {
    Alert.alert(
      vi ? "Xóa vĩnh viễn tài khoản?" : "Permanently delete account?",
      vi
        ? "Dữ liệu học tập và mọi phiên đăng nhập sẽ bị xóa. Thao tác này không thể hoàn tác."
        : "Learning data and every signed-in session will be removed. This cannot be undone.",
      [
        { text: vi ? "Hủy" : "Cancel", style: "cancel" },
        {
          text: vi ? "Xóa tài khoản" : "Delete account",
          style: "destructive",
          onPress: () => void deleteAccount(),
        },
      ],
    );
  }

  async function deleteAccount() {
    if (!auth.token) return;
    setDeleting(true);
    setError(null);
    try {
      await api.deleteAccount(auth.token, {
        confirmationEmail: confirmationEmail.trim(),
        acknowledge: true,
      });
      await auth.completeAccountDeletion();
    } catch (cause) {
      if (cause instanceof MobileApiError) {
        if (cause.code === "UNAUTHENTICATED") {
          await auth.signOut();
          return;
        }
        if (cause.code === "VALIDATION_FAILED") {
          setError(
            vi
              ? "Email xác nhận không khớp với tài khoản."
              : "The confirmation email does not match this account.",
          );
        } else if (cause.code === "CONFLICT") {
          setError(
            vi
              ? "Tài khoản này cần được bộ phận hỗ trợ xử lý trước khi xóa."
              : "This account needs support assistance before deletion.",
          );
        } else if (["TIMEOUT", "NETWORK_ERROR"].includes(cause.code)) {
          setError(
            vi
              ? "Chưa nhận được xác nhận xóa. Hãy đăng nhập lại để kiểm tra trạng thái trước khi thử lại."
              : "Deletion was not confirmed. Sign in again to check the account state before retrying.",
          );
        } else {
          setError(
            requestError(
              cause,
              vi,
              "Chưa thể xóa tài khoản.",
              "Could not delete the account.",
            ),
          );
        }
      } else {
        setError(
          vi
            ? "Chưa thể xóa tài khoản. Không có thay đổi cục bộ nào được thực hiện."
            : "Could not delete the account. No local changes were made.",
        );
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.flex}
    >
      <Screen>
        <Title>{vi ? "Tài khoản & dữ liệu" : "Account & data"}</Title>
        {error ? <ErrorBanner message={error} /> : null}
        <Card>
          <Text style={styles.title}>
            {vi ? "Xuất dữ liệu" : "Export data"}
          </Text>
          <Muted>
            {vi
              ? "Tạo tệp JSON gồm thông tin tài khoản, lịch sử học tập, tiến độ, từ vựng, thông báo và hồ sơ thanh toán của bạn. Tệp không chứa mật khẩu, token hay khóa nội bộ."
              : "Create a JSON file with your account, learning history, progress, vocabulary, notification and payment records. Passwords, tokens and internal keys are excluded."}
          </Muted>
          <PrimaryButton
            busy={exporting}
            disabled={deleting}
            label={
              exporting
                ? vi
                  ? "Đang tạo bản xuất…"
                  : "Preparing export…"
                : vi
                  ? "Xuất và lưu tệp"
                  : "Export and save file"
            }
            onPress={() => void exportData()}
          />
        </Card>
        <Card>
          <Text style={styles.danger}>
            {vi ? "Xóa tài khoản" : "Delete account"}
          </Text>
          <Muted>
            {vi
              ? "Xóa hồ sơ, dữ liệu học tập, thông báo và mọi phiên đăng nhập. Các hồ sơ giao dịch bắt buộc phải giữ sẽ chỉ còn gắn với mã tài khoản đã được ẩn danh hóa."
              : "Remove your profile, learning data, notifications and every signed-in session. Required transaction records remain only under a pseudonymous account reference."}
          </Muted>
          <Text style={styles.label}>
            {vi
              ? "Nhập email tài khoản để xác nhận"
              : "Enter your account email to confirm"}
          </Text>
          <TextInput
            accessibilityLabel={
              vi
                ? "Email xác nhận xóa tài khoản"
                : "Account deletion confirmation email"
            }
            autoCapitalize="none"
            autoComplete="email"
            editable={!deleting}
            inputMode="email"
            onChangeText={setConfirmationEmail}
            placeholder={auth.me?.email ?? "email@example.com"}
            style={styles.input}
            value={confirmationEmail}
          />
          <View style={styles.acknowledgement}>
            <Switch
              accessibilityLabel={
                vi
                  ? "Tôi hiểu việc xóa tài khoản không thể hoàn tác"
                  : "I understand account deletion cannot be undone"
              }
              disabled={deleting}
              onValueChange={setAcknowledge}
              trackColor={{ false: colors.rule, true: colors.forest }}
              value={acknowledge}
            />
            <Text style={styles.acknowledgementText}>
              {vi
                ? "Tôi hiểu thao tác này không thể hoàn tác."
                : "I understand that this action cannot be undone."}
            </Text>
          </View>
          <PrimaryButton
            busy={deleting}
            disabled={!emailMatches || !acknowledge || exporting}
            label={
              vi ? "Xóa vĩnh viễn tài khoản" : "Permanently delete account"
            }
            onPress={confirmDeletion}
            tone="danger"
          />
        </Card>
        <Card>
          <Text style={styles.title}>
            {vi ? "Thông tin pháp lý" : "Legal information"}
          </Text>
          <View style={styles.linkActions}>
            <PrimaryButton
              label={vi ? "Chính sách quyền riêng tư" : "Privacy policy"}
              onPress={() => void Linking.openURL(PRIVACY_URL)}
            />
            <PrimaryButton
              label={vi ? "Điều khoản sử dụng" : "Terms of use"}
              onPress={() => void Linking.openURL(TERMS_URL)}
            />
          </View>
        </Card>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.paper },
  title: { color: colors.ink, fontSize: 19, fontWeight: "800" },
  danger: { color: colors.danger, fontSize: 19, fontWeight: "800" },
  label: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.ink,
    fontSize: 16,
    paddingHorizontal: space.md,
  },
  acknowledgement: {
    alignItems: "center",
    flexDirection: "row",
    gap: space.sm,
    minHeight: 48,
  },
  acknowledgementText: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    lineHeight: 23,
  },
  linkActions: { gap: space.sm },
});
