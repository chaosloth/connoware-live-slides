"use client";
import React, { useState } from "react";
import Image from "next/image";

import { Alert } from "@twilio-paste/core/alert";
import { Card } from "@twilio-paste/core/card";
import { Flex } from "@twilio-paste/core/flex";
import { Heading } from "@twilio-paste/core/heading";

import { FC } from "react";

import errorIcon from "@/icons/error.svg";

import LogoHeader from "../LogoHeader";
import { Button } from "@twilio-paste/core/button";
import { Spinner, Stack } from "@twilio-paste/core";

export type ErrorCardProps = {
  title: string;
  emphasis: string;
  message: string;
  showReloadButton?: boolean;
};

const ErrorCard: FC<ErrorCardProps> = (props: ErrorCardProps) => {
  const [processing, setProcessing] = useState<boolean>(false);
  return (
    <Card>
      <LogoHeader />
      <Heading as={"div"} variant={"heading20"}>
        {props.title}
      </Heading>
      <Stack orientation={"vertical"} spacing={"space40"}>
        <Flex hAlignContent="center" vertical>
          <Image src={errorIcon} alt={"Error"} priority={true} />
        </Flex>
        <Alert variant="error">
          <strong>{props.emphasis}</strong>
          {" " + props.message}
        </Alert>
        {props.showReloadButton && props.showReloadButton === true && (
          <Button
            disabled={processing}
            variant="primary"
            fullWidth={true}
            onClick={() => {
              setProcessing(true);
              window.location.reload();
            }}
          >
            Tap here to reload
            {processing && <Spinner decorative={true} />}
          </Button>
        )}
      </Stack>
    </Card>
  );
};

export default ErrorCard;
