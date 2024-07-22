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
