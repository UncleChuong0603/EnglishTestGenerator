import { router } from "expo-router";
import { StyleSheet, Text } from "react-native";
import { Card, Muted, PrimaryButton, Screen, Title } from "@/components/ui";
import { colors } from "@/theme";

export default function AccountDeletedScreen() {
  return (
    <Screen contentContainerStyle={styles.screen}>
      <Title>Tài khoản đã được xóa</Title>
      <Card>
        <Text style={styles.title}>Account deleted</Text>
        <Muted>
          Dữ liệu học tập và các phiên đăng nhập đã được xóa. Các hồ sơ giao dịch
          bắt buộc phải giữ chỉ còn gắn với mã tài khoản đã được ẩn danh hóa.
        </Muted>
        <Muted>
          Your learning data and signed-in sessions were removed. Required
          transaction records remain only under a pseudonymous account reference.
        </Muted>
        <PrimaryButton
          label="Về màn hình đăng nhập / Go to sign in"
          onPress={() => router.replace("/sign-in")}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: "center" },
  title: { color: colors.ink, fontSize: 19, fontWeight: "800" },
});
