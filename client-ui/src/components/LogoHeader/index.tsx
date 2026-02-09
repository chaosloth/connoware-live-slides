"use client";
import React from "react";
import Image from "next/image";

import { Box } from "@twilio-paste/core/box";
import { FC } from "react";

import twilioIcon from "@/icons/twilio.svg";

const LogoHeader: FC = () => {
  return (
    <Box display="flex" justifyContent="center" paddingBottom={"space40"}>
      <Image src={twilioIcon} alt={""} />
    </Box>
  );
};

export default LogoHeader;
