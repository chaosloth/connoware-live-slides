"use client";

import React, { useState, useEffect } from "react";
import { useSyncClient } from "../context/Sync";
import { Phase } from "../../types/Phases";
import { Heading } from "@twilio-paste/core/heading";
import Image from "next/image";

import { Box, Flex, Stack } from "@twilio-paste/core";
import LiveSlidesService from "@/utils/LiveSlidesService";
import LogoHeader from "@/components/LogoHeader";
import demoReady from "../../../public/demo_ready.svg";

export default function PresenterPage() {
  const [phase, setPhase] = useState<Phase>(Phase.Welcome);
  const [pid, setPresentationId] = useState<string | undefined>();
  const [sid, setSlideId] = useState<string | undefined>();
  const { client } = useSyncClient();

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

  const CenteredComponent = ({ children }: { children: React.ReactNode }) => {
    return (
      <Flex hAlignContent="center" vAlignContent="center" height="100%">
        {children}
      </Flex>
    );
  };

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
            Take a look at your phone
          </Heading>
          <Flex hAlignContent={"center"}>
            <Image src={demoReady} alt={"DEmo"} priority={true} />
          </Flex>
          Powered by
          <LogoHeader />
        </Stack>
      </Box>
    </CenteredComponent>
  );
}
