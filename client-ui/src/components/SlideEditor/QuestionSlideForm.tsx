"use client";

import React, { useState } from "react";
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
  Disclosure,
  DisclosureHeading,
  DisclosureContent,
  Select,
  Option as SelectOption,
} from "@twilio-paste/core";
import { DeleteIcon } from "@twilio-paste/icons/esm/DeleteIcon";
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import { DragIcon } from "@twilio-paste/icons/esm/DragIcon";
import { CopyIcon } from "@twilio-paste/icons/esm/CopyIcon";
import { QuestionSlide, Option, Slide } from "@/types/LiveSlides";
import { ActionBuilder } from "../ActionBuilder";
import { Phase } from "@/types/Phases";

interface QuestionSlideFormProps {
  slide: QuestionSlide;
  onChange: (slide: QuestionSlide) => void;
  allSlides?: Slide[];
}

export function QuestionSlideForm({ slide, onChange, allSlides = [] }: QuestionSlideFormProps) {
  const handleFieldChange = (field: keyof QuestionSlide, value: any) => {
    const updated = { ...slide, [field]: value } as QuestionSlide;
    onChange(updated);
  };

  const handleAddOption = () => {
    const newOption = new Option();
    newOption.optionLabel = "";
    newOption.primary = true;
    newOption.afterSubmitActions = [];

    const updated = { ...slide };
    updated.options = [...(updated.options || []), newOption];
    onChange(updated);
  };

  const handleCloneOption = (index: number) => {
    const updated = { ...slide };
    const options = [...(updated.options || [])];
    const clonedOption = JSON.parse(JSON.stringify(options[index]));
    clonedOption.optionLabel = `${options[index].optionLabel} (Copy)`;
    options.splice(index + 1, 0, clonedOption);
    updated.options = options;
    onChange(updated);
  };

  const handleRemoveOption = (index: number) => {
    const updated = { ...slide };
    updated.options = (updated.options || []).filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleOptionChange = (index: number, field: keyof Option, value: any) => {
    const updated = { ...slide };
    const options = [...(updated.options || [])];
    options[index] = { ...options[index], [field]: value };
    updated.options = options;
    onChange(updated);
  };

  const handleReorderOption = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= (slide.options || []).length) return;

    const updated = { ...slide };
    const options = [...(updated.options || [])];
    const [movedOption] = options.splice(fromIndex, 1);
    options.splice(toIndex, 0, movedOption);
    updated.options = options;
    onChange(updated);
  };

  return (
    <Stack orientation="vertical" spacing="space50">
      {/* Metadata Section - Collapsible */}
      <Disclosure variant="contained">
        <DisclosureHeading as="h3" variant="heading50">
          Slide Metadata
        </DisclosureHeading>
        <DisclosureContent>
          <Stack orientation="vertical" spacing="space50">
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
                placeholder="e.g., Q1"
                required
              />
              <HelpText>Unique identifier for this slide</HelpText>
            </FormControl>

            <FormControl>
              <Label htmlFor="slide-title" required>
                Question
              </Label>
              <Input
                id="slide-title"
                type="text"
                value={slide.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder="Enter your question"
                required
              />
            </FormControl>

            <FormControl>
              <Label htmlFor="slide-description">
                Description
              </Label>
              <TextArea
                id="slide-description"
                value={slide.description || ""}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Additional context (optional)"
              />
            </FormControl>
          </Stack>
        </DisclosureContent>
      </Disclosure>

      {/* Options Section */}
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="space40">
          <Heading as="h4" variant="heading50">
            Answer Options
          </Heading>
          <Button variant="primary" size="small" onClick={handleAddOption}>
            <PlusIcon decorative />
            Add Option
          </Button>
        </Box>

        <Stack orientation="vertical" spacing="space40">
          {(slide.options || []).map((option, index) => (
            <Box
              key={index}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
                if (fromIndex !== index) {
                  handleReorderOption(fromIndex, index);
                }
              }}
            >
              <Disclosure variant="contained">
                <DisclosureHeading as="h5" variant="heading60">
                  <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                    <Text as="span">
                      Option {index + 1}: {option.optionLabel || "Untitled"}
                    </Text>
                    <Box display="flex" columnGap="space20" alignItems="center" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="secondary"
                        size="icon_small"
                        onClick={() => handleCloneOption(index)}
                        title="Clone option"
                      >
                        <CopyIcon decorative={false} title="Clone option" />
                      </Button>
                      <Box
                        cursor="grab"
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", index.toString());
                        }}
                        display="flex"
                        alignItems="center"
                        padding="space20"
                      >
                        <DragIcon decorative={false} title="Drag to reorder" size="sizeIcon30" />
                      </Box>
                    </Box>
                  </Box>
                </DisclosureHeading>
              <DisclosureContent>
                <Stack orientation="vertical" spacing="space50">
                  <FormControl>
                    <Label htmlFor={`option-label-${index}`} required>
                      Label
                    </Label>
                    <Input
                      id={`option-label-${index}`}
                      type="text"
                      value={option.optionLabel}
                      onChange={(e) => handleOptionChange(index, "optionLabel", e.target.value)}
                      placeholder="Answer text"
                      required
                    />
                  </FormControl>

                  <FormControl>
                    <Label htmlFor={`option-value-${index}`}>
                      Value
                    </Label>
                    <Input
                      id={`option-value-${index}`}
                      type="text"
                      value={option.optionValue || ""}
                      onChange={(e) => handleOptionChange(index, "optionValue", e.target.value)}
                      placeholder="Internal value (optional)"
                    />
                  </FormControl>

                  <Checkbox
                    id={`option-primary-${index}`}
                    checked={option.primary || false}
                    onChange={(e) => handleOptionChange(index, "primary", e.target.checked)}
                  >
                    Primary button style
                  </Checkbox>

                  <Box>
                    <Box marginBottom="space30">
                      <Text as="p" fontWeight="fontWeightSemibold" fontSize="fontSize30">
                        Actions for this option
                      </Text>
                    </Box>
                    <ActionBuilder
                      actions={option.afterSubmitActions || []}
                      onChange={(actions) => handleOptionChange(index, "afterSubmitActions", actions)}
                      availableSlides={allSlides}
                    />
                  </Box>

                  <Button
                    variant="destructive"
                    onClick={() => handleRemoveOption(index)}
                  >
                    <DeleteIcon decorative />
                    Remove Option
                  </Button>
                </Stack>
              </DisclosureContent>
            </Disclosure>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Slide-level Actions */}
      <Disclosure variant="contained">
        <DisclosureHeading as="h4" variant="heading50">
          Slide Actions
        </DisclosureHeading>
        <DisclosureContent>
          <ActionBuilder
            actions={slide.afterSubmitActions || []}
            onChange={(actions) => handleFieldChange("afterSubmitActions", actions)}
            availableSlides={allSlides}
          />
        </DisclosureContent>
      </Disclosure>
    </Stack>
  );
}
