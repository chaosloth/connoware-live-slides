"use client";

import { Box } from "@twilio-paste/core/box";
import { FC } from "react";

export type CenterLayoutProps = {
  children?: React.ReactNode;
};

const CenterLayout: FC<CenterLayoutProps> = ({ children }) => {
  return (
    <Box margin={"space50"} height={"100%"} display="flex" alignItems="center" justifyContent="center">
      <Box padding="space40" width="400px">
        {children}
      </Box>
    </Box>
  );
};

export default CenterLayout;
