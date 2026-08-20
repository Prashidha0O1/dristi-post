"use client";

import { Box } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://nepalipatro.com.np/np-widgets/nepalipatro.js";

export function NepaliPatroWidget() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Insert the placeholder markup exactly as documented — using innerHTML
    // so the `widget="month"` attribute is present when the widget script
    // scans the DOM (it reads attributes at init, not via live property).
    mount.innerHTML = '<div id="np_widget_wiz1" widget="month"></div>';

    // Remove any previous instance of the widget script.
    document.querySelectorAll('script[data-np-widget="wiz1"]').forEach((s) => s.remove());

    // Inject a fresh <script> tag; the cache-buster query forces the browser
    // to actually re-execute the script (and re-run the widget's init) on
    // client-side navigation, not serve a stale, already-initialized copy.
    const script = document.createElement("script");
    script.src = `${SCRIPT_SRC}?t=${Date.now()}`;
    script.async = true;
    script.setAttribute("data-np-widget", "wiz1");
    document.body.appendChild(script);

    return () => {
      script.remove();
      mount.innerHTML = "";
    };
  }, []);

  return <Box w="full" ref={mountRef} />;
}
