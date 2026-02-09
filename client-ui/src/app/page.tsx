"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import useWindowFocus from "use-window-focus";
import { AnalyticsBrowser } from "@segment/analytics-next";
import { Phase } from "@/types/Phases";
import CenterLayout from "@/components/CenterLayout";
import WelcomeCard from "@/components/WelcomeCard";
import ErrorCard from "@/components/ErrorCard";
import {
  CurrentState,
  LiveSlidePresentation,
  Slide,
} from "@/types/LiveSlides";
import DynamicCardWrapper from "@/components/DynamicCardWrapper";
import { AnalyticsProvider } from "@/app/context/Analytics";
import { State, useSyncClient } from "@/app/context/Sync";
import LiveSlidesService from "@/utils/LiveSlidesService";
import { SyncStream } from "twilio-sync";
import { useActionHandler } from "@/hooks/useActionHandler";
import { ErrorMessage } from "@/components/ErrorBoundary";

import bgImage from "../../public/2025_bg_3.svg";
import { Box } from "@twilio-paste/core";
import ReconnectingCard from "@/components/ReconnectingCard";

export default function Home() {
  const [phase, setPhase] = useState<Phase>(Phase.Welcome);
  const [currentSlide, setCurrentSlide] = useState<Slide>();
  const [presentationState, setCurrentState] = useState<CurrentState>();
  const [pid, setPresentationId] = useState<string | undefined>();
  const [presentation, setPresentation] = useState<LiveSlidePresentation>();
  const [error, setError] = useState<Error | null>(null);

  const windowFocused = useWindowFocus();
  const { client, identity, state } = useSyncClient();
  const [stream, setStream] = useState<SyncStream>();
  const [userData, setUserData] = useState<{ [key: string]: string }>({});

  /**
   *
   * Load WriteKey from presentation or global
   *
   */
  const analytics = useMemo(
    () =>
      AnalyticsBrowser.load({
        writeKey:
          presentation?.segmentWriteKey ||
          process.env.NEXT_PUBLIC_SEGMENT_API_KEY ||
          "",
      }),
    [presentation?.segmentWriteKey]
  );

  useEffect(() => {
    if (!presentation) return;
    if (!presentation.segmentWriteKey) return;
    console.log(
      `Setting Segment Write key to [${presentation.segmentWriteKey}]`
    );
    AnalyticsBrowser.load({ writeKey: presentation?.segmentWriteKey });
  }, [presentation, presentation?.segmentWriteKey]);

  // Initialize action handler with current state
  const handleSlideChange = useCallback((slide: Slide, phase: Phase) => {
    setCurrentSlide(slide);
    setPhase(phase);
  }, []);

  const handleUserDataChange = useCallback((data: { [key: string]: string }) => {
    setUserData(data);
  }, []);

  const { performActions, publishEventToStream } = useActionHandler({
    presentation,
    analytics,
    identity,
    userData,
    stream,
    onSlideChange: handleSlideChange,
    onUserDataChange: handleUserDataChange,
  });

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
   * Create stream
   *
   */
  useEffect(() => {
    if (!client) return;
    if (!pid) return;

    console.log(`[/] Creating sync connection`);
    client
      .stream({
        id: `STREAM-${pid}`,
        mode: "open_or_create",
      })
      .then((s) => {
        console.log(`Created sync stream [STREAM-${pid}]`);
        setStream(s);
        setError(null); // Clear any previous errors
      })
      .catch((err) => {
        console.error(`Error creating sync stream`, err);
        setError(new Error('Failed to connect to presentation stream'));
      });
  }, [client, pid]);


  /**
   *
   * Detect focus on app
   *
   */
  // useEffect(() => {
  //   if (!identity || identity === "") return;
  //   const controller = new AbortController();
  //   const signal = controller.signal;

  //   //TODO: Let app know that we've changed focus, need to pass client ID
  //   fetch(
  //     `${BASE_URL}/api/focus?windowFocused=${windowFocused}&identity=${identity}&ts=${Date.now()}`
  //   )
  //     .then((response) => response.json())
  //     // .then((data) => console.log(`Focus changed`, data))
  //     .catch((err) =>
  //       console.log(`Error sending focus event [${windowFocused}]`, err)
  //     );
  //   return () => {
  //     // cancel the request before component unmounts
  //     controller.abort();
  //   };
  // }, [windowFocused, identity, BASE_URL]);

  /**
   *
   * Subscribe to updates on main doc
   *
   */
  useEffect(() => {
    if (!client) return;
    if (!pid) return;

    console.log(`[/] Creating sync connection`);
    client.stream(`STREAM-${pid}`).then((s) => setStream(s));

    console.log(`[/] Fetching presentation definition`);

    LiveSlidesService.getPresentation(client, pid)
      .then((presentationSyncMapItem) => {
        console.log(
          `[/] Retrieved definition for pid [${pid}]`,
          presentationSyncMapItem
        );
        if (presentationSyncMapItem) {
          setPresentation(
            presentationSyncMapItem.data as LiveSlidePresentation
          );
          setError(null); // Clear any previous errors
        } else {
          throw new Error('Presentation not found');
        }
      })
      .then(() => {
        const presentationStateDoc = `STATE-${pid}`;
        console.log(
          `[/] Creating subscription to document ${presentationStateDoc}`
        );

        client.document(presentationStateDoc).then((doc) => {
          console.log("[/] SYNC presentation state retrieved", doc.data);
          if (doc) setCurrentState(doc.data as CurrentState);

          doc.on("updated", (event) => {
            if (event) setCurrentState(event.data as CurrentState);
            console.log("[/] SYNC presentation state updated", event.data);
          });
        }).catch((err) => {
          console.error('[/] Error subscribing to presentation state', err);
          setError(new Error('Failed to sync with presentation'));
        });
      })
      .catch((err) => {
        console.error('[/] Error fetching presentation', err);
        setError(err instanceof Error ? err : new Error('Failed to load presentation'));
      });
  }, [client, pid]);

  /**
   *
   * Set phase based on current state
   *
   */
  useEffect(() => {
    if (!presentationState) return;
    console.log(`[/] Searching slides`, presentation?.slides);
    let targetSlide = presentation?.slides.find(
      (p) => p.id === presentationState.currentSlideId
    );

    if (!targetSlide) {
      console.log(
        `[/] !! presentationState.currentSlideId updated, but no target slide found`
      );
      return;
    }

    if (targetSlide.kind) {
      console.log(`Setting phase to [${targetSlide.kind}]`, targetSlide);
      setCurrentSlide(targetSlide);
      setPhase(Phase[targetSlide.kind]);
    } else {
      console.log(
        `[/] !! presentationState.currentSlideId updated, but kind is nullish`
      );
    }
  }, [
    presentation?.slides,
    presentationState,
    presentationState?.currentSlideId,
  ]);


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
        return <ReconnectingCard />;
    }
  };

  /**
   *
   * Return the component fot the current phase
   *
   */
  const getComponentForPhase = () => {
    // Show error message if there's an error
    if (error) {
      return (
        <ErrorMessage
          error={error}
          onRetry={() => {
            setError(null);
            window.location.reload();
          }}
        />
      );
    }

    switch (phase) {
      case Phase.Question:
      case Phase.Submitted:
      case Phase.WatchPresenter:
      case Phase.Identify:
      case Phase.DemoCta:
      case Phase.Ended:
      case Phase.WebRtc:
        return (
          <DynamicCardWrapper
            slide={currentSlide}
            performActions={performActions}
          />
        );
      case Phase.ErrorSync:
        return getComponentForError();
      case Phase.Welcome:
      default:
        return <WelcomeCard data={currentSlide || new Slide()} />;
    }
  };

  return (
    <AnalyticsProvider
      writeKey={
        presentation?.segmentWriteKey ||
        process.env.NEXT_PUBLIC_SEGMENT_API_KEY ||
        "not configured"
      }
    >
      <Box
        position="fixed" // Use "absolute" if "fixed" doesn't fit your use case
        top={0}
        right={0}
        bottom={0}
        left={0}
        backgroundImage={`url(${bgImage.src})`}
        backgroundSize="cover" // This ensures that the background covers the full screen
        backgroundPosition="center" // This centers the background image
        overflow={"scroll"}
        style={{
          backgroundColor: "#000000",
        }}
      >
        <CenterLayout>{getComponentForPhase()}</CenterLayout>
      </Box>
    </AnalyticsProvider>
  );
}
