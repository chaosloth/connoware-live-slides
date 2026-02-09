"use client";
import React from "react";
import { Box } from "@twilio-paste/core/box";
import { Card } from "@twilio-paste/core/card";
import { Heading } from "@twilio-paste/core/heading";
import { Spinner } from "@twilio-paste/core/spinner";
import { FC } from "react";
import LogoHeader from "../LogoHeader";
import { Slide } from "@/types/LiveSlides";

export type WelcomeCardProps = {
  data: Slide;
};

const WelcomeCard: FC<WelcomeCardProps> = (props: WelcomeCardProps) => {
  return (
    <Card>
      <LogoHeader />
      <Box display="flex" justifyContent="center">
        <Heading as={"div"} variant={"heading20"}>
          {props.data.title || "Standby for the show..."}
        </Heading>
      </Box>
      <Box display="flex" justifyContent="center" paddingTop={"space40"}>
        <Spinner
          decorative={true}
          size={"sizeIcon80"}
          color={"colorTextDestructive"}
        />
      </Box>
    </Card>
  );
};

export default WelcomeCard;
