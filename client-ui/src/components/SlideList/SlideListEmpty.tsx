import { Button } from "@twilio-paste/core/button";
import { Card } from "@twilio-paste/core/card";
import { Heading } from "@twilio-paste/core/heading";
import { Stack } from "@twilio-paste/core/stack";
import { Box } from "@twilio-paste/core/box";
import { FC } from "react";
import React from "react";

export interface SlideListEmptyProps {
  handleNewSlide: () => void;
}

const SlideListEmpty: FC<SlideListEmptyProps> = (props) => {
  return (
    <Card padding={"space150"}>
      <Box display="flex" justifyContent="center">
        <Stack orientation={"vertical"} spacing={"space70"}>
          <Box display="flex" justifyContent="center">
            <Heading as="h2" variant="heading20" marginBottom="space0">
              {"🍭 Let's create your first slide"}
            </Heading>
          </Box>
          <Box display="flex" justifyContent="center" textAlign="center">
            You can put messages, content that matches your narrative or
            real-time demos in slides.
          </Box>
          <Box display="flex" justifyContent="center">
            <Button variant="primary" onClick={props.handleNewSlide}>
              ✨ Create Slide
            </Button>
          </Box>
        </Stack>
      </Box>
    </Card>
  );
};
export default SlideListEmpty;
