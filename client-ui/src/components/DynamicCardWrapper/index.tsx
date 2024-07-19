"use client";
import React from "react";
import { FC } from "react";

import { Phase } from "@/types/Phases";
import { Cta, Page } from "@/types/LiveSlides";

import QuestionCard from "@/components/QuestionCard";
import WatchPresenterCard from "@/components/WatchPresenterCard";
import IdentifyCard from "@/components/IdentifyCard";
import StartPhoneDemoCard from "@/components/StartPhoneDemoCard";
import ErrorCard from "@/components/ErrorCard";
import SubmittedCard from "@/components/SubmittedCard";
import WebRtcCard from "@/components/WebRtcCard";

export type DynamicCardWrapperProps = {
  page: Page | undefined;
  performCta: (cta: Cta) => void;
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
    if (!props.page || !props.page.type)
      return (
        <ErrorCard
          title="Nothing to see here..."
          emphasis="Please scan the QR code again. "
          message="Or don't, it's your life, don't let me tell you what to do."
        />
      );

    switch (props.page.type) {
      case Phase.Question:
        return <QuestionCard data={props.page} performCta={props.performCta} />;
      case Phase.Submitted:
        return <SubmittedCard data={props.page} />;
      case Phase.WatchPresenter:
        return <WatchPresenterCard />;
      case Phase.Identify:
        return <IdentifyCard />;
      case Phase.WebRtc:
        return <WebRtcCard data={props.page} />;
      case Phase.DemoCta:
        return (
          <StartPhoneDemoCard data={props.page} performCta={props.performCta} />
        );
    }
  };

  return getComponentForPhase();
};

export default DynamicCardWrapper;
