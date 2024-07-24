"use client";
import React from "react";

import { Flex } from "@twilio-paste/core/flex";
import { Card } from "@twilio-paste/core/card";
import { Heading } from "@twilio-paste/core/heading";
import { Paragraph } from "@twilio-paste/core/paragraph";
import { Spinner } from "@twilio-paste/core/spinner";
import Image from "next/image";
import { FC } from "react";

import LogoHeader from "../LogoHeader";
import { SubmittedSlide } from "@/types/LiveSlides";

import planeIcon from "@/icons/plane.svg";
import { Stack } from "@twilio-paste/core";

export type SubmittedCardProps = {
  data: SubmittedSlide;
};
const SubmittedCard: FC<SubmittedCardProps> = (props: SubmittedCardProps) => {
  return (
    <Card>
      <LogoHeader />
      <Heading as={"div"} variant={"heading20"}>
        {props.data.title}
      </Heading>
      <Paragraph>{props.data.description}</Paragraph>
      <Image src={planeIcon} alt={"Plane"} priority={true} />
      <Stack spacing="space40" orientation={"vertical"}>
        <Flex hAlignContent={"center"}>
          <Spinner
            decorative={true}
            size={"sizeIcon80"}
            color={"colorTextDestructive"}
          />
        </Flex>
        <Paragraph>We're tallying the responses</Paragraph>
      </Stack>
    </Card>
  );
};

export default SubmittedCard;
