"use client";

import React, { useState, useEffect } from "react";
import { State, useSyncClient } from "../context/Sync";
import { Phase } from "../../types/Phases";
import { Heading } from "@twilio-paste/core/heading";

import { Box, ChatLog, Spinner, Stack } from "@twilio-paste/core";
import LogoHeader from "@/components/LogoHeader";
import { GenericEvent } from "@/types/EventTypes";
import HighlightedResponse from "@/components/HighlightedResponse";
import Image from "next/image";
import LeftPathImage from "@/icons/Left Path.svg";
import RightPathImage from "@/icons/Right Path.svg";

export default function PresenterPage() {
  const [phase, setPhase] = useState<Phase>(Phase.Welcome);
  const [pid, setPresentationId] = useState<string | undefined>();
  const { client, state } = useSyncClient();
  const [eventList, setEventList] = useState<GenericEvent[]>([]);

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
              } as GenericEvent,
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
      <Box>
        <Box
          minWidth={"400px"}
          display="flex"
          flexDirection="column"
          paddingY="space120"
          paddingX="space100"
          borderRadius="borderRadius30"
          borderBottomColor={"colorBorder"}
          borderStyle={"none"}
          overflow={"scroll"}
        >
          <Box paddingLeft={"space120"}>
            <Heading as={"div"} variant={"heading10"}>
              Responses
            </Heading>
          </Box>

          <ChatLog>
            {eventList.map((event, idx) => (
              <HighlightedResponse
                key={`entry-${idx}`}
                event={event}
                highlight={idx === 1 ? true : false}
              />
            ))}
          </ChatLog>
        </Box>
      </Box>
    </Box>
  );
}
