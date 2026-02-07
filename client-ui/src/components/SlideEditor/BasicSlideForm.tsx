"use client";

import React from "react";
import {
  Box,
  Input,
  Label,
  FormControl,
  HelpText,
  TextArea,
  Stack,
  Text,
  Disclosure,
  DisclosureHeading,
  DisclosureContent,
} from "@twilio-paste/core";
import { Slide } from "@/types/LiveSlides";

interface BasicSlideFormProps {
  slide: Slide;
  onChange: (slide: Slide) => void;
  allSlides?: Slide[];
}

/**
 * Basic form for simple slides (WatchPresenter, WebRTC, Submitted)
 */
export function BasicSlideForm({ slide, onChange, allSlides = [] }: BasicSlideFormProps) {
  const handleFieldChange = (field: keyof Slide, value: any) => {
    const updated = { ...slide, [field]: value } as Slide;
    onChange(updated);
  };

  return (
    <Stack orientation="vertical" spacing="space50">
      <Disclosure variant="contained">
        <DisclosureHeading as="h3" variant="heading50">
          Slide Metadata
        </DisclosureHeading>
        <DisclosureContent>
          <Stack orientation="vertical" spacing="space50">
            <FormControl>
              <Label htmlFor="slide-id" required>
                Slide ID
              </Label>
              <Input
                id="slide-id"
                type="text"
                value={slide.id}
                onChange={(e) => handleFieldChange("id", e.target.value)}
                placeholder="e.g., WAIT-1"
                required
              />
              <HelpText>Unique identifier for this slide</HelpText>
            </FormControl>

            <FormControl>
              <Label htmlFor="slide-title" required>
                Title
              </Label>
              <Input
                id="slide-title"
                type="text"
                value={slide.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="e.g., Watch the presenter"
                required
              />
              <HelpText>Heading shown to users</HelpText>
            </FormControl>

            <FormControl>
              <Label htmlFor="slide-description">
                Description
              </Label>
              <TextArea
                id="slide-description"
                value={slide.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Optional description"
                rows={4}
              />
              <HelpText>Additional information shown below the title</HelpText>
            </FormControl>

            <Box
              padding="space50"
              backgroundColor="colorBackgroundPrimaryWeakest"
              borderRadius="borderRadius20"
            >
              <Text as="p" fontSize="fontSize30" color="colorText">
                This is a simple informational slide. Users will see the title and description you provide.
              </Text>
            </Box>
          </Stack>
        </DisclosureContent>
      </Disclosure>
    </Stack>
  );
}
