"use client";

import { useState, useEffect } from "react";
import useWindowFocus from "use-window-focus";
import { Phase } from "@/types/Phases";
import CenterLayout from "@/components/CenterLayout";
import WelcomeCard from "@/components/WelcomeCard";
import ErrorCard from "@/components/ErrorCard";
import {
  Action,
  CurrentState,
  LiveSlidePresentation,
  Slide,
} from "@/types/LiveSlides";
import DynamicCardWrapper from "@/components/DynamicCardWrapper";
import { State, useSyncClient } from "@/app/context/Sync";
import { useAnalytics } from "@/app/context/Analytics";

export default function Home() {
  const [phase, setPhase] = useState<Phase>(Phase.Welcome);
  const [currentSlide, setCurrentSlide] = useState<Slide>();
  const [presentationState, setCurrentState] = useState<CurrentState>();
  const [pid, setPresentationId] = useState<string | undefined>();
  const [presentation, setPresentation] = useState<LiveSlidePresentation>();

  const windowFocused = useWindowFocus();
  const { client, identity, state } = useSyncClient();
  const analytics = useAnalytics();

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";

  /**
   *
   * Get the presentation id
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
    console.log(`Using pid [${localPid}]`);
  }, []);

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

  /**
   *
   * Detect focus on app
   *
   */
  useEffect(() => {
    if (!identity || identity === "") return;
    const controller = new AbortController();
    const signal = controller.signal;

    //TODO: Let app know that we've changed focus, need to pass client ID
    fetch(
      `${BASE_URL}/api/focus?windowFocused=${windowFocused}&identity=${identity}&ts=${Date.now()}`
    )
      .then((response) => response.json())
      // .then((data) => console.log(`Focus changed`, data))
      .catch((err) =>
        console.log(`Error sending focus event [${windowFocused}]`, err)
      );
    return () => {
      // cancel the request before component unmounts
      controller.abort();
    };
  }, [windowFocused, identity, BASE_URL]);

  /**
   *
   * Subscribe to updates on main doc
   *
   */
  useEffect(() => {
    if (!client) return;
    if (!pid) return;

    const presentationDefinitionDoc = `PRESENTATION-${pid}`;
    console.log(
      `Creating subscription to document ${presentationDefinitionDoc}`
    );

    // Create a subscription to the document
    client.document(presentationDefinitionDoc).then((doc) => {
      console.log("SYNC presentation definition retrieved", doc.data);
      if (doc) setPresentation(doc.data as LiveSlidePresentation);

      doc.on("updated", (event) => {
        if (event) setPresentation(event.data as LiveSlidePresentation);
        console.log("SYNC presentation definition updated", event.data);
      });
    });

    const presentationStateDoc = `STATE-${pid}`;
    console.log(`Creating subscription to document ${presentationStateDoc}`);

    client.document(presentationStateDoc).then((doc) => {
      console.log("SYNC presentation state retrieved", doc.data);
      if (doc) setCurrentState(doc.data as CurrentState);

      doc.on("updated", (event) => {
        if (event) setCurrentState(event.data as CurrentState);
        console.log("SYNC presentation state updated", event.data);
      });
    });
  }, [client, pid]);

  /**
   *
   * Set phase based on current state
   *
   */
  useEffect(() => {
    if (!presentationState) return;
    let targetSlide = presentation?.slides.find(
      (p) => p.id === presentationState.currentSlideId
    );

    if (!targetSlide) return;

    if (targetSlide.kind) {
      console.log(`Setting phase to [${targetSlide.kind}]`, targetSlide);
      setCurrentSlide(targetSlide);
      setPhase(Phase[targetSlide.kind]);
    }
  }, [presentationState?.currentSlideId]);

  /**
   *
   * Perform the actions in response to user activity
   *
   */
  const performActions = (actions: Action[]) => {
    console.log(`Performing [${actions.length}] actions`);

    actions.map((action) => {
      switch (action.type) {
        case "slide":
          let targetSlide = presentation?.slides.find(
            (p) => p.id === action.slide
          );
          if (!targetSlide) return;
          setCurrentSlide(targetSlide);
          setPhase(Phase[targetSlide.kind]);
          return;
        case "track":
          console.log(`Track users activity`, action);
          //TODO: Add Segment tracking
          analytics.track(action.event, {
            ...action.properties,
          });

          return;
        case "identify":
          console.log(`Track users activity`, action);
          //TODO: Add Segment tracking
          analytics.identify(identity, action.properties);
          return;
        case "url":
          window.open(action.url);
          return;
      }
    });
  };

  /**
   *
   * Return the component fot the current phase
   *
   */
  const getComponentForError = () => {
    switch (state) {
      case State.ErrorNoToken:
        return (
          <ErrorCard
            title="Let's try that again..."
            emphasis="Please scan the QR code again. "
            message="Best thing about COVID-19 is that we all know how now!"
            showReloadButton={true}
          />
        );
      case State.ErrorTokeExpired:
        return (
          <ErrorCard
            title="Let's try that again..."
            emphasis="Session expired"
            message="Please reload the app to continue"
            showReloadButton={true}
          />
        );
      default:
        return (
          <ErrorCard
            title="Nothing to see here..."
            emphasis="Please scan the QR code again. "
            message="If symptoms persists for more than 4 hours consult a doctor!"
          />
        );
    }
  };

  /**
   *
   * Return the component fot the current phase
   *
   */
  const getComponentForPhase = () => {
    switch (phase) {
      case Phase.Welcome:
        return <WelcomeCard />;
      case Phase.Question:
      case Phase.Submitted:
      case Phase.WatchPresenter:
      case Phase.Identify:
      case Phase.DemoCta:
      case Phase.WebRtc:
        return (
          <DynamicCardWrapper
            slide={currentSlide}
            performActions={performActions}
          />
        );
      case Phase.ErrorSync:
        return getComponentForError();
      default:
        return (
          <ErrorCard
            title="Nothing to see here..."
            emphasis="Please scan the QR code again. "
            message="If symptoms persists for more than 4 hours consult a doctor!"
          />
        );
    }
  };

  return <CenterLayout>{getComponentForPhase()}</CenterLayout>;
}
