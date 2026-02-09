"use client";

import React from "react";
import {
  Box,
  Button,
  Input,
  Label,
  FormControl,
  HelpText,
  TextArea,
  Stack,
  Card,
  Checkbox,
  Heading,
  Separator,
  Text,
  Select,
  Option as SelectOption,
} from "@twilio-paste/core";
import { DeleteIcon } from "@twilio-paste/icons/esm/DeleteIcon";
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import { CtaSlide, EndedSlide, Option, Slide } from "@/types/LiveSlides";
import { ActionBuilder } from "../ActionBuilder";
import { Phase } from "@/types/Phases";

interface CtaSlideFormProps {
  slide: CtaSlide | EndedSlide;
  onChange: (slide: CtaSlide | EndedSlide) => void;
  allSlides?: Slide[];
}

export function CtaSlideForm({ slide, onChange, allSlides = [] }: CtaSlideFormProps) {
  const handleFieldChange = (field: string, value: any) => {
    const updated = { ...slide, [field]: value };
    onChange(updated as CtaSlide | EndedSlide);
  };

  const handleAddOption = () => {
    const newOption = new Option();
    newOption.optionLabel = "";
    newOption.primary = true;
    newOption.afterSubmitActions = [];

    const updated = { ...slide };
    updated.options = [...(updated.options || []), newOption];
    onChange(updated as CtaSlide | EndedSlide);
  };

  const handleRemoveOption = (index: number) => {
    const updated = { ...slide };
    updated.options = (updated.options || []).filter((_, i) => i !== index);
    onChange(updated as CtaSlide | EndedSlide);
  };

  const handleOptionChange = (index: number, field: keyof Option, value: any) => {
    const updated = { ...slide };
    const options = [...(updated.options || [])];
    options[index] = { ...options[index], [field]: value };
    updated.options = options;
    onChange(updated as CtaSlide | EndedSlide);
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
          <SelectOption value={Phase.Welcome}>Welcome</SelectOption>
          <SelectOption value={Phase.Question}>Question</SelectOption>
          <SelectOption value={Phase.Identify}>Identify</SelectOption>
          <SelectOption value={Phase.DemoCta}>Demo CTA</SelectOption>
          <SelectOption value={Phase.WatchPresenter}>Watch Presenter</SelectOption>
          <SelectOption value={Phase.WebRtc}>WebRTC</SelectOption>
          <SelectOption value={Phase.Submitted}>Submitted</SelectOption>
          <SelectOption value={Phase.Ended}>Ended</SelectOption>
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
          placeholder="e.g., CTA-1"
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
          placeholder="e.g., Take the next step"
          required
        />
        <HelpText>Main heading shown to users</HelpText>
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
        />
        <HelpText>Additional information shown below the title</HelpText>
      </FormControl>

      <Separator orientation="horizontal" />

      <Box>
        <Box marginBottom="space40">
          <Heading as="h3" variant="heading40">
            Action Buttons
          </Heading>
        </Box>

        {(!slide.options || slide.options.length === 0) ? (
          <Box
            padding="space60"
            backgroundColor="colorBackgroundWeak"
            borderRadius="borderRadius30"
            textAlign="center"
            marginBottom="space40"
          >
            <Stack orientation="vertical" spacing="space40">
              <Text as="p" color="colorTextWeak">
                No buttons added yet
              </Text>
              <Button variant="secondary" onClick={handleAddOption}>
                <PlusIcon decorative />
                Add First Button
              </Button>
            </Stack>
          </Box>
        ) : (
          <Stack orientation="vertical" spacing="space40">
            {slide.options.map((option, index) => (
              <Card key={index} padding="space60">
                <Stack orientation="vertical" spacing="space40">
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Heading as="h4" variant="heading50">
                      Button {index + 1}
                    </Heading>
                    <Button
                      variant="destructive_link"
                      size="small"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <DeleteIcon decorative={false} title="Remove button" />
                      Remove
                    </Button>
                  </Box>

                  <FormControl>
                    <Label htmlFor={`option-label-${index}`} required>
                      Button Label
                    </Label>
                    <Input
                      id={`option-label-${index}`}
                      type="text"
                      value={option.optionLabel}
                      onChange={(e) => handleOptionChange(index, "optionLabel", e.target.value)}
                      placeholder="e.g., Call Now"
                      required
                    />
                    <HelpText>Text shown on the button</HelpText>
                  </FormControl>

                  <Checkbox
                    id={`option-primary-${index}`}
                    checked={option.primary ?? true}
                    onChange={(e) => handleOptionChange(index, "primary", e.target.checked)}
                  >
                    Primary button style
                  </Checkbox>

                  <Separator orientation="horizontal" />

                  <ActionBuilder
                    actions={option.afterSubmitActions || []}
                    onChange={(actions) => handleOptionChange(index, "afterSubmitActions", actions)}
                    availableSlides={allSlides}
                    label="Actions on click"
                    helpText="Actions that run when this button is clicked"
                  />
                </Stack>
              </Card>
            ))}

            <Button variant="secondary" onClick={handleAddOption}>
              <PlusIcon decorative />
              Add Another Button
            </Button>
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
