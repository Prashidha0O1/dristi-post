"use client";

import { Box } from "@chakra-ui/react";

interface IframeEmbedProps {
  src: string;
  height: string;
  width?: string;
  borderRadius?: string;
  blockClicks?: boolean;
  iframeWidth?: string;
}

export function IframeEmbed({
  src,
  height,
  width = "100%",
  borderRadius = "4px",
  blockClicks = false,
  iframeWidth,
}: IframeEmbedProps) {
  return (
    <Box position="relative" w={width} h={height} overflow="hidden" borderRadius={borderRadius}>
      <iframe
        src={src}
        frameBorder="0"
        scrolling="no"
        style={{
          border: "none",
          overflow: "hidden",
          width: iframeWidth ?? "100%",
          height: "100%",
          borderRadius,
          padding: 0,
          margin: 0,
        }}
      />
      {blockClicks && (
        <Box
          position="absolute"
          inset="0"
          cursor="default"
          onClick={(e) => e.preventDefault()}
        />
      )}
    </Box>
  );
}
