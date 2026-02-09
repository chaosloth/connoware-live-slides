"use client";

import { useState, useEffect } from "react";
import { State, useSyncClient } from "../context/Sync";
import { Heading } from "@twilio-paste/core/heading";

import { Box, Spinner, Stack } from "@twilio-paste/core";
import LogoHeader from "@/components/LogoHeader";
import { GenericEvent } from "@/types/EventTypes";
import HighlightedResponse from "@/components/HighlightedResponse";

type PositionedEvent = GenericEvent & {
  id: string;
  x: number;
  y: number;
  isRecent: boolean;
  isHighlighted: boolean;
};

// Function to generate random position that keeps element visible
const getRandomPosition = (containerWidth: number, containerHeight: number) => {
  // More accurate element dimensions based on HighlightedResponse component
  // Highlighted: 410px x 95px, Non-highlighted: ~350px x ~100px
  // With 120% scaling: ~492px x ~114px (max)
  const estimatedWidth = 450;
  const estimatedHeight = 120;

  // Small padding to keep elements from touching edges
  const padding = 10;

  // Calculate available space
  const availableWidth = containerWidth - estimatedWidth - (padding * 2);
  const availableHeight = containerHeight - estimatedHeight - (padding * 2);

  // Ensure we have positive ranges
  if (availableWidth <= 0 || availableHeight <= 0) {
    return { x: padding, y: padding };
  }

  // Generate random position within the full available space
  const x = Math.random() * availableWidth + padding;
  const y = Math.random() * availableHeight + padding;

  return { x, y };
};

export default function ResponsesPage() {
  const [pid, setPresentationId] = useState<string | undefined>();
  const { client, state } = useSyncClient();
  const [eventList, setEventList] = useState<PositionedEvent[]>([]);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  // Track window dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  /**
   * Get the presentation id
   */
  useEffect(() => {
    let localPid = localStorage.getItem("pid") || undefined;
    const searchParams = new URLSearchParams(document.location.search);

    if (searchParams.get("pid")) {
      localPid = searchParams.get("pid") || localPid;
      console.log(`Setting presentation id from search params [${localPid}]`);
    }

    if (!localPid) {
      console.warn(`No PID passed in or found`);
      return;
    }

    localStorage.setItem("pid", localPid);
    setPresentationId(localPid);
  }, []);

  /**
   * Subscribe to stream and handle new events
   */
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
            const position = getRandomPosition(dimensions.width, dimensions.height);
            const eventData = data.message.data as GenericEvent;
            const newEvent: PositionedEvent = {
              ...eventData,
              timestamp: eventData.timestamp || new Date().toLocaleTimeString("en-US"),
              id: `${Date.now()}-${Math.random()}`,
              x: position.x,
              y: position.y,
              isRecent: true,
              isHighlighted: true,
            };

            setEventList((prevEventList) => {
              // Mark all previous events as not recent and not highlighted
              const updatedList = prevEventList.map(event => ({
                ...event,
                isRecent: false,
                isHighlighted: false,
              }));
              return [newEvent, ...updatedList];
            });

            // After 3 seconds, mark the event as no longer recent or highlighted
            setTimeout(() => {
              setEventList((prevList) =>
                prevList.map((event) =>
                  event.id === newEvent.id
                    ? { ...event, isRecent: false, isHighlighted: false }
                    : event
                )
              );
            }, 3000);
          }
        });
      });
  }, [client, pid, dimensions]);

  /**
   * Monitor Sync state
   */
  useEffect(() => {
    if (state === State.Initializing || state === State.Ready) return;
    console.log(`Sync state error - state is [${state}]`);
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
    <>
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(10px, -8px) scale(1);
          }
          50% {
            transform: translate(-8px, 10px) scale(1);
          }
          75% {
            transform: translate(8px, 5px) scale(1);
          }
        }
        @keyframes floatRecent {
          0%, 100% {
            transform: translate(0, 0) scale(1.2);
          }
          25% {
            transform: translate(10px, -8px) scale(1.2);
          }
          50% {
            transform: translate(-8px, 10px) scale(1.2);
          }
          75% {
            transform: translate(8px, 5px) scale(1.2);
          }
        }
      `}</style>
      <Box
        position="fixed"
        top={0}
        left={0}
        width="100vw"
        height="100vh"
        overflow="hidden"
        style={{
          backgroundColor: "#000000",
        }}
      >
        {eventList.map((event, index) => (
          <Box
            key={event.id}
            position="absolute"
            style={{
              left: `${event.x}px`,
              top: `${event.y}px`,
              opacity: event.isRecent ? 1 : 0.6,
              transition: "opacity 300ms ease-in-out",
              zIndex: event.isRecent ? 1000 : 1,
              animationName: event.isRecent ? "floatRecent" : "float",
              animationDuration: "8s",
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: `${(index * 0.5) % 4}s`,
            }}
          >
            {event.isHighlighted ? (
              <HighlightedResponse event={event} highlight={true} />
            ) : (
              <Box
                padding="space50"
                backgroundColor="colorBackgroundBody"
                borderRadius="borderRadius70"
                borderStyle="solid"
                borderWidth="borderWidth20"
                borderColor="colorBorder"
                minWidth="300px"
              >
                <HighlightedResponse event={event} highlight={false} />
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </>
  );
}
