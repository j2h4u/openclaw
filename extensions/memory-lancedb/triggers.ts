/**
 * Memory capture triggers - multilingual patterns for auto-capture
 *
 * Categories:
 * - remember: explicit memory commands
 * - preference: likes, dislikes, preferences
 * - decision: decisions made
 * - identity: personal info (name, contacts)
 * - fact: general facts about user
 * - importance: markers of importance
 */

export type TriggerCategory = "remember" | "preference" | "decision" | "identity" | "fact" | "importance";

type TriggerPattern = {
  pattern: RegExp;
  category: TriggerCategory;
  weight?: number; // higher = more likely to capture (default: 1)
};

// ============================================================================
// Explicit memory commands
// ============================================================================
const REMEMBER_TRIGGERS: TriggerPattern[] = [
  // English
  { pattern: /\bremember\b/i, category: "remember", weight: 2 },
  { pattern: /\bdon'?t forget\b/i, category: "remember", weight: 2 },
  { pattern: /\bkeep in mind\b/i, category: "remember", weight: 2 },
  { pattern: /\bnote that\b/i, category: "remember" },
  { pattern: /\bfor (the )?future\b/i, category: "remember" },

  // Russian
  { pattern: /\bзапомни\b/i, category: "remember", weight: 2 },
  { pattern: /\bне забудь\b/i, category: "remember", weight: 2 },
  { pattern: /\bпомни\b/i, category: "remember", weight: 2 },
  { pattern: /\bзапиши\b/i, category: "remember" },
  { pattern: /\bна будущее\b/i, category: "remember" },
  { pattern: /\bимей в виду\b/i, category: "remember" },

  // Ukrainian
  { pattern: /\bзапам['']?ятай\b/i, category: "remember", weight: 2 },
  { pattern: /\bне забудь\b/i, category: "remember", weight: 2 },
  { pattern: /\bпам['']?ятай\b/i, category: "remember", weight: 2 },
  { pattern: /\bзапиши\b/i, category: "remember" },

  // Belarusian
  { pattern: /\bзапомні\b/i, category: "remember", weight: 2 },
  { pattern: /\bне забудзь\b/i, category: "remember", weight: 2 },
  { pattern: /\bпамятай\b/i, category: "remember", weight: 2 },

  // Czech
  { pattern: /\bzapamatuj si\b/i, category: "remember", weight: 2 },
  { pattern: /\bpamatuj\b/i, category: "remember", weight: 2 },
  { pattern: /\bnezapomeň\b/i, category: "remember", weight: 2 },
];

// ============================================================================
// Preferences (likes, dislikes)
// ============================================================================
const PREFERENCE_TRIGGERS: TriggerPattern[] = [
  // English
  { pattern: /\bi (like|love|prefer|enjoy|hate|dislike|can'?t stand)\b/i, category: "preference" },
  { pattern: /\bmy favou?rite\b/i, category: "preference" },
  { pattern: /\bi('?m| am) (a fan of|into|fond of)\b/i, category: "preference" },
  { pattern: /\bi don'?t (like|want|need)\b/i, category: "preference" },

  // Russian
  { pattern: /\b(мне )?(нравится|люблю|предпочитаю|обожаю)\b/i, category: "preference" },
  { pattern: /\b(мне )?не (нравится|люблю)\b/i, category: "preference" },
  { pattern: /\bненавижу\b/i, category: "preference" },
  { pattern: /\bмой любимый\b/i, category: "preference" },
  { pattern: /\bя фанат\b/i, category: "preference" },

  // Ukrainian
  { pattern: /\b(мені )?(подобається|люблю|віддаю перевагу)\b/i, category: "preference" },
  { pattern: /\bне (подобається|люблю)\b/i, category: "preference" },
  { pattern: /\bненавиджу\b/i, category: "preference" },

  // Belarusian
  { pattern: /\b(мне )?(падабаецца|люблю|аддаю перавагу)\b/i, category: "preference" },
  { pattern: /\bне (падабаецца|люблю)\b/i, category: "preference" },

  // Czech
  { pattern: /\b(mám )?rád\b/i, category: "preference" },
  { pattern: /\bpreferuji\b/i, category: "preference" },
  { pattern: /\bradši\b/i, category: "preference" },
  { pattern: /\bnechci\b/i, category: "preference" },
];

// ============================================================================
// Decisions
// ============================================================================
const DECISION_TRIGGERS: TriggerPattern[] = [
  // English
  { pattern: /\b(we |i )?decided\b/i, category: "decision" },
  { pattern: /\b(we'?ll|i'?ll) (use|go with|choose)\b/i, category: "decision" },
  { pattern: /\blet'?s (use|go with|stick with)\b/i, category: "decision" },
  { pattern: /\bfrom now on\b/i, category: "decision" },

  // Russian
  { pattern: /\b(мы )?решили\b/i, category: "decision" },
  { pattern: /\bбудем (использовать|применять)\b/i, category: "decision" },
  { pattern: /\bдавай (использовать|применять)\b/i, category: "decision" },
  { pattern: /\bотныне\b/i, category: "decision" },
  { pattern: /\bтеперь всегда\b/i, category: "decision" },

  // Ukrainian
  { pattern: /\b(ми )?вирішили\b/i, category: "decision" },
  { pattern: /\bбудемо (використовувати|застосовувати)\b/i, category: "decision" },

  // Belarusian
  { pattern: /\b(мы )?вырашылі\b/i, category: "decision" },
  { pattern: /\bбудзем (выкарыстоўваць|ужываць)\b/i, category: "decision" },

  // Czech
  { pattern: /\brozhodli jsme\b/i, category: "decision" },
  { pattern: /\bbudeme používat\b/i, category: "decision" },
];

// ============================================================================
// Identity / Personal info
// ============================================================================
const IDENTITY_TRIGGERS: TriggerPattern[] = [
  // Universal patterns
  { pattern: /\+\d{10,}/, category: "identity", weight: 2 },  // phone numbers
  { pattern: /[\w.-]+@[\w.-]+\.\w{2,}/, category: "identity", weight: 2 },  // emails

  // English
  { pattern: /\bmy name is\b/i, category: "identity", weight: 2 },
  { pattern: /\bi('?m| am) called\b/i, category: "identity" },
  { pattern: /\bcall me\b/i, category: "identity" },
  { pattern: /\bmy (phone|email|address|birthday)\b/i, category: "identity" },

  // Russian
  { pattern: /\bменя зовут\b/i, category: "identity", weight: 2 },
  { pattern: /\bмоё? имя\b/i, category: "identity", weight: 2 },
  { pattern: /\bзови меня\b/i, category: "identity" },
  { pattern: /\bмой (телефон|email|адрес|день рождения)\b/i, category: "identity" },

  // Ukrainian
  { pattern: /\bмене звати\b/i, category: "identity", weight: 2 },
  { pattern: /\bмоє ім['']?я\b/i, category: "identity", weight: 2 },

  // Belarusian
  { pattern: /\bмяне завуць\b/i, category: "identity", weight: 2 },
  { pattern: /\bмаё імя\b/i, category: "identity", weight: 2 },

  // Czech
  { pattern: /\bjmenuji se\b/i, category: "identity", weight: 2 },
  { pattern: /\bříkej mi\b/i, category: "identity" },
];

// ============================================================================
// Facts about user
// ============================================================================
const FACT_TRIGGERS: TriggerPattern[] = [
  // English
  { pattern: /\bi('?m| am) (a |an )?[\w]+\b/i, category: "fact" },  // "I'm a developer"
  { pattern: /\bi (work|live|study) (at|in|for)\b/i, category: "fact" },
  { pattern: /\bi have (a |an )?[\w]+\b/i, category: "fact" },

  // Russian
  { pattern: /\bя (работаю|живу|учусь)\b/i, category: "fact" },
  { pattern: /\bу меня (есть|имеется)\b/i, category: "fact" },
  { pattern: /\bя по профессии\b/i, category: "fact" },

  // Ukrainian
  { pattern: /\bя (працюю|живу|навчаюсь)\b/i, category: "fact" },
  { pattern: /\bу мене (є|маю)\b/i, category: "fact" },

  // Belarusian
  { pattern: /\bя (працую|жыву|вучуся)\b/i, category: "fact" },
  { pattern: /\bу мяне (ёсць|маю)\b/i, category: "fact" },

  // Czech
  { pattern: /\bpracuji (v|u|pro)\b/i, category: "fact" },
  { pattern: /\bbydlím v\b/i, category: "fact" },
];

// ============================================================================
// Importance markers
// ============================================================================
const IMPORTANCE_TRIGGERS: TriggerPattern[] = [
  // English
  { pattern: /\b(very )?important\b/i, category: "importance" },
  { pattern: /\balways\b/i, category: "importance" },
  { pattern: /\bnever\b/i, category: "importance" },
  { pattern: /\bmust (remember|know)\b/i, category: "importance" },

  // Russian
  { pattern: /\bважно\b/i, category: "importance" },
  { pattern: /\bвсегда\b/i, category: "importance" },
  { pattern: /\bникогда\b/i, category: "importance" },
  { pattern: /\bобязательно\b/i, category: "importance" },
  { pattern: /\bкритично\b/i, category: "importance" },

  // Ukrainian
  { pattern: /\bважливо\b/i, category: "importance" },
  { pattern: /\bзавжди\b/i, category: "importance" },
  { pattern: /\bніколи\b/i, category: "importance" },
  { pattern: /\bобов['']?язково\b/i, category: "importance" },

  // Belarusian
  { pattern: /\bважна\b/i, category: "importance" },
  { pattern: /\bзаўсёды\b/i, category: "importance" },
  { pattern: /\bніколі\b/i, category: "importance" },

  // Czech
  { pattern: /\bdůležité\b/i, category: "importance" },
  { pattern: /\bvždy\b/i, category: "importance" },
  { pattern: /\bnikdy\b/i, category: "importance" },
];

// ============================================================================
// Combined exports
// ============================================================================
export const ALL_TRIGGERS: TriggerPattern[] = [
  ...REMEMBER_TRIGGERS,
  ...PREFERENCE_TRIGGERS,
  ...DECISION_TRIGGERS,
  ...IDENTITY_TRIGGERS,
  ...FACT_TRIGGERS,
  ...IMPORTANCE_TRIGGERS,
];

/**
 * Check if text matches any trigger pattern
 * Returns the highest weight match or null if no match
 */
export function matchTrigger(text: string): { category: TriggerCategory; weight: number } | null {
  let bestMatch: { category: TriggerCategory; weight: number } | null = null;

  for (const trigger of ALL_TRIGGERS) {
    if (trigger.pattern.test(text)) {
      const weight = trigger.weight ?? 1;
      if (!bestMatch || weight > bestMatch.weight) {
        bestMatch = { category: trigger.category, weight };
      }
    }
  }

  return bestMatch;
}

/**
 * Get all matching triggers for text (for debugging)
 */
export function getAllMatches(text: string): TriggerPattern[] {
  return ALL_TRIGGERS.filter((t) => t.pattern.test(text));
}
