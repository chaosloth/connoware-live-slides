"use client";

import React from "react";
import { Box, Card, Heading, Text, Button, Stack } from "@twilio-paste/core";
import { Slide, QuestionSlide, GateSlide, CtaSlide, EndedSlide } from "@/types/LiveSlides";
import { Phase } from "@/types/Phases";

interface SlidePreviewProps {
  slide: Slide;
}

/**
 * Real-time preview of how a slide will appear to users
 */
export function SlidePreview({ slide }: SlidePreviewProps) {
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

  const renderPreviewContent = () => {
    switch (slide.kind) {
      case Phase.Question:
        const questionSlide = slide as QuestionSlide;
        return (
          <Stack orientation="vertical" spacing="space60">
            <Box textAlign="center">
              <Box marginBottom="space30">
                <Heading as="h2" variant="heading20">
                  {questionSlide.title || "Untitled Question"}
                </Heading>
              </Box>
              {questionSlide.description && (
                <Text as="p" color="colorTextWeak">
                  {questionSlide.description}
                </Text>
              )}
            </Box>

            <Stack orientation="vertical" spacing="space40">
              {questionSlide.options && questionSlide.options.length > 0 ? (
                questionSlide.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={option.primary ? "primary" : "secondary"}
                    fullWidth
                    size="default"
                  >
                    {option.optionLabel || `Option ${index + 1}`}
                  </Button>
                ))
              ) : (
                <Box
                  padding="space60"
                  backgroundColor="colorBackgroundWeak"
                  borderRadius="borderRadius20"
                  textAlign="center"
                >
                  <Text as="p" color="colorTextWeak" fontSize="fontSize30">
                    No options configured
                  </Text>
                </Box>
              )}
            </Stack>
          </Stack>
        );

      case Phase.Identify:
        const gateSlide = slide as GateSlide;
        return (
          <Stack orientation="vertical" spacing="space60">
            <Box textAlign="center">
              <Box marginBottom="space30">
                <Heading as="h2" variant="heading20">
                  {gateSlide.title || "Untitled"}
                </Heading>
              </Box>
              {gateSlide.description && (
                <Text as="p" color="colorTextWeak">
                  {gateSlide.description}
                </Text>
              )}
            </Box>

            <Box
              padding="space60"
              backgroundColor="colorBackgroundBody"
              borderRadius="borderRadius20"
              borderStyle="solid"
              borderWidth="borderWidth10"
              borderColor="colorBorder"
            >
              <Stack orientation="vertical" spacing="space40">
                <Text as="p" fontSize="fontSize30" fontWeight="fontWeightSemibold">
                  Phone Number
                </Text>
                <Box
                  padding="space40"
                  backgroundColor="colorBackgroundWeak"
                  borderRadius="borderRadius20"
                >
                  <Text as="p" fontSize="fontSize30" color="colorTextWeak">
                    +1 (555) 123-4567
                  </Text>
                </Box>
                <Button variant="primary" fullWidth>
                  Submit
                </Button>
              </Stack>
            </Box>
          </Stack>
        );

      case Phase.DemoCta:
      case Phase.Ended:
        const ctaSlide = slide as CtaSlide | EndedSlide;
        return (
          <Stack orientation="vertical" spacing="space60">
            <Box textAlign="center">
              <Box marginBottom="space30">
                <Heading as="h2" variant="heading20">
                  {ctaSlide.title || "Untitled"}
                </Heading>
              </Box>
              {ctaSlide.description && (
                <Text as="p" color="colorTextWeak">
                  {ctaSlide.description}
                </Text>
              )}
            </Box>

            <Stack orientation="vertical" spacing="space40">
              {ctaSlide.options && ctaSlide.options.length > 0 ? (
                ctaSlide.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={option.primary ? "primary" : "secondary"}
                    fullWidth
                    size="default"
                  >
                    {option.optionLabel || `Button ${index + 1}`}
                  </Button>
                ))
              ) : (
                <Box
                  padding="space60"
                  backgroundColor="colorBackgroundWeak"
                  borderRadius="borderRadius20"
                  textAlign="center"
                >
                  <Text as="p" color="colorTextWeak" fontSize="fontSize30">
                    No buttons configured
                  </Text>
                </Box>
              )}
            </Stack>
          </Stack>
        );

      case Phase.WatchPresenter:
      case Phase.WebRtc:
      case Phase.Submitted:
        return (
          <Box textAlign="center">
            <Box marginBottom="space30">
              <Heading as="h2" variant="heading20">
                {slide.title || "Untitled"}
              </Heading>
            </Box>
            {slide.description && (
              <Text as="p" color="colorTextWeak">
                {slide.description}
              </Text>
            )}
          </Box>
        );

      default:
        return (
          <Box textAlign="center">
            <Text as="p" color="colorTextWeak">
              Preview not available for this slide type
            </Text>
          </Box>
        );
    }
  };

  return (
    <Box>
      <Box marginBottom="space30">
        <Text as="p" fontSize="fontSize20" color="colorTextWeak" fontWeight="fontWeightSemibold">
          PREVIEW
        </Text>
      </Box>

      <Card padding="space80">
        <Box
          minHeight="400px"
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          {renderPreviewContent()}
        </Box>
      </Card>

      <Box marginTop="space30">
        <Text as="p" fontSize="fontSize20" color="colorTextWeak" textAlign="center">
          Slide ID: {slide.id || "Not set"} • Type: {slide.kind || "Not set"}
        </Text>
      </Box>
    </Box>
  );
}
