"use client";

import React, { useState, useEffect } from "react";
import { State, useSyncClient } from "../context/Sync";
import { Phase } from "../../types/Phases";
import { Box } from "@twilio-paste/core/box";
import { Heading } from "@twilio-paste/core/heading";
import LiveSlidesService from "../../utils/LiveSlidesService";

export default function PresenterPage() {
  const [phase, setPhase] = useState<Phase>(Phase.Welcome);
  const [pid, setPresentationId] = useState<string | undefined>();
  const [sid, setSlideId] = useState<string | undefined>();
  const { client, state } = useSyncClient();

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

  return (
    <Box>
      <Heading as={"div"} variant={"heading10"}>
        Presenter View
      </Heading>
    </Box>
  );
}
