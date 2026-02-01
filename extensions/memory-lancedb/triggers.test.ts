/**
 * Trigger pattern tests
 *
 * Tests multilingual trigger matching for auto-capture.
 */

import { describe, test, expect } from "vitest";
import { matchTrigger, getAllMatches, SUPPORTED_LANGUAGES } from "./triggers.js";

describe("triggers", () => {
  describe("matchTrigger", () => {
    describe("Russian (ru)", () => {
      const lang = "ru";

      test("matches 'запомни' with weight 2", () => {
        const result = matchTrigger("запомни: мой любимый цвет синий", lang);
        expect(result).not.toBeNull();
        expect(result?.category).toBe("remember");
        expect(result?.weight).toBe(2);
        expect(result?.lang).toBe("ru");
      });

      test("matches 'учти'", () => {
        const result = matchTrigger("учти, что я не люблю рано вставать", lang);
        expect(result).not.toBeNull();
        expect(result?.category).toBe("remember");
      });

      test("matches 'заруби на носу'", () => {
        const result = matchTrigger("заруби на носу: никогда не опаздывай", lang);
        expect(result).not.toBeNull();
        expect(result?.category).toBe("remember");
        expect(result?.weight).toBe(2);
      });

      test("matches 'я хочу'", () => {
        const result = matchTrigger("я хочу научиться программировать", lang);
        expect(result).not.toBeNull();
        expect(result?.category).toBe("preference");
      });

      test("matches 'мне нравится'", () => {
        const result = matchTrigger("мне нравится TypeScript", lang);
        expect(result).not.toBeNull();
        expect(result?.category).toBe("preference");
      });

      test("matches 'моё любимое'", () => {
        const result = matchTrigger("моё любимое блюдо - борщ", lang);
        expect(result).not.toBeNull();
        expect(result?.category).toBe("preference");
      });

      test("matches 'я родился в'", () => {
        const result = matchTrigger("я родился в Алматы", lang);
        expect(result).not.toBeNull();
        expect(result?.category).toBe("fact");
      });

      test("matches 'я родилась в' (feminine)", () => {
        const result = matchTrigger("я родилась в Москве", lang);
        expect(result).not.toBeNull();
        expect(result?.category).toBe("fact");
      });

      test("matches 'я посещал' (without preposition)", () => {
        const result = matchTrigger("я посещал курсы английского", lang);
        expect(result).not.toBeNull();
        expect(result?.category).toBe("fact");
      });

      test("matches 'мне ... лет'", () => {
        const result = matchTrigger("мне 30 лет", lang);
        expect(result).not.toBeNull();
        expect(result?.category).toBe("identity");
      });

      test("matches 'меня зовут'", () => {
        const result = matchTrigger("меня зовут Максим", lang);
        expect(result).not.toBeNull();
        expect(result?.category).toBe("identity");
        expect(result?.weight).toBe(2);
      });

      test("matches 'важно'", () => {
        const result = matchTrigger("важно: всегда делать бэкапы", lang);
        expect(result).not.toBeNull();
        expect(result?.category).toBe("importance");
      });

      test("does NOT match English when filter is ru", () => {
        const result = matchTrigger("remember: my favorite color is blue", lang);
        // Should only match 'common' patterns (phone/email) or null
        expect(result?.lang === "ru" || result === null || result?.lang === "common").toBe(true);
      });
    });

    describe("Common patterns", () => {
      test("matches phone number +7 format", () => {
        const result = matchTrigger("мой телефон +79139154040", "ru");
        expect(result).not.toBeNull();
        // Either phone pattern (common) or 'мой телефон' (ru)
        expect(["common", "ru"]).toContain(result?.lang);
      });

      test("matches phone number 8 format", () => {
        const result = matchTrigger("позвони мне 89139154040", "ru");
        expect(result).not.toBeNull();
        expect(result?.lang).toBe("common");
      });

      test("matches phone with spaces", () => {
        const result = matchTrigger("номер: +7 913 915 4040", "ru");
        expect(result).not.toBeNull();
        expect(result?.lang).toBe("common");
      });

      test("matches phone with dashes", () => {
        const result = matchTrigger("телефон: 8-913-915-40-40", "ru");
        expect(result).not.toBeNull();
        expect(result?.lang).toBe("common");
      });

      test("matches email", () => {
        const result = matchTrigger("мой email: test@example.com", "ru");
        expect(result).not.toBeNull();
        expect(result?.lang).toBe("common");
      });

      test("common patterns work with any language filter", () => {
        const text = "contact: test@example.com";
        expect(matchTrigger(text, "ru")?.lang).toBe("common");
        expect(matchTrigger(text, "en")?.lang).toBe("common");
        expect(matchTrigger(text, "uk")?.lang).toBe("common");
      });
    });

    describe("Language filtering", () => {
      test("'auto' matches all languages", () => {
        expect(matchTrigger("remember this", "auto")?.lang).toBe("en");
        expect(matchTrigger("запомни это", "auto")?.lang).toBe("ru");
        expect(matchTrigger("запам'ятай це", "auto")?.lang).toBe("uk");
      });

      test("array filter matches multiple languages", () => {
        const filter = ["ru", "uk"] as const;
        expect(matchTrigger("запомни это", filter)?.lang).toBe("ru");
        expect(matchTrigger("запам'ятай це", filter)?.lang).toBe("uk");
        // English should not match (except common patterns)
        const enResult = matchTrigger("remember this", filter);
        expect(enResult === null || enResult.lang === "common").toBe(true);
      });

      test("single language filter", () => {
        expect(matchTrigger("запомни", "ru")).not.toBeNull();
        expect(matchTrigger("remember", "ru")).toBeNull();
      });
    });

    describe("Weight priority", () => {
      test("higher weight wins when multiple patterns match", () => {
        // "запомни" (weight 2) + "важно" (weight 1) - запомни should win
        const result = matchTrigger("важно запомни это навсегда", "ru");
        expect(result?.weight).toBe(2);
        expect(result?.category).toBe("remember");
      });
    });
  });

  describe("getAllMatches", () => {
    test("returns all matching patterns", () => {
      const matches = getAllMatches("запомни: мне 25 лет, я живу в Москве", "ru");
      expect(matches.length).toBeGreaterThan(1);

      const categories = matches.map(m => m.category);
      expect(categories).toContain("remember");
      expect(categories).toContain("identity");
    });
  });

  describe("SUPPORTED_LANGUAGES", () => {
    test("includes all expected languages", () => {
      expect(SUPPORTED_LANGUAGES).toContain("en");
      expect(SUPPORTED_LANGUAGES).toContain("uk");
      expect(SUPPORTED_LANGUAGES).toContain("ru");
      expect(SUPPORTED_LANGUAGES).toContain("by");
      expect(SUPPORTED_LANGUAGES).toContain("kk");
      expect(SUPPORTED_LANGUAGES).toContain("cz");
      expect(SUPPORTED_LANGUAGES).toContain("fr");
      expect(SUPPORTED_LANGUAGES).toContain("es");
      expect(SUPPORTED_LANGUAGES).toContain("it");
      expect(SUPPORTED_LANGUAGES).toContain("pt");
      expect(SUPPORTED_LANGUAGES).toContain("de");
    });

    test("Ukrainian comes before Russian", () => {
      const ukIndex = SUPPORTED_LANGUAGES.indexOf("uk");
      const ruIndex = SUPPORTED_LANGUAGES.indexOf("ru");
      expect(ukIndex).toBeLessThan(ruIndex);
    });
  });
});
