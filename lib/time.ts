import type { Locale } from "./types";

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

  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === "ne" ? "ne-NP" : "en-US", {
    month: "short",
    day: "numeric",
  });
}
