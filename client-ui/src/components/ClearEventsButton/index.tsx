"use client";
import React from "react";
import { Button } from "@twilio-paste/core/button";
import { Box } from "@twilio-paste/core/box";
import { DeleteIcon } from "@twilio-paste/icons/esm/DeleteIcon";
import { Tooltip } from "@twilio-paste/core/tooltip";

interface ClearEventsButtonProps {
  onClear: () => void;
}

const ClearEventsButton: React.FC<ClearEventsButtonProps> = ({ onClear }) => {
  return (
    <Box
      position="fixed"
      bottom="space60"
      right="space60"
      zIndex="zIndex90"
    >
      <Tooltip text="Clear all events" placement="top">
        <Button
          variant="destructive"
          size="circle"
          onClick={onClear}
        >
          <DeleteIcon decorative={false} title="Clear events" />
        </Button>
      </Tooltip>
    </Box>
  );
};

export default ClearEventsButton;