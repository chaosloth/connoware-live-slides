"use client";
import React from "react";

import { Flex } from "@twilio-paste/core/flex";
import { Card } from "@twilio-paste/core/card";
import { Heading } from "@twilio-paste/core/heading";
import { Paragraph } from "@twilio-paste/core/paragraph";
import { Spinner } from "@twilio-paste/core/spinner";

import { FC } from "react";

import LogoHeader from "../LogoHeader";
import { SubmittedPage } from "@/types/LiveSlides";
export type SubmittedCardProps = {
  data: SubmittedPage;
};
const SubmittedCard: FC<SubmittedCardProps> = (props: SubmittedCardProps) => {
  return (
    <Card>
      <LogoHeader />
      <Heading as={"div"} variant={"heading20"}>
        {props.data.title}
      </Heading>
      <Paragraph>{props.data.description}</Paragraph>
      <Paragraph>Standby while we collect more answers</Paragraph>
      <Flex hAlignContent={"center"} paddingTop={"space40"}>
        <Spinner
          decorative={true}
          size={"sizeIcon80"}
          color={"colorTextDestructive"}
        />
      </Flex>
    </Card>
  );
};

export default SubmittedCard;
