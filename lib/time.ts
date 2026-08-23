import type { Locale } from "./types";
import { toNepaliDigits } from "./nepaliDate";

const AD_MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const AD_MONTHS_NE = ["जनवरी", "फेब्रुअरी", "मार्च", "अप्रिल", "मे", "जुन", "जुलाई", "अगस्ट", "सेप्टेम्बर", "अक्टोबर", "नोभेम्बर", "डिसेम्बर"];

export function timeAgo(dateStr: string, locale: Locale): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) {
    return locale === "ne" ? "भर्खरै" : "Just now";
  }

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) {
    return locale === "ne"
      ? `${minutes} मिनेट अगाडि`
      : `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return locale === "ne"
      ? `${hours} घण्टा अगाडि`
      : `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return locale === "ne"
      ? `${days} दिन अगाडि`
      : `${days}d ago`;
  }

  // Built from explicit tables instead of toLocaleDateString("ne-NP"): Node's
  // full ICU renders "अगस्ट १६" while the browser lacks ne-NP data and falls
  // back to "Aug 16". Since this runs during both SSR and hydration, the two
  // must agree or React discards the tree.
  const date = new Date(dateStr);
  return locale === "ne"
    ? `${AD_MONTHS_NE[date.getMonth()]} ${toNepaliDigits(date.getDate())}`
    : `${AD_MONTHS_EN[date.getMonth()]} ${date.getDate()}`;
}
