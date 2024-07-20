"use client";
import React, { useState } from "react";
import Image from "next/image";

import { Card } from "@twilio-paste/core/card";
import { Heading } from "@twilio-paste/core/heading";
import { Paragraph } from "@twilio-paste/core/paragraph";
import { Button } from "@twilio-paste/core/button";
import { Box } from "@twilio-paste/core/box";
import { Stack } from "@twilio-paste/core/stack";

import { FC } from "react";

import hoodieIcon from "@/icons/hoodie.svg";
import { Action, CtaSlide } from "@/types/LiveSlides";
import LogoHeader from "../LogoHeader";

export type CtaPageProps = {
  data: CtaSlide;
  performActions: (actions: Action[]) => void;
};

const StartPhoneDemoCard: FC<CtaPageProps> = (props: CtaPageProps) => {
  return (
    <Card>
      <LogoHeader />
      <Heading as={"div"} variant={"heading20"}>
        {props.data.title}
      </Heading>
      <Box textAlign={"center"}>
        <Image src={hoodieIcon} alt={"Welcome"} priority={true} />
      </Box>
      <Paragraph>{props.data.description}</Paragraph>
      <Stack orientation={"vertical"} spacing={"space50"}>
        {props.data.options &&
          props.data.options.map((option, idx) => (
            <Button
              key={idx}
              fullWidth={true}
              variant={option.primary ? "primary" : "secondary"}
              onClick={() => props.performActions(option.afterSubmitActions)}
            >
              {option.optionLabel}
            </Button>
          ))}
      </Stack>
    </Card>
  );
};

export default StartPhoneDemoCard;
