"use client";

import React, { useMemo } from "react";
import { Box, Card, Text } from "@twilio-paste/core";
import { Slide } from "@/types/LiveSlides";
import DynamicCardWrapper from "@/components/DynamicCardWrapper";
import { AnalyticsBrowser } from "@segment/analytics-next";
import bgImage from "../../../public/2025_bg_3.svg";

interface RealSlidePreviewProps {
  slide: Slide;
}

/**
 * Real preview using the actual DynamicCardWrapper component
 */
export function RealSlidePreview({ slide }: RealSlidePreviewProps) {
  // Create a dummy analytics instance for preview
  const analytics = useMemo(
    () =>
      AnalyticsBrowser.load({
        writeKey: "preview-mode",
      }),
    []
  );

  // Dummy action handler for preview (doesn't actually do anything)
  const dummyPerformActions = () => {
    console.log("[Preview] Action triggered - this is just a preview");
  };

  if (!slide || !slide.kind) {
    return (
      <Box
        padding="space100"
        backgroundColor="colorBackgroundWeak"
        borderRadius="borderRadius30"
        textAlign="center"
        minHeight="400px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text as="p" color="colorTextWeak" fontSize="fontSize40">
          No slide selected
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Box marginBottom="space30">
        <Text as="p" fontSize="fontSize20" color="colorTextWeak" fontWeight="fontWeightSemibold">
          LIVE PREVIEW
        </Text>
      </Box>

      <Box marginBottom="space40">
        <Box marginBottom="space20">
          <Text as="p" fontSize="fontSize30" fontWeight="fontWeightSemibold">
            {slide.title || "Untitled Slide"}
          </Text>
        </Box>
        <Text as="p" fontSize="fontSize20" color="colorTextWeak">
          Slide ID: {slide.id || "Not set"} • Type: {slide.kind || "Not set"}
        </Text>
        <Box
          marginTop="space30"
          padding="space30"
          backgroundColor="colorBackgroundWarningWeakest"
          borderRadius="borderRadius20"
        >
          <Text as="p" fontSize="fontSize20" color="colorTextWeak">
            ⚠️ This is a preview - actions will not execute
          </Text>
        </Box>
      </Box>

      <Box
        position="relative"
        backgroundImage={`url(${bgImage.src})`}
        backgroundSize="cover"
        backgroundPosition="center"
        borderRadius="borderRadius30"
        overflow="hidden"
        style={{
          backgroundColor: "#000000",
          minHeight: "500px",
        }}
      >
        <Box
          padding="space80"
          display="flex"
          alignItems="center"
          justifyContent="center"
          minHeight="500px"
        >
          <Box maxWidth="size60">
            <DynamicCardWrapper
              slide={slide}
              performActions={dummyPerformActions}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
