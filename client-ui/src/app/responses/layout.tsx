"use client";
import { Theme } from "@twilio-paste/theme";
import { Box } from "@twilio-paste/core/box";
import React from "react";

export default function PresenterLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <Theme.Provider theme="twilio-dark">
      <Box overflowY={"hidden"} top={0} right={0} bottom={0} left={0}>
        <Box>{children}</Box>
      </Box>
    </Theme.Provider>
  );
}
