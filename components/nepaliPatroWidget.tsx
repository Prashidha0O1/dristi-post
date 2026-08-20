"use client";

import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const SCRIPT_SRC = "https://nepalipatro.com.np/np-widgets/nepalipatro.js";

export function NepaliPatroWidget() {
  // Bump this on mount so the injected <script> gets a unique URL each time
  // (cache-buster) — forces the widget to actually re-execute on client-side
  // navigation back to the homepage, instead of the browser serving a stale
  // already-initialized copy.
  const [nonce, setNonce] = useState<number | null>(null);

  useEffect(() => {
    setNonce(Date.now());
    return () => {
      // Clean up any script tag we added so the next mount starts fresh
      document.querySelectorAll('script[data-np-widget="wiz1"]').forEach((s) => s.remove());
    };
  }, []);

  return (
    <Box w="full">
      {/* The widget script scans the DOM for this exact id + widget attribute
          at execution time. Using dangerouslySetInnerHTML keeps the raw HTML
          attribute intact rather than a React prop. */}
      <div dangerouslySetInnerHTML={{ __html: '<div id="np_widget_wiz1" widget="month"></div>' }} />
      {nonce !== null && (
        // eslint-disable-next-line @next/next/no-sync-scripts
        <script
          key={nonce}
          data-np-widget="wiz1"
          src={`${SCRIPT_SRC}?t=${nonce}`}
        />
      )}
    </Box>
  );
}
