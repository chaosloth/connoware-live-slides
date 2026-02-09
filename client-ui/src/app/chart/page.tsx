"use client";

import { useState, useEffect, useRef } from "react";
import { State, useSyncClient } from "../context/Sync";
import { Heading } from "@twilio-paste/core/heading";

import { Box, Spinner, Stack } from "@twilio-paste/core";
import LogoHeader from "@/components/LogoHeader";
import { GenericEvent } from "@/types/EventTypes";
import BubbleChart, { BubbleData } from "@/components/BubbleChart";

export default function ChartPage() {
  const [pid, setPresentationId] = useState<string | undefined>();
  const { client, state } = useSyncClient();
  const [eventList, setEventList] = useState<GenericEvent[]>([]);
  const [chartData, setChartData] = useState<BubbleData[]>([]);
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
  const eventBuffer = useRef<GenericEvent[]>([]); // Buffer for incoming events

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
   * Subscribe to stream and buffer new events
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
            // Add to buffer instead of immediately updating state
            eventBuffer.current.push({
              ...data.message.data,
              timestamp: new Date().toLocaleTimeString("en-US"),
            } as GenericEvent);
          }
        });
      });
  }, [client, pid]);

  /**
   * Process buffered events every second
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (eventBuffer.current.length > 0) {
        // Move buffered events to main event list
        const buffered = eventBuffer.current.splice(0, eventBuffer.current.length);
        setEventList((prevEventList) => [
          ...buffered,
          ...prevEventList,
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Tally responses and update chart data
   */
  useEffect(() => {
    if (eventList.length === 0) {
      setChartData([]);
      return;
    }

    // Tally responses by answer
    const tally: Record<string, number> = {};

    eventList.forEach((event) => {
      if (event.type === "Tally") {
        const answer = event.answer || "Other";
        tally[answer] = (tally[answer] || 0) + 1;
      }
    });

    // Convert tally to chart data format
    const data: BubbleData[] = Object.entries(tally).map(([label, value]) => ({
      label,
      value,
    }));

    setChartData(data);
  }, [eventList]);

  /**
   * Monitor Sync state
   */
  useEffect(() => {
    if (state === State.Initializing || state === State.Ready) return;
    console.log(`Sync state error - state is [${state}]`);
  }, [state]);

  if (!client || chartData.length === 0)
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

  // Calculate total responses
  const totalResponses = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      style={{ backgroundColor: "#000000" }}
    >
      {/* Total count in top left corner */}
      <Box
        position="absolute"
        top={0}
        left={0}
        style={{
          padding: "20px",
          color: "#ffffff",
          fontSize: "24px",
          fontWeight: "bold",
          zIndex: 1000,
        }}
      >
        Total: {totalResponses}
      </Box>

      {/* Full screen bubble chart */}
      <BubbleChart
        data={chartData}
        width={dimensions.width}
        height={dimensions.height}
        maxBubbleSize={250}
        minBubbleSize={80}
      />
    </Box>
  );
}
