"use client";

import React, { useState, useEffect, useCallback } from "react";
import { State, useSyncClient } from "../context/Sync";
import { Phase } from "../../types/Phases";
import { Text } from "@twilio-paste/core/text";
import { Heading } from "@twilio-paste/core/heading";

import {
  Avatar,
  Box,
  ChatBubble,
  ChatLog,
  ChatMessage,
  ChatMessageMeta,
  ChatMessageMetaItem,
  Flex,
  Spinner,
  Stack,
} from "@twilio-paste/core";
import LiveSlidesService from "@/utils/LiveSlidesService";
import LogoHeader from "@/components/LogoHeader";

export type TallyEvent = {
  sid: string;
  type: string;
  answer: string;
  client_id: string;
  timestamp: string;
};

type ChartData = { label: string; value: number; isEmpty: boolean };

export default function PresenterPage() {
  const [phase, setPhase] = useState<Phase>(Phase.Welcome);
  const [pid, setPresentationId] = useState<string | undefined>();
  const { client, state } = useSyncClient();
  const [eventList, setEventList] = useState<TallyEvent[]>([]);

  /**
   *
   * Get the presentation id, slide id
   *
   */
  useEffect(() => {
    // Get presentation ID from local storage
    let localPid = localStorage.getItem("pid") || undefined;

    // Parse pid query parameter (optional)
    const searchParams = new URLSearchParams(document.location.search);

    if (searchParams.get("pid")) {
      localPid = searchParams.get("pid") || localPid;
      console.log(`Setting presentation id from search params [${localPid}]`);
    }

    if (!localPid) {
      console.warn(`No PID passed in or found`);
      setPhase(Phase.ErrorNoPid);
      return;
    }

    // Set the local pid
    localStorage.setItem("pid", localPid);
    setPresentationId(localPid);
  }, []);

  useEffect(() => {
    if (!client) return;
    if (!pid) return;

    console.log(`Connecting to stream STREAM-${pid}`);
    client
      .stream({
        id: `STREAM-${pid}`,
        mode: "open_or_create",
      })
      .then((stream) => {
        stream.on("messagePublished", (data) => {
          console.log(`New stream STREAM-${pid} data`, data);
          if (data) {
            setEventList((prevEventList) => [
              {
                ...data.message.data,
                timestamp: new Date().toLocaleTimeString("en-US"),
              } as TallyEvent,
              ...prevEventList,
            ]);
          }
        });
      });
  }, [client, pid]);

  /**
   *
   * Monitor Sync state
   *
   */
  useEffect(() => {
    if (state === State.Initializing || state === State.Ready) return;
    console.log(`Setting ErrorSync - state is [${state}]`);
    setPhase(Phase.ErrorSync);
  }, [state]);

  const CenteredComponent = ({ children }: { children: React.ReactNode }) => {
    return (
      <Flex hAlignContent="center" vAlignContent="center" height="100%">
        {children}
      </Flex>
    );
  };

  type MessageWithMetaProps = {
    message: React.ReactNode;
    person: string;
    timestamp?: string;
  };
  const MessageWithMeta: React.FC<MessageWithMetaProps> = (props) => {
    return (
      <ChatMessage variant="inbound">
        <ChatBubble>{props.message}</ChatBubble>
        <ChatMessageMeta aria-label={`said by ${props.person}`}>
          <ChatMessageMetaItem>
            <Avatar name={props.person} size="sizeIcon20" />
            {props.person} - {props.timestamp}
          </ChatMessageMetaItem>
        </ChatMessageMeta>
      </ChatMessage>
    );
  };

  if (!client || eventList.length === 0)
    return (
      <CenteredComponent>
        <Box
          height={"100vh"}
          alignContent={"center"}
          alignItems={"center"}
          textAlign={"center"}
        >
          <Stack orientation={"vertical"} spacing={"space40"}>
            <Heading as={"div"} variant={"heading10"}>
              Waiting for responses
            </Heading>
            <Flex hAlignContent={"center"}>
              <Spinner
                decorative={true}
                size={"sizeIcon110"}
                color={!client ? "colorTextBrand" : "colorTextDestructive"}
              />
            </Flex>
            Powered by
            <LogoHeader />
          </Stack>
        </Box>
      </CenteredComponent>
    );

  return (
    <CenteredComponent>
      <Flex vertical vAlignContent={"bottom"}>
        <Box
          minWidth={"400px"}
          display="flex"
          flexDirection="column"
          paddingY="space120"
          paddingX="space100"
          borderRadius="borderRadius30"
          borderBottomColor={"colorBorder"}
          borderStyle={"dashed"}
          overflow={"scroll"}
        >
          <Heading as={"div"} variant={"heading30"}>
            Responses
          </Heading>
          <ChatLog>
            {eventList.map((event, idx) => (
              <MessageWithMeta
                key={idx}
                message={
                  `Someone chose ` && (
                    <>
                      Someone said{" "}
                      <Text as={"span"} fontWeight={"fontWeightBold"}>
                        {event.answer}
                      </Text>
                    </>
                  )
                }
                person={event.client_id}
                timestamp={event.timestamp}
              />
            ))}
          </ChatLog>
        </Box>
      </Flex>
    </CenteredComponent>
  );
}
