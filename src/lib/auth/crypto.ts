import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import argon2 from "argon2";
import { getServerEnv } from "../env";

export const PASSWORD_MIN_LENGTH = 10;
export const ARGON2_OPTIONS = { type: argon2.argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1, hashLength: 32 } as const;
export const normalizeEmail = (email: string) => email.trim().normalize("NFKC").toLowerCase();
export const hashPassword = (password: string) => argon2.hash(password, ARGON2_OPTIONS);
export const verifyPassword = (hash: string, password: string) => argon2.verify(hash, password);
export const createToken = () => randomBytes(32).toString("base64url");
export function hashToken(token: string) { return createHmac("sha256", getServerEnv().SESSION_SECRET).update(token).digest("hex"); }
