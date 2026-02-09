"use client";

import React, { useState, useEffect } from "react";
import { useSyncClient } from "../context/Sync";
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
  Spinner,
  Stack,
} from "@twilio-paste/core";
import LogoHeader from "@/components/LogoHeader";

export type TallyEvent = {
  sid: string;
  type: string;
  answer: string;
  client_id: string;
  timestamp: string;
};

export default function PresenterPage() {
  const [pid, setPresentationId] = useState<string | undefined>();
  const { client } = useSyncClient();
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
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
      >
        <Stack orientation={"vertical"} spacing={"space40"}>
          <Heading as={"div"} variant={"heading10"}>
            Waiting for responses
          </Heading>
          <Box display="flex" justifyContent="center">
            <Spinner
              decorative={true}
              size={"sizeIcon110"}
              color={!client ? "colorTextBrand" : "colorTextDestructive"}
            />
          </Box>
          <Box>Powered by</Box>
          <LogoHeader />
        </Stack>
      </Box>
    );

  return (
    <Box display="flex" justifyContent="center" minHeight="100vh">
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
                <>
                  Someone said{" "}
                  <Text as={"span"} fontWeight={"fontWeightBold"}>
                    {event.answer}
                  </Text>
                </>
              }
              person={event.client_id}
              timestamp={event.timestamp}
            />
          ))}
        </ChatLog>
      </Box>
    </Box>
  );
}
