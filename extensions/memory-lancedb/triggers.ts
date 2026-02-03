/**
 * Memory capture triggers - commonlingual patterns for auto-capture
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
 * - Multi-language patterns (phone numbers, emails)
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

export type LanguageCode = "en" | "uk" | "ru" | "by" | "kk" | "cz" | "fr" | "es" | "it" | "pt" | "de" | "common";

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
  { pattern: /запомни/i, category: "remember", lang: "ru", weight: 2 },
  { pattern: /не забудь/i, category: "remember", lang: "ru", weight: 2 },
  { pattern: /помни/i, category: "remember", lang: "ru", weight: 2 },
  { pattern: /учти/i, category: "remember", lang: "ru", weight: 2 },
  { pattern: /заруби на носу/i, category: "remember", lang: "ru", weight: 2 },
  { pattern: /выучи/i, category: "remember", lang: "ru" },
  { pattern: /запиши/i, category: "remember", lang: "ru" },
  { pattern: /на будущее/i, category: "remember", lang: "ru" },
  { pattern: /имей в виду/i, category: "remember", lang: "ru" },

  // Ukrainian
  { pattern: /запам['']?ятай/i, category: "remember", lang: "uk", weight: 2 },
  { pattern: /пам['']?ятай/i, category: "remember", lang: "uk", weight: 2 },

  // Belarusian
  { pattern: /запомні/i, category: "remember", lang: "by", weight: 2 },
  { pattern: /не забудзь/i, category: "remember", lang: "by", weight: 2 },
  { pattern: /памятай/i, category: "remember", lang: "by", weight: 2 },

  // Kazakh
  { pattern: /есте сақта/i, category: "remember", lang: "kk", weight: 2 },
  { pattern: /ұмытпа/i, category: "remember", lang: "kk", weight: 2 },
  { pattern: /жаз(ып қой)?/i, category: "remember", lang: "kk" },
  { pattern: /ескер/i, category: "remember", lang: "kk" },

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
  { pattern: /(мне )?(нравится|люблю|предпочитаю|обожаю)/i, category: "preference", lang: "ru" },
  { pattern: /(мне )?не (нравится|люблю)/i, category: "preference", lang: "ru" },
  { pattern: /ненавижу/i, category: "preference", lang: "ru" },
  { pattern: /я хочу/i, category: "preference", lang: "ru" },
  { pattern: /я не хочу/i, category: "preference", lang: "ru" },
  { pattern: /мо[йяеё] любим[ыйаяое]+/i, category: "preference", lang: "ru" },
  { pattern: /я фанат/i, category: "preference", lang: "ru" },

  // Ukrainian
  { pattern: /(мені )?(подобається|люблю|віддаю перевагу)/i, category: "preference", lang: "uk" },
  { pattern: /не (подобається|люблю)/i, category: "preference", lang: "uk" },
  { pattern: /ненавиджу/i, category: "preference", lang: "uk" },

  // Belarusian
  { pattern: /(мне )?(падабаецца|люблю|аддаю перавагу)/i, category: "preference", lang: "by" },
  { pattern: /не (падабаецца|люблю)/i, category: "preference", lang: "by" },

  // Kazakh
  { pattern: /(маған )?(ұнайды|жақсы көремін)/i, category: "preference", lang: "kk" },
  { pattern: /ұнамайды/i, category: "preference", lang: "kk" },
  { pattern: /жек көремін/i, category: "preference", lang: "kk" },
  { pattern: /сүйікті/i, category: "preference", lang: "kk" },

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
  { pattern: /(мы )?решили/i, category: "decision", lang: "ru" },
  { pattern: /будем (использовать|применять)/i, category: "decision", lang: "ru" },
  { pattern: /давай (использовать|применять)/i, category: "decision", lang: "ru" },
  { pattern: /отныне/i, category: "decision", lang: "ru" },
  { pattern: /теперь всегда/i, category: "decision", lang: "ru" },

  // Ukrainian
  { pattern: /(ми )?вирішили/i, category: "decision", lang: "uk" },
  { pattern: /будемо (використовувати|застосовувати)/i, category: "decision", lang: "uk" },

  // Belarusian
  { pattern: /(мы )?вырашылі/i, category: "decision", lang: "by" },
  { pattern: /будзем (выкарыстоўваць|ужываць)/i, category: "decision", lang: "by" },

  // Kazakh
  { pattern: /(біз )?шештік/i, category: "decision", lang: "kk" },
  { pattern: /қолданамыз/i, category: "decision", lang: "kk" },
  { pattern: /бастап/i, category: "decision", lang: "kk" },

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
  // Common patterns (phone, email) - language-agnostic
  // Phone detection: just need to recognize "looks like a phone", not validate the whole number
  // Key: require + prefix OR separators to avoid matching plain numeric IDs
  // International: + followed by digits with at least one separator (space, dash, parenthesis)
  { pattern: /\+\d{1,4}[\s\-\(]\d/, category: "identity", lang: "common", weight: 2 },
  // CIS 8-format: 8 followed by separator and digits
  { pattern: /\b8[\s\-\(]\d{3}/, category: "identity", lang: "common", weight: 2 },
  // Digits with separators in phone-like pattern (XXX-XXX or XXX XXX)
  { pattern: /\b\d{3}[\s\-]\d{3}[\s\-]\d/, category: "identity", lang: "common", weight: 2 },
  // Email
  { pattern: /[\w.-]+@[\w.-]+\.\w{2,}/, category: "identity", lang: "common", weight: 2 },

  // English
  { pattern: /\bmy name is\b/i, category: "identity", lang: "en", weight: 2 },
  { pattern: /\bi('?m| am) called\b/i, category: "identity", lang: "en" },
  { pattern: /\bcall me\b/i, category: "identity", lang: "en" },
  { pattern: /\bmy (phone|email|address|birthday)\b/i, category: "identity", lang: "en" },

  // Russian
  { pattern: /меня зовут/i, category: "identity", lang: "ru", weight: 2 },
  { pattern: /моё? имя/i, category: "identity", lang: "ru", weight: 2 },
  { pattern: /мне .* (год|года|лет)/i, category: "identity", lang: "ru", weight: 2 },
  { pattern: /зови меня/i, category: "identity", lang: "ru" },
  { pattern: /мой (телефон|email|адрес|день рождения)/i, category: "identity", lang: "ru" },

  // Ukrainian
  { pattern: /мене звати/i, category: "identity", lang: "uk", weight: 2 },
  { pattern: /моє ім['']?я/i, category: "identity", lang: "uk", weight: 2 },

  // Belarusian
  { pattern: /мяне завуць/i, category: "identity", lang: "by", weight: 2 },
  { pattern: /маё імя/i, category: "identity", lang: "by", weight: 2 },

  // Kazakh
  { pattern: /менің атым/i, category: "identity", lang: "kk", weight: 2 },
  { pattern: /мені .+ деп атаңыз/i, category: "identity", lang: "kk" },
  { pattern: /менің (телефон|email|мекенжай)/i, category: "identity", lang: "kk" },

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
  { pattern: /я (работаю|живу|учусь)/i, category: "fact", lang: "ru" },
  { pattern: /у меня (есть|имеется)/i, category: "fact", lang: "ru" },
  { pattern: /я по профессии/i, category: "fact", lang: "ru" },
  { pattern: /я из/i, category: "fact", lang: "ru" },
  { pattern: /я (была?|жила?|бывала?|ездила?|учил(?:ся|ась)|родил(?:ся|ась))/i, category: "fact", lang: "ru" },
  { pattern: /я посещала?/i, category: "fact", lang: "ru" },
  { pattern: /я закончила?/i, category: "fact", lang: "ru" },

  // Ukrainian
  { pattern: /я (працюю|живу|навчаюсь)/i, category: "fact", lang: "uk" },
  { pattern: /у мене (є|маю)/i, category: "fact", lang: "uk" },

  // Belarusian
  { pattern: /я (працую|жыву|вучуся)/i, category: "fact", lang: "by" },
  { pattern: /у мяне (ёсць|маю)/i, category: "fact", lang: "by" },

  // Kazakh
  { pattern: /мен (жұмыс істеймін|тұрамын|оқимын)/i, category: "fact", lang: "kk" },
  { pattern: /менде (бар|жоқ)/i, category: "fact", lang: "kk" },
  { pattern: /мен .+ болып жұмыс істеймін/i, category: "fact", lang: "kk" },

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
  { pattern: /важно/i, category: "importance", lang: "ru" },
  { pattern: /всегда/i, category: "importance", lang: "ru" },
  { pattern: /никогда/i, category: "importance", lang: "ru" },
  { pattern: /обязательно/i, category: "importance", lang: "ru" },
  { pattern: /критично/i, category: "importance", lang: "ru" },

  // Ukrainian
  { pattern: /важливо/i, category: "importance", lang: "uk" },
  { pattern: /завжди/i, category: "importance", lang: "uk" },
  { pattern: /ніколи/i, category: "importance", lang: "uk" },
  { pattern: /обов['']?язково/i, category: "importance", lang: "uk" },

  // Belarusian
  { pattern: /важна/i, category: "importance", lang: "by" },
  { pattern: /заўсёды/i, category: "importance", lang: "by" },
  { pattern: /ніколі/i, category: "importance", lang: "by" },

  // Kazakh
  { pattern: /маңызды/i, category: "importance", lang: "kk" },
  { pattern: /әрқашан/i, category: "importance", lang: "kk" },
  { pattern: /ешқашан/i, category: "importance", lang: "kk" },
  { pattern: /міндетті түрде/i, category: "importance", lang: "kk" },

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
  // Always include common patterns
  langSet.add("common");

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
