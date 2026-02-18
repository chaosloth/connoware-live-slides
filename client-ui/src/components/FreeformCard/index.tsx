"use client";
import React, { useState } from "react";

import { Stack } from "@twilio-paste/core/stack";
import { Card } from "@twilio-paste/core/card";
import { Heading } from "@twilio-paste/core/heading";
import { Paragraph } from "@twilio-paste/core/paragraph";
import { Button } from "@twilio-paste/core/button";
import { TextArea } from "@twilio-paste/core/textarea";
import { Label } from "@twilio-paste/core/label";
import { FormControl } from "@twilio-paste/core/form";

import { FC } from "react";

import LogoHeader from "../LogoHeader";
import { FreeformSlide, Action } from "@/types/LiveSlides";

export type FreeformCardProps = {
  data: FreeformSlide;
  performActions: (
    actions: Action[],
    properties?: { [key: string]: any }
  ) => void;
};

const FreeformCard: FC<FreeformCardProps> = (props: FreeformCardProps) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [complete, setComplete] = useState<boolean>(false);

  const handleSubmit = () => {
    if (!inputValue.trim()) return;

    setComplete(true);
    props.performActions(props.data.afterSubmitActions, {
      response: inputValue
    });
  };

  return (
    <Card>
      <LogoHeader />
      <Heading as={"div"} variant={"heading20"}>
        {props.data.title}
      </Heading>
      {props.data.description && <Paragraph>{props.data.description}</Paragraph>}

      <Stack orientation={"vertical"} spacing={"space50"}>
        <FormControl>
          <Label htmlFor="freeform-input">
            {props.data.prompt || "Your response"}
          </Label>
          <TextArea
            id="freeform-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={props.data.placeholder || "Enter your response..."}
            disabled={complete}
            rows={4}
          />
        </FormControl>

        <Button
          variant="primary"
          fullWidth={true}
          onClick={handleSubmit}
          disabled={complete || !inputValue.trim()}
        >
          {props.data.submitButtonLabel || "Submit"}
        </Button>
      </Stack>
    </Card>
  );
};

export default FreeformCard;
