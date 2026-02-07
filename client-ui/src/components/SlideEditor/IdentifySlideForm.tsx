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
  Separator,
  Heading,
  Text,
} from "@twilio-paste/core";
import { GateSlide, Slide } from "@/types/LiveSlides";
import { ActionBuilder } from "../ActionBuilder";

interface IdentifySlideFormProps {
  slide: GateSlide;
  onChange: (slide: GateSlide) => void;
  allSlides?: Slide[];
}

export function IdentifySlideForm({ slide, onChange, allSlides = [] }: IdentifySlideFormProps) {
  const handleFieldChange = (field: keyof GateSlide, value: any) => {
    const updated = { ...slide, [field]: value } as GateSlide;
    onChange(updated);
  };

  return (
    <Stack orientation="vertical" spacing="space60">
      <FormControl>
        <Label htmlFor="slide-id" required>
          Slide ID
        </Label>
        <Input
          id="slide-id"
          type="text"
          value={slide.id}
          onChange={(e) => handleFieldChange("id", e.target.value)}
          placeholder="e.g., IDENTIFY-1"
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
          placeholder="e.g., Tell us about yourself"
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
          placeholder="Optional instructions for the user"
        />
        <HelpText>Additional information shown below the title</HelpText>
      </FormControl>

      <Separator orientation="horizontal" />

      <Box>
        <Box marginBottom="space20">
          <Heading as="h3" variant="heading40">
            User Information Collection
          </Heading>
        </Box>
        <Box
          padding="space50"
          backgroundColor="colorBackgroundPrimaryWeakest"
          borderRadius="borderRadius20"
          marginBottom="space40"
        >
          <Text as="p" fontSize="fontSize30" color="colorText">
            This slide will collect the user&apos;s phone number. Additional fields can be customized through the component.
          </Text>
        </Box>
      </Box>

      <Separator orientation="horizontal" />

      <ActionBuilder
        actions={slide.afterSubmitActions || []}
        onChange={(actions) => handleFieldChange("afterSubmitActions", actions)}
        availableSlides={allSlides}
        label="Actions after submission"
        helpText="Actions that run when user submits their information"
      />
    </Stack>
  );
}
