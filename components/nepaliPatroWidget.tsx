"use client";

import { Box } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://nepalipatro.com.np/np-widgets/nepalipatro.js";

export function NepaliPatroWidget() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Clear any prior render so re-mounts start fresh
    mount.innerHTML = "";

    // Create the placeholder div the widget expects
    const target = document.createElement("div");
    target.id = "np_widget_wiz1";
    target.setAttribute("widget", "month");
    mount.appendChild(target);

    // Remove any previous injected script so the widget re-initializes
    const prev = document.getElementById("np_widget_script_wiz1");
    if (prev) prev.remove();

    const script = document.createElement("script");
    script.id = "np_widget_script_wiz1";
    script.src = SCRIPT_SRC;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      script.remove();
      mount.innerHTML = "";
    };
  }, []);

  return <Box w="full" ref={mountRef} />;
}
