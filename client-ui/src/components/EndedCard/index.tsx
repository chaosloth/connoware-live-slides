"use client";
import React from "react";
import Image from "next/image";

import { Flex } from "@twilio-paste/core/flex";
import { Card } from "@twilio-paste/core/card";
import { Heading } from "@twilio-paste/core/heading";
import { Paragraph } from "@twilio-paste/core/paragraph";
import { Spinner } from "@twilio-paste/core/spinner";

import { FC } from "react";

import puzzleIcon from "@/icons/bye.svg";

import LogoHeader from "../LogoHeader";

const EndedCard: FC = () => {
  return (
    <Card>
      <LogoHeader />
      <Heading as={"div"} variant={"heading20"}>
        And that's a wrap!
      </Heading>
      <Paragraph>We hope you enjoyed the experience!</Paragraph>
      <Image src={puzzleIcon} alt={"Welcome"} priority={true} />
    </Card>
  );
};

export default EndedCard;
