import { Button } from "@twilio-paste/core/button";
import { Card } from "@twilio-paste/core/card";
import { Heading } from "@twilio-paste/core/heading";
import { Stack } from "@twilio-paste/core/stack";
import { Flex } from "@twilio-paste/core/flex";
import { FC } from "react";
import React from "react";

export interface SlideListEmptyProps {
  handleNewSlide: () => void;
}

const SlideListEmpty: FC<SlideListEmptyProps> = (props) => {
  return (
    <Card padding={"space150"}>
      <Flex hAlignContent={"center"}>
        <Stack orientation={"vertical"} spacing={"space70"}>
          <Flex hAlignContent={"center"}>
            <Heading as="h2" variant="heading20" marginBottom="space0">
              🍭 Let's create your first slide
            </Heading>
          </Flex>
          <Flex hAlignContent={"center"}>
            You can put messages, content that matches your narrative or
            real-time demos in slides.
          </Flex>
          <Flex hAlignContent={"center"}>
            <Button variant="primary" onClick={props.handleNewSlide}>
              ✨ Create Slide
            </Button>
          </Flex>
        </Stack>
      </Flex>
    </Card>
  );
};
export default SlideListEmpty;
