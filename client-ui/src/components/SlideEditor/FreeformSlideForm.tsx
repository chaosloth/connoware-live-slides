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
  Select,
  Option,
} from "@twilio-paste/core";
import { FreeformSlide, Slide } from "@/types/LiveSlides";
import { ActionBuilder } from "../ActionBuilder";
import { Phase } from "@/types/Phases";

interface FreeformSlideFormProps {
  slide: FreeformSlide;
  onChange: (slide: FreeformSlide) => void;
  allSlides?: Slide[];
}

export function FreeformSlideForm({ slide, onChange, allSlides = [] }: FreeformSlideFormProps) {
  const handleFieldChange = (field: keyof FreeformSlide, value: any) => {
    const updated = { ...slide, [field]: value } as FreeformSlide;
    onChange(updated);
  };

  return (
    <Stack orientation="vertical" spacing="space60">
      <FormControl>
        <Label htmlFor="slide-type" required>
          Slide Type
        </Label>
        <Select
          id="slide-type"
          value={slide.kind}
          onChange={(e) => handleFieldChange("kind", e.target.value as Phase)}
          required
        >
          <Option value={Phase.Welcome}>Welcome</Option>
          <Option value={Phase.Question}>Question</Option>
          <Option value={Phase.Identify}>Identify</Option>
          <Option value={Phase.DemoCta}>Demo CTA</Option>
          <Option value={Phase.WatchPresenter}>Watch Presenter</Option>
          <Option value={Phase.WebRtc}>WebRTC</Option>
          <Option value={Phase.Freeform}>Freeform Input</Option>
          <Option value={Phase.Submitted}>Submitted</Option>
          <Option value={Phase.Ended}>Ended</Option>
        </Select>
        <HelpText>The type of slide determines what form fields and behavior are available</HelpText>
      </FormControl>

      <FormControl>
        <Label htmlFor="slide-id" required>
          Slide ID
        </Label>
        <Input
          id="slide-id"
          type="text"
          value={slide.id}
          onChange={(e) => handleFieldChange("id", e.target.value)}
          placeholder="e.g., feedback-1"
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
          placeholder="e.g., Share Your Feedback"
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
        <Box marginBottom="space40">
          <Heading as="h3" variant="heading40">
            Freeform Input Configuration
          </Heading>
        </Box>

        <FormControl>
          <Label htmlFor="slide-prompt" required>
            Prompt / Question
          </Label>
          <Input
            id="slide-prompt"
            type="text"
            value={slide.prompt}
            onChange={(e) => handleFieldChange("prompt", e.target.value)}
            placeholder="e.g., What did you think of today's presentation?"
            required
          />
          <HelpText>The label/question shown above the text input field</HelpText>
        </FormControl>

        <FormControl>
          <Label htmlFor="slide-placeholder">
            Placeholder Text
          </Label>
          <Input
            id="slide-placeholder"
            type="text"
            value={slide.placeholder}
            onChange={(e) => handleFieldChange("placeholder", e.target.value)}
            placeholder="e.g., Enter your response here..."
          />
          <HelpText>Placeholder text shown inside the input field</HelpText>
        </FormControl>

        <FormControl>
          <Label htmlFor="slide-submit-label">
            Submit Button Label
          </Label>
          <Input
            id="slide-submit-label"
            type="text"
            value={slide.submitButtonLabel}
            onChange={(e) => handleFieldChange("submitButtonLabel", e.target.value)}
            placeholder="Submit"
          />
          <HelpText>Text displayed on the submit button (defaults to &quot;Submit&quot;)</HelpText>
        </FormControl>
      </Box>

      <Separator orientation="horizontal" />

      <ActionBuilder
        actions={slide.afterSubmitActions || []}
        onChange={(actions) => handleFieldChange("afterSubmitActions", actions)}
        availableSlides={allSlides}
        label="Actions after submission"
        helpText="Actions that run when user submits their response"
      />
    </Stack>
  );
}
