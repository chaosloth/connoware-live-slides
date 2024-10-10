"use client";
import React from "react";

import { Card } from "@twilio-paste/core/card";
import { Heading } from "@twilio-paste/core/heading";
import { Paragraph } from "@twilio-paste/core/paragraph";
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
    </Card>
  );
};

export default SubmittedCard;
