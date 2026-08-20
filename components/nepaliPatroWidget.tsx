"use client";

import { Box } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://nepalipatro.com.np/np-widgets/nepalipatro.js";

export function NepaliPatroWidget() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // The widget script scans for this element (by id, reading the `widget`
    // attribute) when it executes, so it must exist first.
    host.innerHTML = '<div id="np_widget_wiz1" widget="month"></div>';

    // Drop any script tag from a previous mount.
    document
      .querySelectorAll('script[data-np-widget="wiz1"]')
      .forEach((s) => s.remove());

    // Must be a real DOM-created <script>: React does not execute <script>
    // tags rendered through JSX. The cache-busting query string forces the
    // browser to re-run it on client-side navigation instead of reusing an
    // already-initialized cached copy.
    const script = document.createElement("script");
    // The widget pairs itself to its target div by id: the script's own
    // id ("wiz1") maps to the div "np_widget_wiz1". Without this it has
    // nothing to render into.
    script.id = "wiz1";
    script.src = `${SCRIPT_SRC}?t=${Date.now()}`;
    script.async = true;
    script.setAttribute("data-np-widget", "wiz1");
    document.body.appendChild(script);

    return () => {
      script.remove();
      host.innerHTML = "";
    };
  }, []);

  return <Box w="full" minH="320px" ref={hostRef} />;
}
