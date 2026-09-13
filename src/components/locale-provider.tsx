"use client";
import { createContext, useContext } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";
const LocaleContext = createContext<InterfaceLanguage>("vi");
export function LocaleProvider({ children, locale }: { children: React.ReactNode; locale: InterfaceLanguage }) { return <LocaleContext value={locale}>{children}</LocaleContext>; }
export function useLocale() { return useContext(LocaleContext); }
