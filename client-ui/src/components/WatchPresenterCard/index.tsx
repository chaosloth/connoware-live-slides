"use client";
import React from "react";
import Image from "next/image";

import { Box } from "@twilio-paste/core/box";
import { Card } from "@twilio-paste/core/card";
import { Flex } from "@twilio-paste/core/flex";
import { Heading } from "@twilio-paste/core/heading";
import { Paragraph } from "@twilio-paste/core/paragraph";
import { Stack } from "@twilio-paste/core/stack";

import { FC } from "react";

import watchIcon from "@/icons/watch.svg";

import LogoHeader from "../LogoHeader";

const WatchPresenterCard: FC = () => {
  return (
    <Card>
      <LogoHeader />
      <Box
        backgroundColor={"colorBackgroundWeak"}
        borderStyle={"dashed"}
        borderColor={"colorBorderDecorative10Weaker"}
        borderWidth={"borderWidth20"}
        borderRadius={"borderRadius30"}
        alignContent={"center"}
        textAlign={"center"}
      >
        <Flex
          hAlignContent={"center"}
          vAlignContent={"center"}
          padding={"space50"}
        >
          <Stack orientation={"vertical"} spacing={"space40"}>
            <Heading as={"div"} variant={"heading40"}>
              *PSST*
            </Heading>
            <Paragraph>
              Keep this app open, but it&apos;s time to look at the big screen
              for a moment
            </Paragraph>
            <Image src={watchIcon} alt={"Watch"} priority={true} />
          </Stack>
        </Flex>
      </Box>
    </Card>
  );
};

export default WatchPresenterCard;
