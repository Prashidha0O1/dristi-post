const BS_MONTHS_NE = [
  "बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
  "कार्तिक", "मंसिर", "पुष", "माघ", "फागुन", "चैत",
];

const BS_MONTHS_EN = [
  "Baisakh", "Jestha", "Asar", "Shrawan", "Bhadra", "Ashoj",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra",
];

const BS_DAYS_NE = [
  "आइतबार", "सोमबार", "मंगलबार", "बुधबार",
  "बिहिबार", "शुक्रबार", "शनिबार",
];

const BS_DAYS_SHORT_NE = ["आ", "सो", "मं", "बु", "बि", "शु", "श"];

const NEPALI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

const BS_YEAR_DAYS = [
  [30,32,31,32,31,30,30,30,29,30,29,31], // 2070
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2071
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2072
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2073
  [30,32,31,32,31,30,30,30,29,30,29,31], // 2074
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2075
  [31,31,32,32,31,30,30,29,30,29,30,30], // 2076
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2077
  [31,31,31,32,31,31,29,30,30,29,29,31], // 2078
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2079
  [31,32,31,32,31,30,30,29,30,29,30,30], // 2080
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2081
  [31,31,31,32,31,31,30,29,30,29,30,30], // 2082
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2083
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2084
  [31,31,31,32,31,31,29,30,30,29,30,30], // 2085
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2086
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2087
  [31,31,31,32,31,31,30,29,30,29,30,30], // 2088
  [31,31,32,31,31,31,30,29,30,29,30,30], // 2089
  [31,32,31,32,31,30,30,30,29,29,30,31], // 2090
];

const BS_START_YEAR = 2070;
const AD_REF = new Date(2013, 3, 14); // April 14, 2013 = 1 Baisakh 2070

export function toNepaliDigits(n: number): string {
  return String(n).replace(/\d/g, (d) => NEPALI_DIGITS[parseInt(d)]);
}

export function toNepaliDate(date: Date): { year: number; month: number; day: number; dayOfWeek: number } {
  const diffDays = Math.floor((date.getTime() - AD_REF.getTime()) / 86400000);

  let bsYear = BS_START_YEAR;
  let bsMonth = 0;
  let remaining = diffDays;

  while (remaining >= 0) {
    const yearIndex = bsYear - BS_START_YEAR;
    if (yearIndex >= BS_YEAR_DAYS.length) break;

    const monthDays = BS_YEAR_DAYS[yearIndex];
    let yearTotal = 0;
    for (let m = 0; m < 12; m++) yearTotal += monthDays[m];

    if (remaining < yearTotal) {
      for (let m = 0; m < 12; m++) {
        if (remaining < monthDays[m]) {
          bsMonth = m;
          break;
        }
        remaining -= monthDays[m];
      }
      break;
    }
    remaining -= yearTotal;
    bsYear++;
  }

  return { year: bsYear, month: bsMonth, day: remaining + 1, dayOfWeek: date.getDay() };
}

export function formatNepaliDate(date: Date, locale: "ne" | "en"): string {
  const bs = toNepaliDate(date);
  if (locale === "ne") {
    return `${BS_DAYS_NE[bs.dayOfWeek]}, ${toNepaliDigits(bs.day)} ${BS_MONTHS_NE[bs.month]} ${toNepaliDigits(bs.year)}`;
  }
  return `${BS_MONTHS_EN[bs.month]} ${bs.day}, ${bs.year} BS`;
}

export function getBSMonthDays(bsYear: number, bsMonth: number): number {
  const yearIndex = bsYear - BS_START_YEAR;
  if (yearIndex < 0 || yearIndex >= BS_YEAR_DAYS.length) return 30;
  return BS_YEAR_DAYS[yearIndex][bsMonth];
}

export function getFirstDayOfBSMonth(bsYear: number, bsMonth: number): number {
  let totalDays = 0;
  for (let y = BS_START_YEAR; y < bsYear; y++) {
    const yi = y - BS_START_YEAR;
    if (yi >= BS_YEAR_DAYS.length) break;
    for (let m = 0; m < 12; m++) totalDays += BS_YEAR_DAYS[yi][m];
  }
  const yi = bsYear - BS_START_YEAR;
  if (yi >= 0 && yi < BS_YEAR_DAYS.length) {
    for (let m = 0; m < bsMonth; m++) totalDays += BS_YEAR_DAYS[yi][m];
  }
  const adDate = new Date(AD_REF.getTime() + totalDays * 86400000);
  return adDate.getDay();
}

export function getBSMonthName(month: number, locale: "ne" | "en"): string {
  return locale === "ne" ? BS_MONTHS_NE[month] : BS_MONTHS_EN[month];
}

export function getBSDayHeaders(locale: "ne" | "en"): string[] {
  if (locale === "ne") return BS_DAYS_SHORT_NE;
  return ["S", "M", "T", "W", "T", "F", "S"];
}
