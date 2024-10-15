"use client";
import { GenericEvent, TallyEvent } from "@/types/EventTypes";
import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  ChatBubble,
  ChatLog,
  ChatMessage,
  ChatMessageMeta,
  ChatMessageMetaItem,
  Flex,
  MediaBody,
  MediaFigure,
  MediaObject,
  Spinner,
  Stack,
  Text,
} from "@twilio-paste/core";
import IconForEvent from "../IconForEvent";

export type HighlightedResponseProps = {
  highlight: boolean;
  event: GenericEvent;
};

type MessageWithMetaProps = {
  message: React.ReactNode;
  person: string;
  timestamp?: string;
};
const MessageWithMeta: React.FC<MessageWithMetaProps> = (props) => {
  return (
    <ChatMessage variant="inbound">
      <Box marginBottom={"space20"}>
        <Text as={"span"} fontSize={"fontSize40"}>
          {" "}
          {props.message}
        </Text>
      </Box>
      <ChatMessageMeta aria-label={`said by ${props.person}`}>
        <ChatMessageMetaItem>
          <Avatar name={props.person} size="sizeIcon20" />
          {props.person} - {props.timestamp}
        </ChatMessageMetaItem>
      </ChatMessageMeta>
    </ChatMessage>
  );
};

type MakeEntryForEventProps = {
  event: GenericEvent;
};

const MakeEntryForEvent: React.FC<MakeEntryForEventProps> = (props) => {
  switch (props.event.type) {
    case "Tally":
      return (
        <MessageWithMeta
          message={
            <>
              Someone said{" "}
              <Text
                as={"span"}
                fontWeight={"fontWeightBold"}
                fontSize={"fontSize40"}
              >
                {props.event.answer}
              </Text>
            </>
          }
          person={props.event.client_id}
          timestamp={props.event.timestamp}
        />
      );

    case "Stream":
      return (
        <MessageWithMeta
          message={
            <Text
              as={"span"}
              fontWeight={"fontWeightBold"}
              fontSize={"fontSize40"}
            >
              {props.event.message}
            </Text>
          }
          person={props.event.client_id}
          timestamp={props.event.timestamp}
        />
      );
    default:
      return <></>;
  }
};

const HighlightedResponse: React.FC<HighlightedResponseProps> = (props) => {
  if (!props.highlight)
    return (
      <Box paddingLeft={"space70"}>
        <MakeEntryForEvent event={props.event} />
      </Box>
    );

  return (
    <Box
      style={{
        boxShadow: "0px 0px 10px 10px #A82FF22F",
        background:
          "linear-gradient(35deg, #FFFF 0%, #F22F46 40%, #A82FF2 100%)",
      }}
      height={"95px"}
      width={"410px"}
      borderRadius={"borderRadius70"}
      alignContent={"center"}
      justifyContent={"center"}
      display={"grid"}
    >
      <Box
        paddingLeft={"space50"}
        paddingRight={"space50"}
        borderStyle={"none"}
        borderWidth={"borderWidth30"}
        borderRadius={"borderRadius60"}
        height={"85px"}
        width={"400px"}
        alignContent={"center"}
        justifyContent={"center"}
        backgroundColor={"colorBackgroundBodyInverse"}
        cursor={"pointer"}
      >
        <MediaObject as="div" verticalAlign="center">
          <MediaBody as="div">
            <MakeEntryForEvent event={props.event} />
          </MediaBody>
          <MediaFigure as="div" align="end" spacing="space40">
            {props.event.type === "Tally" && (
              <IconForEvent event={props.event} />
            )}
          </MediaFigure>
        </MediaObject>
      </Box>
    </Box>
  );
};

export default HighlightedResponse;
