"use client";

import React, { useState, useEffect, useCallback } from "react";
import { State, useSyncClient } from "../context/Sync";
import { Phase } from "../../types/Phases";
import { Text } from "@twilio-paste/core/text";
import { Heading } from "@twilio-paste/core/heading";
import DonutChart from "@/components/DonutChart";

import {
  Avatar,
  Box,
  ChatBubble,
  ChatLog,
  ChatMessage,
  ChatMessageMeta,
  ChatMessageMetaItem,
  Column,
  Flex,
  Grid,
  Spinner,
  Stack,
} from "@twilio-paste/core";
import LiveSlidesService from "@/utils/LiveSlidesService";
import LogoHeader from "@/components/LogoHeader";

function getWindowDimensions() {
  if (!global || !global.window)
    return {
      width: 750,
      height: 500,
    };
  const { innerWidth: width, innerHeight: height } = global.window;
  return {
    width,
    height,
  };
}

export type TallyEvent = {
  sid: string;
  type: string;
  answer: string;
  client_id: string;
};

type ChartData = { label: string; value: number; isEmpty: boolean };

export default function PresenterPage() {
  const [phase, setPhase] = useState<Phase>(Phase.Welcome);
  const [pid, setPresentationId] = useState<string | undefined>();
  const [sid, setSlideId] = useState<string | undefined>();
  const { client, state } = useSyncClient();
  const [eventList, setEventList] = useState<TallyEvent[]>([]);
  const [tallyData, setTallyData] = useState<ChartData[]>([
    { label: "TBD", value: 0, isEmpty: true },
  ]);

  /**
   *
   * Get the presentation id, slide id
   *
   */
  useEffect(() => {
    // Get presentation ID from local storage
    let localPid = localStorage.getItem("pid") || undefined;
    let localSid = localStorage.getItem("sid") || undefined;

    // Parse pid query parameter (optional)
    const searchParams = new URLSearchParams(document.location.search);

    if (searchParams.get("pid")) {
      localPid = searchParams.get("pid") || localPid;
      console.log(`Setting presentation id from search params [${localPid}]`);
    }

    if (searchParams.get("sid")) {
      localSid = searchParams.get("sid") || localSid;
      console.log(`Setting slide id from search params [${localSid}]`);
    }

    if (!localPid) {
      console.warn(`No PID passed in or found`);
      setPhase(Phase.ErrorNoPid);
      return;
    }

    if (!localSid) {
      console.warn(`No SID passed in or found`);
      setPhase(Phase.ErrorNoSid);
      return;
    }
    // Set the local pid
    localStorage.setItem("pid", localPid);
    localStorage.setItem("sid", localSid);
    setPresentationId(localPid);
    setSlideId(localSid);
    console.log(`Using pid [${localPid}] and sid [${localSid}]`);
  }, []);

  useEffect(() => {
    if (!client) return;
    if (!pid) return;
    if (!sid) return;

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
              data.message.data as TallyEvent,
              ...prevEventList,
            ]);
          }
        });
      });
  }, [client, pid, sid]);

  /**
   *
   * Activate Slide
   *
   */
  useEffect(() => {
    if (!client) return;
    if (!pid) return;
    if (!sid) return;

    LiveSlidesService.activateSlideInPresentation(client, pid, sid)
      .then(() =>
        console.log(
          `[Presenter] Updated presentation ${pid} state to slide ${sid}`
        )
      )
      .catch((err) =>
        console.log(`Something went wrong update presentation site`, err)
      );
  }, [client, pid, sid]);

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

  /*
   *
   * Make Tally of Data
   *
   */
  const sumAnswers = useCallback(() => {
    const tally: { [key: string]: number } = {};

    eventList.forEach((event) => {
      const answer = event.answer;
      if (tally[answer]) {
        tally[answer] += 1;
      } else {
        tally[answer] = 1;
      }
    });

    console.log(`Sum Answers`, tally);

    return tally;
  }, [eventList]);

  useEffect(() => {
    const answers = sumAnswers();
    const data: ChartData[] = [];
    Object.keys(answers).forEach((key) => {
      const tallyItem = {
        label: key,
        value: answers[key],
        isEmpty: answers[key] === 0 ? true : false,
      };
      data.push(tallyItem);
    });

    setTallyData(data);
    console.log(`Setting chart data`, data);
  }, [sumAnswers]);

  function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(
      getWindowDimensions()
    );

    useEffect(() => {
      function handleResize() {
        setWindowDimensions(getWindowDimensions());
      }

      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowDimensions;
  }

  const { height, width } = useWindowDimensions();

  type MessageWithMetaProps = {
    message: React.ReactNode;
    person: string;
  };
  const MessageWithMeta: React.FC<MessageWithMetaProps> = (props) => {
    return (
      <ChatMessage variant="inbound">
        <ChatBubble>{props.message}</ChatBubble>
        <ChatMessageMeta aria-label={`said by ${props.person}`}>
          <ChatMessageMetaItem>
            <Avatar name={props.person} size="sizeIcon20" />
            {props.person}
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
    <Box minHeight="100vh">
      <Grid gutter="space0">
        <Column span={8} id="chart-col">
          <Box
            position={"relative"}
            alignContent={"center"}
            verticalAlign={"middle"}
          >
            <Box>
              <DonutChart
                data={tallyData}
                colors={["#F22F46", "#FFB37A", "#6D2ED1", "#36D576", "#008CFF"]}
                strokeColor="#CCCCCC"
                legend={true}
                interactive={false}
                width={width * 0.75}
                height={height}
              />
            </Box>
            <Box
              position={"absolute"}
              top={"30%"}
              width={"80%"}
              textAlign={"center"}
            >
              {/* <Box width={"100%"}>
                <Heading as={"div"} variant={"heading10"}>
                  {getMaxAnswer()}
                </Heading>
              </Box> */}
            </Box>
          </Box>
        </Column>
        <Column span={4}>
          <Flex vertical vAlignContent={"bottom"}>
            <Box
              minWidth={"400px"}
              display="flex"
              flexDirection="column"
              paddingY="space120"
              paddingX="space180"
              borderRadius="borderRadius30"
              borderBottomColor={"colorBorder"}
              borderStyle={"dashed"}
              overflow={"hidden"}
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
                  />
                ))}
              </ChatLog>
            </Box>
          </Flex>
        </Column>
      </Grid>
    </Box>
  );
}
