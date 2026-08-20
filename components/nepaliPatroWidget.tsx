"use client";

import { Box } from "@chakra-ui/react";
import Script from "next/script";

export function NepaliPatroWidget() {
  return (
    <Box w="full">
      <div id="np_widget_wiz1" {...{ widget: "month" }} />
      <Script
        src="https://nepalipatro.com.np/np-widgets/nepalipatro.js"
        id="wiz1"
        strategy="afterInteractive"
      />
    </Box>
  );
}
