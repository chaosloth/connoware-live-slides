"use client";
import React, { useState } from "react";

import { Stack } from "@twilio-paste/core/stack";
import { Card } from "@twilio-paste/core/card";
import { Heading } from "@twilio-paste/core/heading";
import { Paragraph } from "@twilio-paste/core/paragraph";
import { Button } from "@twilio-paste/core/button";

import { FC } from "react";

import LogoHeader from "../LogoHeader";
import { QuestionPage, Option, Cta } from "@/types/LiveSlides";

export type QuestionCardProps = {
  data: QuestionPage;
  performCta: (cta: Cta) => void;
};

const QuestionCard: FC<QuestionCardProps> = (props: QuestionCardProps) => {
  const [complete, setComplete] = useState<boolean>(false);

  const performAction = (option: Option) => {
    console.log(`User performed action: ${option.optionValue}`);
    setComplete(true);
    props.performCta(option.afterSubmitCta);
  };

  return (
    <Card>
      <LogoHeader />
      <Heading as={"div"} variant={"heading20"}>
        {props.data.title}
      </Heading>
      <Paragraph>{props.data.description}</Paragraph>

      <Stack orientation={"vertical"} spacing={"space50"}>
        {props.data.options &&
          props.data.options.map((option, idx) => (
            <Button
              key={idx}
              disabled={complete}
              fullWidth={true}
              variant="secondary"
              onClick={() => performAction(option)}
            >
              {option.optionLabel}
            </Button>
          ))}
      </Stack>
    </Card>
  );
};

export default QuestionCard;
