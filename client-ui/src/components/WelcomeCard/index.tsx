"use client";
import React from "react";
import Image from "next/image";

import { Flex } from "@twilio-paste/core/flex";
import { Card } from "@twilio-paste/core/card";
import { Heading } from "@twilio-paste/core/heading";
import { Paragraph } from "@twilio-paste/core/paragraph";
import { Spinner } from "@twilio-paste/core/spinner";

import { FC } from "react";

import puzzleIcon from "@/icons/puzzle.svg";

import LogoHeader from "../LogoHeader";

const WelcomeCard: FC = () => {
  return (
    <Card>
      <LogoHeader />
      <Heading as={"div"} variant={"heading20"}>
        Standby for the show...
      </Heading>
      <Paragraph>Say goodbye to cookie cutter presentations!</Paragraph>
      <Image src={puzzleIcon} alt={"Welcome"} priority={true} />
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

export default WelcomeCard;
