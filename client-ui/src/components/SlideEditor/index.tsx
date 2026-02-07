"use client";

import React from "react";
import { Box, Alert, Text } from "@twilio-paste/core";
import { Phase } from "@/types/Phases";
import {
  Slide,
  QuestionSlide,
  GateSlide,
  CtaSlide,
  WaitSlide,
  WebRtcSlide,
  EndedSlide,
} from "@/types/LiveSlides";
import { QuestionSlideForm } from "./QuestionSlideForm";
import { IdentifySlideForm } from "./IdentifySlideForm";
import { CtaSlideForm } from "./CtaSlideForm";
import { BasicSlideForm } from "./BasicSlideForm";

interface SlideEditorProps {
  slide: Slide;
  onChange: (slide: Slide) => void;
  allSlides?: Slide[];
}

/**
 * Universal slide editor that renders the appropriate form based on slide type
 */
export function SlideEditor({ slide, onChange, allSlides = [] }: SlideEditorProps) {
  if (!slide.kind) {
    return (
      <Alert variant="warning">
        <Text as="p">Please select a slide type first</Text>
      </Alert>
    );
  }

  switch (slide.kind) {
    case Phase.Question:
      return (
        <QuestionSlideForm
          slide={slide as QuestionSlide}
          onChange={onChange as (slide: QuestionSlide) => void}
          allSlides={allSlides}
        />
      );

    case Phase.Identify:
      return (
        <IdentifySlideForm
          slide={slide as GateSlide}
          onChange={onChange as (slide: GateSlide) => void}
          allSlides={allSlides}
        />
      );

    case Phase.DemoCta:
    case Phase.Ended:
      return (
        <CtaSlideForm
          slide={slide as CtaSlide | EndedSlide}
          onChange={onChange as (slide: CtaSlide | EndedSlide) => void}
          allSlides={allSlides}
        />
      );

    case Phase.WatchPresenter:
    case Phase.WebRtc:
    case Phase.Submitted:
      return (
        <BasicSlideForm
          slide={slide}
          onChange={onChange}
          allSlides={allSlides}
        />
      );

    default:
      return (
        <Alert variant="error">
          <Text as="p">Unknown slide type: {slide.kind}</Text>
        </Alert>
      );
  }
}
