"use server";
import { signOutAction } from "@/app/auth/actions";
export async function signOut() { return signOutAction(); }
