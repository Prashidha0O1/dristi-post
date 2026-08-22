import type { Author } from "./types";

/**
 * Newsroom bylines. Extracted from `mockData` so that the presenter can resolve
 * an `authorId` back to a name without importing mock article data.
 */
export const authors: readonly Author[] = [
  { id: "a1", name: { ne: "राम प्रसाद शर्मा", en: "Ram Prasad Sharma" }, avatar: "" },
  { id: "a2", name: { ne: "सीता देवी पौडेल", en: "Sita Devi Poudel" }, avatar: "" },
  { id: "a3", name: { ne: "बिष्णु कुमार थापा", en: "Bishnu Kumar Thapa" }, avatar: "" },
  { id: "a4", name: { ne: "गीता राई", en: "Geeta Rai" }, avatar: "" },
];
