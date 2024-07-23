"use client";
import { Box } from "@twilio-paste/core/box";
import React from "react";

export default function PresenterLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      id="AAAA"
      overflowY={"hidden"}
      position="fixed" // Use "absolute" if "fixed" doesn't fit your use case
      top={0}
      right={0}
      bottom={0}
      left={0}
    >
      <Box
        id="BBBBBB"
        backgroundColor={"colorBackgroundBody"}
        padding={"space70"}
        borderRadius={"borderRadius30"}
      >
        {children}
      </Box>
    </Box>
  );
}
