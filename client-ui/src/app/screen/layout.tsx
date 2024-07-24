"use client";
import { Box } from "@twilio-paste/core/box";
import { Theme } from "@twilio-paste/theme";
import React from "react";

export default function PresenterLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <Theme.Provider theme="dark">
      <Box
        overflowY={"hidden"}
        position="fixed" // Use "absolute" if "fixed" doesn't fit your use case
        top={0}
        right={0}
        bottom={0}
        left={0}
      >
        <Box padding={"space70"}>{children}</Box>
      </Box>
    </Theme.Provider>
  );
}
