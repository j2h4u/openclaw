/**
 * Memory capture triggers - multilingual patterns for auto-capture
 *
 * Supported languages (12):
 * - English (en)
 * - Ukrainian (uk)
 * - Russian (ru)
 * - Belarusian (by)
 * - Kazakh (kk)
 * - Czech (cz)
 * - French (fr)
 * - Spanish (es)
 * - Italian (it)
 * - Portuguese (pt)
 * - German (de)
 * - Universal (phone numbers, emails)
 *
 * Categories:
 * - remember: explicit memory commands (weight: 2)
 * - preference: likes, dislikes, preferences
 * - decision: decisions made
 * - identity: personal info (name, contacts)
 * - fact: general facts about user
 * - importance: markers of importance
 */

export type TriggerCategory = "remember" | "preference" | "decision" | "identity" | "fact" | "importance";

export type LanguageCode = "en" | "uk" | "ru" | "by" | "kk" | "cz" | "fr" | "es" | "it" | "pt" | "de" | "universal";

export const SUPPORTED_LANGUAGES: LanguageCode[] = ["en", "uk", "ru", "by", "kk", "cz", "fr", "es", "it", "pt", "de"];

type TriggerPattern = {
  pattern: RegExp;
  category: TriggerCategory;
  lang: LanguageCode;
  weight?: number; // higher = more likely to capture (default: 1)
};

// ============================================================================
// Explicit memory commands
// ============================================================================
const REMEMBER_TRIGGERS: TriggerPattern[] = [
  // English
  { pattern: /\bremember\b/i, category: "remember", lang: "en", weight: 2 },
  { pattern: /\bdon'?t forget\b/i, category: "remember", lang: "en", weight: 2 },
  { pattern: /\bkeep in mind\b/i, category: "remember", lang: "en", weight: 2 },
  { pattern: /\bnote that\b/i, category: "remember", lang: "en" },
  { pattern: /\bfor (the )?future\b/i, category: "remember", lang: "en" },

  // Russian
  { pattern: /\bзапомни\b/i, category: "remember", lang: "ru", weight: 2 },
  { pattern: /\bне забудь\b/i, category: "remember", lang: "ru", weight: 2 },
  { pattern: /\bпомни\b/i, category: "remember", lang: "ru", weight: 2 },
  { pattern: /\bзапиши\b/i, category: "remember", lang: "ru" },
  { pattern: /\bна будущее\b/i, category: "remember", lang: "ru" },
  { pattern: /\bимей в виду\b/i, category: "remember", lang: "ru" },

  // Ukrainian
  { pattern: /\bзапам['']?ятай\b/i, category: "remember", lang: "uk", weight: 2 },
  { pattern: /\bпам['']?ятай\b/i, category: "remember", lang: "uk", weight: 2 },

  // Belarusian
  { pattern: /\bзапомні\b/i, category: "remember", lang: "by", weight: 2 },
  { pattern: /\bне забудзь\b/i, category: "remember", lang: "by", weight: 2 },
  { pattern: /\bпамятай\b/i, category: "remember", lang: "by", weight: 2 },

  // Kazakh
  { pattern: /\bесте сақта\b/i, category: "remember", lang: "kk", weight: 2 },
  { pattern: /\bұмытпа\b/i, category: "remember", lang: "kk", weight: 2 },
  { pattern: /\bжаз(ып қой)?\b/i, category: "remember", lang: "kk" },
  { pattern: /\bескер\b/i, category: "remember", lang: "kk" },

  // Czech
  { pattern: /\bzapamatuj si\b/i, category: "remember", lang: "cz", weight: 2 },
  { pattern: /\bpamatuj\b/i, category: "remember", lang: "cz", weight: 2 },
  { pattern: /\bnezapomeň\b/i, category: "remember", lang: "cz", weight: 2 },

  // French
  { pattern: /\bsouviens[- ]toi\b/i, category: "remember", lang: "fr", weight: 2 },
  { pattern: /\bn['']?oublie pas\b/i, category: "remember", lang: "fr", weight: 2 },
  { pattern: /\bretiens\b/i, category: "remember", lang: "fr", weight: 2 },
  { pattern: /\bnote que\b/i, category: "remember", lang: "fr" },

  // Spanish
  { pattern: /\brecuerda\b/i, category: "remember", lang: "es", weight: 2 },
  { pattern: /\bno olvides\b/i, category: "remember", lang: "es", weight: 2 },
  { pattern: /\bten en cuenta\b/i, category: "remember", lang: "es" },
  { pattern: /\bapunta\b/i, category: "remember", lang: "es" },

  // Italian
  { pattern: /\bricorda(ti)?\b/i, category: "remember", lang: "it", weight: 2 },
  { pattern: /\bnon dimenticare\b/i, category: "remember", lang: "it", weight: 2 },
  { pattern: /\btieni a mente\b/i, category: "remember", lang: "it" },

  // Portuguese
  { pattern: /\blembra[- ]te\b/i, category: "remember", lang: "pt", weight: 2 },
  { pattern: /\bnão esqueças?\b/i, category: "remember", lang: "pt", weight: 2 },
  { pattern: /\banota\b/i, category: "remember", lang: "pt" },

  // German
  { pattern: /\bmerk dir\b/i, category: "remember", lang: "de", weight: 2 },
  { pattern: /\bvergiss nicht\b/i, category: "remember", lang: "de", weight: 2 },
  { pattern: /\bdenk daran\b/i, category: "remember", lang: "de", weight: 2 },
  { pattern: /\bbeachte\b/i, category: "remember", lang: "de" },
];

// ============================================================================
// Preferences (likes, dislikes)
// ============================================================================
const PREFERENCE_TRIGGERS: TriggerPattern[] = [
  // English
  { pattern: /\bi (like|love|prefer|enjoy|hate|dislike|can'?t stand)\b/i, category: "preference", lang: "en" },
  { pattern: /\bmy favou?rite\b/i, category: "preference", lang: "en" },
  { pattern: /\bi('?m| am) (a fan of|into|fond of)\b/i, category: "preference", lang: "en" },
  { pattern: /\bi don'?t (like|want|need)\b/i, category: "preference", lang: "en" },

  // Russian
  { pattern: /\b(мне )?(нравится|люблю|предпочитаю|обожаю)\b/i, category: "preference", lang: "ru" },
  { pattern: /\b(мне )?не (нравится|люблю)\b/i, category: "preference", lang: "ru" },
  { pattern: /\bненавижу\b/i, category: "preference", lang: "ru" },
  { pattern: /\bмой любимый\b/i, category: "preference", lang: "ru" },
  { pattern: /\bя фанат\b/i, category: "preference", lang: "ru" },

  // Ukrainian
  { pattern: /\b(мені )?(подобається|люблю|віддаю перевагу)\b/i, category: "preference", lang: "uk" },
  { pattern: /\bне (подобається|люблю)\b/i, category: "preference", lang: "uk" },
  { pattern: /\bненавиджу\b/i, category: "preference", lang: "uk" },

  // Belarusian
  { pattern: /\b(мне )?(падабаецца|люблю|аддаю перавагу)\b/i, category: "preference", lang: "by" },
  { pattern: /\bне (падабаецца|люблю)\b/i, category: "preference", lang: "by" },

  // Kazakh
  { pattern: /\b(маған )?(ұнайды|жақсы көремін)\b/i, category: "preference", lang: "kk" },
  { pattern: /\bұнамайды\b/i, category: "preference", lang: "kk" },
  { pattern: /\bжек көремін\b/i, category: "preference", lang: "kk" },
  { pattern: /\bсүйікті\b/i, category: "preference", lang: "kk" },

  // Czech
  { pattern: /\b(mám )?rád\b/i, category: "preference", lang: "cz" },
  { pattern: /\bpreferuji\b/i, category: "preference", lang: "cz" },
  { pattern: /\bradši\b/i, category: "preference", lang: "cz" },
  { pattern: /\bnechci\b/i, category: "preference", lang: "cz" },

  // French
  { pattern: /\bj['']?(aime|adore|préfère|déteste)\b/i, category: "preference", lang: "fr" },
  { pattern: /\bje n['']?aime pas\b/i, category: "preference", lang: "fr" },
  { pattern: /\bmon (préféré|favori)\b/i, category: "preference", lang: "fr" },

  // Spanish
  { pattern: /\bme (gusta|encanta|prefiero)\b/i, category: "preference", lang: "es" },
  { pattern: /\bno me gusta\b/i, category: "preference", lang: "es" },
  { pattern: /\bodio\b/i, category: "preference", lang: "es" },
  { pattern: /\bmi favorito\b/i, category: "preference", lang: "es" },

  // Italian
  { pattern: /\bmi (piace|piacciono|preferisco)\b/i, category: "preference", lang: "it" },
  { pattern: /\bnon mi piace\b/i, category: "preference", lang: "it" },
  { pattern: /\bil mio preferito\b/i, category: "preference", lang: "it" },

  // Portuguese
  { pattern: /\b(eu )?(gosto|adoro|prefiro)\b/i, category: "preference", lang: "pt" },
  { pattern: /\bnão gosto\b/i, category: "preference", lang: "pt" },
  { pattern: /\bodeio\b/i, category: "preference", lang: "pt" },
  { pattern: /\bmeu favorito\b/i, category: "preference", lang: "pt" },

  // German
  { pattern: /\bich (mag|liebe|bevorzuge|hasse)\b/i, category: "preference", lang: "de" },
  { pattern: /\bich mag nicht\b/i, category: "preference", lang: "de" },
  { pattern: /\bmein (lieblings|favorit)\b/i, category: "preference", lang: "de" },
];

// ============================================================================
// Decisions
// ============================================================================
const DECISION_TRIGGERS: TriggerPattern[] = [
  // English
  { pattern: /\b(we |i )?decided\b/i, category: "decision", lang: "en" },
  { pattern: /\b(we'?ll|i'?ll) (use|go with|choose)\b/i, category: "decision", lang: "en" },
  { pattern: /\blet'?s (use|go with|stick with)\b/i, category: "decision", lang: "en" },
  { pattern: /\bfrom now on\b/i, category: "decision", lang: "en" },

  // Russian
  { pattern: /\b(мы )?решили\b/i, category: "decision", lang: "ru" },
  { pattern: /\bбудем (использовать|применять)\b/i, category: "decision", lang: "ru" },
  { pattern: /\bдавай (использовать|применять)\b/i, category: "decision", lang: "ru" },
  { pattern: /\bотныне\b/i, category: "decision", lang: "ru" },
  { pattern: /\bтеперь всегда\b/i, category: "decision", lang: "ru" },

  // Ukrainian
  { pattern: /\b(ми )?вирішили\b/i, category: "decision", lang: "uk" },
  { pattern: /\bбудемо (використовувати|застосовувати)\b/i, category: "decision", lang: "uk" },

  // Belarusian
  { pattern: /\b(мы )?вырашылі\b/i, category: "decision", lang: "by" },
  { pattern: /\bбудзем (выкарыстоўваць|ужываць)\b/i, category: "decision", lang: "by" },

  // Kazakh
  { pattern: /\b(біз )?шештік\b/i, category: "decision", lang: "kk" },
  { pattern: /\bқолданамыз\b/i, category: "decision", lang: "kk" },
  { pattern: /\bбастап\b/i, category: "decision", lang: "kk" },

  // Czech
  { pattern: /\brozhodli jsme\b/i, category: "decision", lang: "cz" },
  { pattern: /\bbudeme používat\b/i, category: "decision", lang: "cz" },

  // French
  { pattern: /\b(on |nous )?a décidé\b/i, category: "decision", lang: "fr" },
  { pattern: /\bon va utiliser\b/i, category: "decision", lang: "fr" },
  { pattern: /\bdésormais\b/i, category: "decision", lang: "fr" },

  // Spanish
  { pattern: /\b(hemos )?decidido\b/i, category: "decision", lang: "es" },
  { pattern: /\bvamos a usar\b/i, category: "decision", lang: "es" },
  { pattern: /\ba partir de ahora\b/i, category: "decision", lang: "es" },

  // Italian
  { pattern: /\b(abbiamo )?deciso\b/i, category: "decision", lang: "it" },
  { pattern: /\buseremo\b/i, category: "decision", lang: "it" },
  { pattern: /\bd['']?ora in poi\b/i, category: "decision", lang: "it" },

  // Portuguese
  { pattern: /\b(nós )?decidimos\b/i, category: "decision", lang: "pt" },
  { pattern: /\bvamos usar\b/i, category: "decision", lang: "pt" },
  { pattern: /\ba partir de agora\b/i, category: "decision", lang: "pt" },

  // German
  { pattern: /\bwir haben (uns )?(entschieden|beschlossen)\b/i, category: "decision", lang: "de" },
  { pattern: /\bwir werden (benutzen|verwenden)\b/i, category: "decision", lang: "de" },
  { pattern: /\bab jetzt\b/i, category: "decision", lang: "de" },
];

// ============================================================================
// Identity / Personal info
// ============================================================================
const IDENTITY_TRIGGERS: TriggerPattern[] = [
  // Universal patterns
  { pattern: /\+\d{10,}/, category: "identity", lang: "universal", weight: 2 },
  { pattern: /[\w.-]+@[\w.-]+\.\w{2,}/, category: "identity", lang: "universal", weight: 2 },

  // English
  { pattern: /\bmy name is\b/i, category: "identity", lang: "en", weight: 2 },
  { pattern: /\bi('?m| am) called\b/i, category: "identity", lang: "en" },
  { pattern: /\bcall me\b/i, category: "identity", lang: "en" },
  { pattern: /\bmy (phone|email|address|birthday)\b/i, category: "identity", lang: "en" },

  // Russian
  { pattern: /\bменя зовут\b/i, category: "identity", lang: "ru", weight: 2 },
  { pattern: /\bмоё? имя\b/i, category: "identity", lang: "ru", weight: 2 },
  { pattern: /\bзови меня\b/i, category: "identity", lang: "ru" },
  { pattern: /\bмой (телефон|email|адрес|день рождения)\b/i, category: "identity", lang: "ru" },

  // Ukrainian
  { pattern: /\bмене звати\b/i, category: "identity", lang: "uk", weight: 2 },
  { pattern: /\bмоє ім['']?я\b/i, category: "identity", lang: "uk", weight: 2 },

  // Belarusian
  { pattern: /\bмяне завуць\b/i, category: "identity", lang: "by", weight: 2 },
  { pattern: /\bмаё імя\b/i, category: "identity", lang: "by", weight: 2 },

  // Kazakh
  { pattern: /\bменің атым\b/i, category: "identity", lang: "kk", weight: 2 },
  { pattern: /\bмені .+ деп атаңыз\b/i, category: "identity", lang: "kk" },
  { pattern: /\bменің (телефон|email|мекенжай)\b/i, category: "identity", lang: "kk" },

  // Czech
  { pattern: /\bjmenuji se\b/i, category: "identity", lang: "cz", weight: 2 },
  { pattern: /\bříkej mi\b/i, category: "identity", lang: "cz" },

  // French
  { pattern: /\bje m['']?appelle\b/i, category: "identity", lang: "fr", weight: 2 },
  { pattern: /\bmon nom est\b/i, category: "identity", lang: "fr", weight: 2 },
  { pattern: /\bappelle[- ]moi\b/i, category: "identity", lang: "fr" },
  { pattern: /\bmon (téléphone|email|adresse)\b/i, category: "identity", lang: "fr" },

  // Spanish
  { pattern: /\bme llamo\b/i, category: "identity", lang: "es", weight: 2 },
  { pattern: /\bmi nombre es\b/i, category: "identity", lang: "es", weight: 2 },
  { pattern: /\bllámame\b/i, category: "identity", lang: "es" },
  { pattern: /\bmi (teléfono|email|dirección|cumpleaños)\b/i, category: "identity", lang: "es" },

  // Italian
  { pattern: /\bmi chiamo\b/i, category: "identity", lang: "it", weight: 2 },
  { pattern: /\bil mio nome è\b/i, category: "identity", lang: "it", weight: 2 },
  { pattern: /\bchiamami\b/i, category: "identity", lang: "it" },
  { pattern: /\bil mio (telefono|email|indirizzo)\b/i, category: "identity", lang: "it" },

  // Portuguese
  { pattern: /\b(eu )?me chamo\b/i, category: "identity", lang: "pt", weight: 2 },
  { pattern: /\bmeu nome é\b/i, category: "identity", lang: "pt", weight: 2 },
  { pattern: /\bchama[- ]me\b/i, category: "identity", lang: "pt" },
  { pattern: /\bmeu (telefone|email|endereço)\b/i, category: "identity", lang: "pt" },

  // German
  { pattern: /\bich heiße\b/i, category: "identity", lang: "de", weight: 2 },
  { pattern: /\bmein name ist\b/i, category: "identity", lang: "de", weight: 2 },
  { pattern: /\bnenn mich\b/i, category: "identity", lang: "de" },
  { pattern: /\bmeine? (telefon|email|adresse|geburtstag)\b/i, category: "identity", lang: "de" },
];

// ============================================================================
// Facts about user
// ============================================================================
const FACT_TRIGGERS: TriggerPattern[] = [
  // English
  { pattern: /\bi('?m| am) (a |an )?[\w]+\b/i, category: "fact", lang: "en" },
  { pattern: /\bi (work|live|study) (at|in|for)\b/i, category: "fact", lang: "en" },
  { pattern: /\bi have (a |an )?[\w]+\b/i, category: "fact", lang: "en" },

  // Russian
  { pattern: /\bя (работаю|живу|учусь)\b/i, category: "fact", lang: "ru" },
  { pattern: /\bу меня (есть|имеется)\b/i, category: "fact", lang: "ru" },
  { pattern: /\bя по профессии\b/i, category: "fact", lang: "ru" },

  // Ukrainian
  { pattern: /\bя (працюю|живу|навчаюсь)\b/i, category: "fact", lang: "uk" },
  { pattern: /\bу мене (є|маю)\b/i, category: "fact", lang: "uk" },

  // Belarusian
  { pattern: /\bя (працую|жыву|вучуся)\b/i, category: "fact", lang: "by" },
  { pattern: /\bу мяне (ёсць|маю)\b/i, category: "fact", lang: "by" },

  // Kazakh
  { pattern: /\bмен (жұмыс істеймін|тұрамын|оқимын)\b/i, category: "fact", lang: "kk" },
  { pattern: /\bменде (бар|жоқ)\b/i, category: "fact", lang: "kk" },
  { pattern: /\bмен .+ болып жұмыс істеймін\b/i, category: "fact", lang: "kk" },

  // Czech
  { pattern: /\bpracuji (v|u|pro)\b/i, category: "fact", lang: "cz" },
  { pattern: /\bbydlím v\b/i, category: "fact", lang: "cz" },

  // French
  { pattern: /\bje (travaille|habite|étudie)\b/i, category: "fact", lang: "fr" },
  { pattern: /\bj['']?ai (un|une)\b/i, category: "fact", lang: "fr" },
  { pattern: /\bje suis (un|une)?\b/i, category: "fact", lang: "fr" },

  // Spanish
  { pattern: /\b(yo )?(trabajo|vivo|estudio) (en|para)\b/i, category: "fact", lang: "es" },
  { pattern: /\btengo (un|una)\b/i, category: "fact", lang: "es" },
  { pattern: /\bsoy (un|una)?\b/i, category: "fact", lang: "es" },

  // Italian
  { pattern: /\b(io )?(lavoro|vivo|studio) (a|in|per)\b/i, category: "fact", lang: "it" },
  { pattern: /\bho (un|una)\b/i, category: "fact", lang: "it" },
  { pattern: /\bsono (un|una)?\b/i, category: "fact", lang: "it" },

  // Portuguese
  { pattern: /\b(eu )?(trabalho|moro|estudo) (em|para)\b/i, category: "fact", lang: "pt" },
  { pattern: /\btenho (um|uma)\b/i, category: "fact", lang: "pt" },
  { pattern: /\bsou (um|uma)?\b/i, category: "fact", lang: "pt" },

  // German
  { pattern: /\bich (arbeite|wohne|studiere) (bei|in|für)\b/i, category: "fact", lang: "de" },
  { pattern: /\bich habe (ein|eine)\b/i, category: "fact", lang: "de" },
  { pattern: /\bich bin (ein|eine)?\b/i, category: "fact", lang: "de" },
];

// ============================================================================
// Importance markers
// ============================================================================
const IMPORTANCE_TRIGGERS: TriggerPattern[] = [
  // English
  { pattern: /\b(very )?important\b/i, category: "importance", lang: "en" },
  { pattern: /\balways\b/i, category: "importance", lang: "en" },
  { pattern: /\bnever\b/i, category: "importance", lang: "en" },
  { pattern: /\bmust (remember|know)\b/i, category: "importance", lang: "en" },

  // Russian
  { pattern: /\bважно\b/i, category: "importance", lang: "ru" },
  { pattern: /\bвсегда\b/i, category: "importance", lang: "ru" },
  { pattern: /\bникогда\b/i, category: "importance", lang: "ru" },
  { pattern: /\bобязательно\b/i, category: "importance", lang: "ru" },
  { pattern: /\bкритично\b/i, category: "importance", lang: "ru" },

  // Ukrainian
  { pattern: /\bважливо\b/i, category: "importance", lang: "uk" },
  { pattern: /\bзавжди\b/i, category: "importance", lang: "uk" },
  { pattern: /\bніколи\b/i, category: "importance", lang: "uk" },
  { pattern: /\bобов['']?язково\b/i, category: "importance", lang: "uk" },

  // Belarusian
  { pattern: /\bважна\b/i, category: "importance", lang: "by" },
  { pattern: /\bзаўсёды\b/i, category: "importance", lang: "by" },
  { pattern: /\bніколі\b/i, category: "importance", lang: "by" },

  // Kazakh
  { pattern: /\bмаңызды\b/i, category: "importance", lang: "kk" },
  { pattern: /\bәрқашан\b/i, category: "importance", lang: "kk" },
  { pattern: /\bешқашан\b/i, category: "importance", lang: "kk" },
  { pattern: /\bміндетті түрде\b/i, category: "importance", lang: "kk" },

  // Czech
  { pattern: /\bdůležité\b/i, category: "importance", lang: "cz" },
  { pattern: /\bvždy\b/i, category: "importance", lang: "cz" },
  { pattern: /\bnikdy\b/i, category: "importance", lang: "cz" },

  // French
  { pattern: /\b(très )?important\b/i, category: "importance", lang: "fr" },
  { pattern: /\btoujours\b/i, category: "importance", lang: "fr" },
  { pattern: /\bjamais\b/i, category: "importance", lang: "fr" },
  { pattern: /\bcritique\b/i, category: "importance", lang: "fr" },

  // Spanish
  { pattern: /\b(muy )?importante\b/i, category: "importance", lang: "es" },
  { pattern: /\bsiempre\b/i, category: "importance", lang: "es" },
  { pattern: /\bnunca\b/i, category: "importance", lang: "es" },
  { pattern: /\bcrítico\b/i, category: "importance", lang: "es" },

  // Italian
  { pattern: /\b(molto )?importante\b/i, category: "importance", lang: "it" },
  { pattern: /\bsempre\b/i, category: "importance", lang: "it" },
  { pattern: /\bmai\b/i, category: "importance", lang: "it" },
  { pattern: /\bcritico\b/i, category: "importance", lang: "it" },

  // Portuguese
  { pattern: /\b(muito )?importante\b/i, category: "importance", lang: "pt" },
  { pattern: /\bsempre\b/i, category: "importance", lang: "pt" },
  { pattern: /\bnunca\b/i, category: "importance", lang: "pt" },
  { pattern: /\bcrítico\b/i, category: "importance", lang: "pt" },

  // German
  { pattern: /\b(sehr )?wichtig\b/i, category: "importance", lang: "de" },
  { pattern: /\bimmer\b/i, category: "importance", lang: "de" },
  { pattern: /\bnie(mals)?\b/i, category: "importance", lang: "de" },
  { pattern: /\bkritisch\b/i, category: "importance", lang: "de" },
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

export type LanguageFilter = "auto" | LanguageCode | LanguageCode[];

/**
 * Get triggers filtered by language
 */
function getFilteredTriggers(languages: LanguageFilter): TriggerPattern[] {
  if (languages === "auto") {
    return ALL_TRIGGERS;
  }

  const langSet = new Set<LanguageCode>(
    Array.isArray(languages) ? languages : [languages]
  );
  // Always include universal patterns
  langSet.add("universal");

  return ALL_TRIGGERS.filter((t) => langSet.has(t.lang));
}

/**
 * Check if text matches any trigger pattern
 * Returns the highest weight match or null if no match
 */
export function matchTrigger(
  text: string,
  languages: LanguageFilter = "auto"
): { category: TriggerCategory; weight: number; lang: LanguageCode } | null {
  const triggers = getFilteredTriggers(languages);
  let bestMatch: { category: TriggerCategory; weight: number; lang: LanguageCode } | null = null;

  for (const trigger of triggers) {
    if (trigger.pattern.test(text)) {
      const weight = trigger.weight ?? 1;
      if (!bestMatch || weight > bestMatch.weight) {
        bestMatch = { category: trigger.category, weight, lang: trigger.lang };
      }
    }
  }

  return bestMatch;
}

/**
 * Get all matching triggers for text (for debugging)
 */
export function getAllMatches(
  text: string,
  languages: LanguageFilter = "auto"
): TriggerPattern[] {
  const triggers = getFilteredTriggers(languages);
  return triggers.filter((t) => t.pattern.test(text));
}
