const MAP: Record<string, string> = {
  "ा": "f", "ि": "l", "ी": "L", "ु": "'", "ू": "\"", "े": "]",
  "ै": "}","ो": "f]", "ौ": "f}", "ं": "+", "ँ": "F", "ः": "M",
  "्": "\\", "अ": "c", "आ": "cf", "इ": "O", "ई": "O{", "उ": "p",
  "ऊ": "pm", "ऋ": "C", "ए": "P", "ऐ": "P}", "ओ": "cf]", "औ": "cf}",
  "क": "s", "ख": "v", "ग": "u", "घ": "3", "ङ": "ª",
  "च": "r", "छ": "5", "ज": "h", "झ": "´", "ञ": "~",
  "ट": "6", "ठ": "7", "ड": "8", "ढ": "9", "ण": "0",
  "त": "t", "थ": "y", "द": "b", "ध": "w", "न": "g",
  "प": "k", "फ": "km", "ब": "a", "भ": "e", "म": "d",
  "य": "o", "र": "/", "ल": "n", "व": "j", "श": "z",
  "ष": "if", "स": ";", "ह": "x", "क्ष": "If",
  "त्र": "q", "ज्ञ": "1", "श्र": ">",
  "०": ")", "१": "!", "२": "@", "३": "#", "४": "$",
  "५": "%", "६": "^", "७": "&", "८": "*", "९": "(",
  "।": ".", "॥": "..", " ": " ",
};

const SORTED_KEYS = Object.keys(MAP).sort((a, b) => b.length - a.length);

export function unicodeToPreeti(input: string): string {
  let result = "";
  let i = 0;
  while (i < input.length) {
    let matched = false;
    for (const key of SORTED_KEYS) {
      if (input.startsWith(key, i)) {
        result += MAP[key];
        i += key.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      result += input[i];
      i++;
    }
  }
  return result;
}
