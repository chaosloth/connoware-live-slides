"use client";
import React from "react";

import { Card } from "@twilio-paste/core/card";
import { Heading } from "@twilio-paste/core/heading";
import { Paragraph } from "@twilio-paste/core/paragraph";

import { FC } from "react";

import LogoHeader from "../LogoHeader";
import { WebRtcPage } from "@/types/LiveSlides";
export type WebRtcCardProps = {
  data: WebRtcPage;
};
const WebRtcCard: FC<WebRtcCardProps> = (props: WebRtcCardProps) => {
  return (
    <Card>
      <LogoHeader />
      <Heading as={"div"} variant={"heading20"}>
        {props.data.title}
      </Heading>
      <Paragraph>{props.data.description}</Paragraph>
    </Card>
  );
};

export default WebRtcCard;
