import { Linking, StyleSheet, Text } from "react-native";
import { useAuth } from "@/auth/auth-context";
import { Card, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { colors } from "@/theme";

const ACCOUNT_DATA_URL = "https://toeicgym.net/settings?section=data";

export default function AccountDataScreen() {
  const auth = useAuth();
  const vi = auth.me?.profile.interfaceLanguage !== "en";
  return <Screen>
    <Title>{vi ? "Tài khoản & dữ liệu" : "Account & data"}</Title>
    <Card><Text style={styles.title}>{vi ? "Xuất dữ liệu" : "Export data"}</Text><Muted>{vi ? "Tải bản sao dữ liệu tài khoản và lịch sử học tập từ trang bảo mật trên web." : "Download a copy of your account data and learning history from the secure web page."}</Muted><PrimaryButton label={vi ? "Mở trang xuất dữ liệu" : "Open data export"} onPress={() => void Linking.openURL(ACCOUNT_DATA_URL)} /></Card>
    <Card><Text style={styles.danger}>{vi ? "Xóa tài khoản" : "Delete account"}</Text><Muted>{vi ? "Trang web sẽ xác nhận rõ phạm vi trước khi xóa. Khi hoàn tất, phiên mobile này cũng bị vô hiệu hóa." : "The web page confirms the full impact before deletion. Completing it also invalidates this mobile session."}</Muted><PrimaryButton label={vi ? "Mở tùy chọn xóa" : "Open deletion options"} onPress={() => void Linking.openURL(ACCOUNT_DATA_URL)} /></Card>
  </Screen>;
}

const styles = StyleSheet.create({ title: { color: colors.ink, fontSize: 19, fontWeight: "800" }, danger: { color: colors.danger, fontSize: 19, fontWeight: "800" } });
