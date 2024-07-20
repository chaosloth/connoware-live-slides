"use client";
import React from "react";
import { FC } from "react";

import { Phase } from "@/types/Phases";
import { Action, Slide } from "@/types/LiveSlides";

import QuestionCard from "@/components/QuestionCard";
import WatchPresenterCard from "@/components/WatchPresenterCard";
import IdentifyCard from "@/components/IdentifyCard";
import StartPhoneDemoCard from "@/components/StartPhoneDemoCard";
import ErrorCard from "@/components/ErrorCard";
import SubmittedCard from "@/components/SubmittedCard";
import WebRtcCard from "@/components/WebRtcCard";

export type DynamicCardWrapperProps = {
  slide: Slide | undefined;
  performActions: (actions: Action[]) => void;
};

const DynamicCardWrapper: FC<DynamicCardWrapperProps> = (
  props: DynamicCardWrapperProps
) => {
  /**
   *
   * Return the component fot the current phase
   *
   */
  const getComponentForPhase = () => {
    if (!props.slide || !props.slide.kind)
      return (
        <ErrorCard
          title="Nothing to see here..."
          emphasis="Please scan the QR code again. "
          message="Or don't, it's your life, don't let me tell you what to do."
        />
      );

    switch (props.slide.kind) {
      case Phase.Question:
        return (
          <QuestionCard
            data={props.slide}
            performActions={props.performActions}
          />
        );
      case Phase.Submitted:
        return <SubmittedCard data={props.slide} />;
      case Phase.WatchPresenter:
        return <WatchPresenterCard />;
      case Phase.Identify:
        return <IdentifyCard />;
      case Phase.WebRtc:
        return <WebRtcCard data={props.slide} />;
      case Phase.DemoCta:
        return (
          <StartPhoneDemoCard
            data={props.slide}
            performActions={props.performActions}
          />
        );
    }
  };

  return getComponentForPhase();
};

export default DynamicCardWrapper;
