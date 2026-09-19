import { GoogleAuth } from 'google-auth-library';

// The URL of your site (make sure it's the live domain when you go live)
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://dristinews.com'; 

export async function pingGoogleIndexing(url: string) {
  // SAFETY SWITCH: Don't index anything if we aren't officially live.
  if (process.env.ENABLE_INDEXING !== "true") {
    console.log(`[Google Indexing API] Skipped for ${url} (ENABLE_INDEXING is not true)`);
    return false;
  }

  try {
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_INDEXING_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_INDEXING_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const client = await auth.getClient();
    const res = await client.request({
      url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
      method: 'POST',
      data: {
        url: url,
        type: 'URL_UPDATED',
      },
    });

    console.log(`[Google Indexing API] Successfully pinged ${url}`, res.data);
    return true;
  } catch (error) {
    console.error(`[Google Indexing API] Error pinging ${url}:`, error);
    return false;
  }
}

export async function pingBingIndexNow(url: string) {
  // SAFETY SWITCH: Don't index anything if we aren't officially live.
  if (process.env.ENABLE_INDEXING !== "true") {
    console.log(`[Bing IndexNow] Skipped for ${url} (ENABLE_INDEXING is not true)`);
    return false;
  }

  const indexNowKey = process.env.INDEXNOW_KEY;
  if (!indexNowKey) {
    console.error("[Bing IndexNow] Missing INDEXNOW_KEY");
    return false;
  }

  try {
    const res = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        host: new URL(SITE_URL).hostname,
        key: indexNowKey,
        keyLocation: `${SITE_URL}/${indexNowKey}.txt`,
        urlList: [url],
      }),
    });

    if (res.ok) {
      console.log(`[Bing IndexNow] Successfully pinged ${url}`);
      return true;
    } else {
      console.error(`[Bing IndexNow] Failed with status: ${res.status}`);
      return false;
    }
  } catch (error) {
    console.error(`[Bing IndexNow] Error pinging ${url}:`, error);
    return false;
  }
}

export async function pingAllSearchEngines(path: string) {
  // Example path: "/article/my-news-slug"
  // Needs to be an absolute URL for search engines
  const fullUrl = `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  
  // We don't await these because we don't want to block the user's "Publish" request!
  // They run in the background.
  pingGoogleIndexing(fullUrl);
  pingBingIndexNow(fullUrl);
}
