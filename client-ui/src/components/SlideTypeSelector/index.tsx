"use client";

import React from "react";
import { Box, Card, Heading, Text, Grid, Column } from "@twilio-paste/core";
import { Phase } from "@/types/Phases";
import { SLIDE_TYPES, SlideTypeMetadata } from "@/schemas/presentationSchema";
import { InformationIcon } from "@twilio-paste/icons/esm/InformationIcon";
import { ProductContactCenterAdminIcon } from "@twilio-paste/icons/esm/ProductContactCenterAdminIcon";
import { LinkExternalIcon } from "@twilio-paste/icons/esm/LinkExternalIcon";
import { ShowIcon } from "@twilio-paste/icons/esm/ShowIcon";
import { FileVideoIcon } from "@twilio-paste/icons/esm/FileVideoIcon";
import { AcceptIcon } from "@twilio-paste/icons/esm/AcceptIcon";
import { CheckboxCheckIcon } from "@twilio-paste/icons/esm/CheckboxCheckIcon";

interface SlideTypeSelectorProps {
  onSelect: (type: Phase) => void;
  selectedType?: Phase;
}

/**
 * Visual selector for choosing slide types
 */
export function SlideTypeSelector({ onSelect, selectedType }: SlideTypeSelectorProps) {
  const categories = {
    interactive: SLIDE_TYPES.filter((t) => t.category === "interactive"),
    informational: SLIDE_TYPES.filter((t) => t.category === "informational"),
    transition: SLIDE_TYPES.filter((t) => t.category === "transition"),
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      InformationIcon,
      ProductContactCenterAdminIcon,
      LinkExternalIcon,
      ShowIcon,
      FileVideoIcon,
      AcceptIcon,
      CheckboxCheckIcon,
    };
    const IconComponent = iconMap[iconName];
    return IconComponent ? (
      <IconComponent decorative size="sizeIcon80" color="colorTextIcon" />
    ) : null;
  };

  const renderSlideTypeCard = (slideType: SlideTypeMetadata) => {
    const isSelected = selectedType === slideType.type;

    return (
      <Box
        key={slideType.type}
        onClick={() => onSelect(slideType.type)}
        cursor="pointer"
        _hover={{
          transform: "translateY(-2px)",
          boxShadow: "shadowHigh",
        }}
        transition="all 0.2s"
        padding="space60"
        backgroundColor={
          isSelected ? "colorBackgroundPrimaryWeakest" : "colorBackgroundBody"
        }
        borderColor={isSelected ? "colorBorderPrimary" : "colorBorder"}
        borderWidth="borderWidth20"
        borderStyle="solid"
        borderRadius="borderRadius30"
      >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            rowGap="space30"
          >
            {getIconComponent(slideType.icon)}
            <Heading as="h3" variant="heading50" marginBottom="space0">
              {slideType.label}
            </Heading>
            <Text as="p" color="colorTextWeak" fontSize="fontSize30">
              {slideType.description}
            </Text>
          </Box>
      </Box>
    );
  };

  return (
    <Box>
      <Box marginBottom="space60">
        <Box marginBottom="space30">
          <Heading as="h2" variant="heading30">
            Interactive Slides
          </Heading>
        </Box>
        <Box marginBottom="space40">
          <Text as="p" color="colorTextWeak">
            Engage your audience with questions and actions
          </Text>
        </Box>
        <Grid gutter="space40" vertical={[true, false, false]}>
          {categories.interactive.map((slideType) => (
            <Column key={slideType.type} span={[12, 6, 4]}>
              {renderSlideTypeCard(slideType)}
            </Column>
          ))}
        </Grid>
      </Box>

      <Box marginBottom="space60">
        <Box marginBottom="space30">
          <Heading as="h2" variant="heading30">
            Informational Slides
          </Heading>
        </Box>
        <Box marginBottom="space40">
          <Text as="p" color="colorTextWeak">
            Share information and guide attention
          </Text>
        </Box>
        <Grid gutter="space40" vertical={[true, false, false]}>
          {categories.informational.map((slideType) => (
            <Column key={slideType.type} span={[12, 6, 4]}>
              {renderSlideTypeCard(slideType)}
            </Column>
          ))}
        </Grid>
      </Box>

      <Box marginBottom="space60">
        <Box marginBottom="space30">
          <Heading as="h2" variant="heading30">
            Transition Slides
          </Heading>
        </Box>
        <Box marginBottom="space40">
          <Text as="p" color="colorTextWeak">
            Control presentation flow
          </Text>
        </Box>
        <Grid gutter="space40" vertical={[true, false, false]}>
          {categories.transition.map((slideType) => (
            <Column key={slideType.type} span={[12, 6, 4]}>
              {renderSlideTypeCard(slideType)}
            </Column>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
