"use client";
import React from "react";
import Image from "next/image";

import { Flex } from "@twilio-paste/core/flex";
import { Box } from "@twilio-paste/core/box";
import { FC } from "react";

import twilioIcon from "@/icons/twilio.svg";

const LogoHeader: FC = () => {
  return (
    <Flex hAlignContent="center" vertical>
      <Box paddingBottom={"space40"}>
        <Image src={twilioIcon} alt={""} />
      </Box>
    </Flex>
  );
};

export default LogoHeader;
