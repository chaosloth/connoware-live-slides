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
import { Cta, CtaPage } from "@/types/LiveSlides";
import LogoHeader from "../LogoHeader";

export type CtaPageProps = {
  data: CtaPage;
  performCta: (cta: Cta) => void;
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
        {props.data.cta &&
          props.data.cta.map((cta, idx) => (
            <Button
              key={idx}
              fullWidth={true}
              variant={cta.primary ? "primary" : "secondary"}
              onClick={() => props.performCta(cta)}
            >
              {cta.label}
            </Button>
          ))}
      </Stack>
    </Card>
  );
};

export default StartPhoneDemoCard;
