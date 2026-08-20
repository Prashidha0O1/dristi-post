"use client";

import { Box } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const SCRIPT_SRC = "https://nepalipatro.com.np/np-widgets/nepalipatro.js";

export function NepaliPatroWidget() {
  const [nonce, setNonce] = useState<number | null>(null);

  useEffect(() => {
    setNonce(Date.now());
    return () => {
      document.querySelectorAll('script[data-np-widget="wiz1"]').forEach((s) => s.remove());
    };
  }, []);

  return (
    <Box w="full">
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
