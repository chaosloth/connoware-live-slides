"use client";

import { Flex } from "@twilio-paste/core/flex";
import { Box } from "@twilio-paste/core/box";
import { FC } from "react";

export type CenterLayoutProps = {
  children?: React.ReactNode;
};

const CenterLayout: FC<CenterLayoutProps> = ({ children }) => {
  return (
    <Box margin={"space50"} height={"100vh"}>
      <Flex hAlignContent="center" vertical height={"100vh"}>
        <Flex vAlignContent={"center"} height={"100vh"}>
          <Box padding="space40" width="400px">
            {children}
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
};

export default CenterLayout;
