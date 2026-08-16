"use client";

import { Box } from "@chakra-ui/react";

interface IframeEmbedProps {
  src: string;
  height: string;
  width?: string;
  borderRadius?: string;
}

export function IframeEmbed({ src, height, width = "100%", borderRadius = "4px" }: IframeEmbedProps) {
  return (
    <Box w={width} h={height} overflow="hidden" borderRadius={borderRadius}>
      <iframe
        src={src}
        frameBorder="0"
        scrolling="no"
        style={{
          border: "none",
          overflow: "hidden",
          width: "100%",
          height: "100%",
          borderRadius,
          padding: 0,
          margin: 0,
        }}
        allowTransparency
      />
    </Box>
  );
}
