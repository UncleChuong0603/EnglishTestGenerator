import { Redirect } from "expo-router";
import { Loading, Screen } from "@/components/ui";
import { useAuth } from "@/auth/auth-context";
export default function Index() { const auth = useAuth(); if (auth.loading) return <Screen><Loading /></Screen>; return <Redirect href={auth.token ? "/(tabs)" : "/sign-in"} />; }
