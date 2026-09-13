import type { en } from "./en";

type WidenTranslations<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? readonly WidenTranslations<Item>[]
    : T extends Record<string, unknown>
      ? { [Key in keyof T]: WidenTranslations<T[Key]> }
      : never;

export type TranslationShape = WidenTranslations<typeof en>;

export type Translations = TranslationShape;
