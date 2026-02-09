"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  Stack,
  Table,
  THead,
  TBody,
  Tr,
  Th,
  Td,
} from "@twilio-paste/core";
import { EditIcon } from "@twilio-paste/icons/esm/EditIcon";
import { DeleteIcon } from "@twilio-paste/icons/esm/DeleteIcon";
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import { DragIcon } from "@twilio-paste/icons/esm/DragIcon";
import { CopyIcon } from "@twilio-paste/icons/esm/CopyIcon";
import { Slide } from "@/types/LiveSlides";
import { SLIDE_TYPES } from "@/schemas/presentationSchema";

interface SlideListEditorProps {
  slides: Slide[];
  selectedSlideId?: string;
  onSelectSlide: (slide: Slide) => void;
  onReorderSlide: (fromIndex: number, toIndex: number) => void;
  onDeleteSlide: (slide: Slide) => void;
  onCloneSlide: (slide: Slide) => void;
  onAddSlide: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

/**
 * Component for viewing, selecting, and reordering slides
 */
export function SlideListEditor({
  slides,
  selectedSlideId,
  onSelectSlide,
  onReorderSlide,
  onDeleteSlide,
  onCloneSlide,
  onAddSlide,
  isCollapsed = false,
  onToggleCollapse,
}: SlideListEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const getSlideTypeInfo = (slide: Slide) => {
    return SLIDE_TYPES.find((t) => t.type === slide.kind);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    onReorderSlide(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  if (slides.length === 0) {
    return (
      <Box
        padding="space60"
        backgroundColor="colorBackgroundWeak"
        borderRadius="borderRadius30"
        textAlign="center"
      >
        <Stack orientation="vertical" spacing="space60">
          <Box>
            <Box marginBottom="space30">
              <Heading as="h3" variant="heading40">
                No slides yet
              </Heading>
            </Box>
            <Text as="p" color="colorTextWeak">
              Get started by adding your first slide
            </Text>
          </Box>
          <Button variant="primary" onClick={onAddSlide}>
            <PlusIcon decorative />
            Add First Slide
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom="space30">
        <Box display="flex" alignItems="center" columnGap="space30">
          <Heading as="h3" variant="heading40">
            Slides ({slides.length})
          </Heading>
          {selectedSlideId && onToggleCollapse && (
            <Button variant="link" size="small" onClick={onToggleCollapse}>
              {isCollapsed ? "Expand" : "Collapse"}
            </Button>
          )}
        </Box>
        <Button variant="secondary" size="small" onClick={onAddSlide}>
          <PlusIcon decorative />
          Add
        </Button>
      </Box>

      <Table>
          <THead>
            <Tr>
              <Th>Title</Th>
              <Th>Type</Th>
              <Th width="120px" textAlign="right">Actions</Th>
              <Th width="40px"></Th>
            </Tr>
          </THead>
          <TBody>
            {slides.map((slide, index) => {
              const typeInfo = getSlideTypeInfo(slide);
              const isSelected = slide.id === selectedSlideId;

              return (
                <Tr
                  key={slide.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  style={{
                    backgroundColor: isSelected ? "rgb(235, 244, 255)" : undefined,
                    cursor: "grab",
                  }}
                >
                  <Td>
                    <Text as="span" fontWeight={isSelected ? "fontWeightSemibold" : "fontWeightNormal"}>
                      {slide.title || "Untitled"}
                    </Text>
                  </Td>
                  <Td>
                    <Text as="span" color="colorTextWeak" fontSize="fontSize30">
                      {typeInfo?.label || slide.kind}
                    </Text>
                  </Td>
                  <Td textAlign="right">
                    <Box display="flex" alignItems="center" justifyContent="flex-end" columnGap="space20">
                      <Button
                        variant={isSelected ? "primary" : "secondary"}
                        size="icon_small"
                        onClick={() => onSelectSlide(slide)}
                        title={isSelected ? "Editing" : "Edit slide"}
                      >
                        <EditIcon decorative={false} title="Edit slide" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon_small"
                        onClick={() => onCloneSlide(slide)}
                        title="Clone slide"
                      >
                        <CopyIcon decorative={false} title="Clone slide" />
                      </Button>
                      <Button
                        variant="destructive_secondary"
                        size="icon_small"
                        onClick={() => onDeleteSlide(slide)}
                        title="Delete slide"
                      >
                        <DeleteIcon decorative={false} title="Delete slide" />
                      </Button>
                    </Box>
                  </Td>
                  <Td>
                    <Box display="flex" alignItems="center" justifyContent="center">
                      <DragIcon decorative size="sizeIcon30" color="colorTextWeak" />
                    </Box>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
    </Box>
  );
}
