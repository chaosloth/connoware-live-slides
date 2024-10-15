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
  IdentifyAction,
  LiveSlidePresentation,
  Slide,
  SlideAction,
  StreamAction,
  TallyAction,
  TrackAction,
  UrlAction,
} from "@/types/LiveSlides";
import DynamicCardWrapper from "@/components/DynamicCardWrapper";
import { State, useSyncClient } from "@/app/context/Sync";
import { useAnalytics } from "@/app/context/Analytics";
import { ActionType } from "@/types/ActionTypes";
import LiveSlidesService from "@/utils/LiveSlidesService";
import { SyncStream } from "twilio-sync";

// import bgImage from "../../public/cookies.png";
import bgImage from "../../public/signal_bg.svg";
import { Box } from "@twilio-paste/core";
import ReconnectingCard from "@/components/ReconnectingCard";
import { Theme } from "@twilio-paste/theme";

export default function Home() {
  const [phase, setPhase] = useState<Phase>(Phase.Welcome);
  const [currentSlide, setCurrentSlide] = useState<Slide>();
  const [presentationState, setCurrentState] = useState<CurrentState>();
  const [pid, setPresentationId] = useState<string | undefined>();
  const [presentation, setPresentation] = useState<LiveSlidePresentation>();

  const windowFocused = useWindowFocus();
  const { client, identity, state } = useSyncClient();
  const [stream, setStream] = useState<SyncStream>();

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
      })
      .catch((err) => console.log(`Error creating sync stream`, err));
  }, [client, pid]);

  /**
   *
   * Emit event
   *
   */
  const publishEventToStream = (props: any) => {
    if (!stream) return;
    const evt = {
      sid: currentSlide?.id,
      ...props,
    };
    console.log(`Sending to stream`, evt);
    stream.publishMessage(evt);
  };

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
        if (presentationSyncMapItem)
          setPresentation(
            presentationSyncMapItem.data as LiveSlidePresentation
          );
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
   * Perform the actions in response to user activity
   *
   */
  const performActions = (
    actions: Action[],
    properties?: { [key: string]: any }
  ) => {
    console.log(`Performing [${actions.length}] actions`);

    actions.map((action) => {
      switch (action.type) {
        case ActionType.Slide:
          let targetSlide = presentation?.slides.find(
            (p) => p.id === (action as SlideAction).slideId
          );
          if (!targetSlide) return;
          setCurrentSlide(targetSlide);
          setPhase(targetSlide.kind as Phase);
          return;

        case ActionType.Tally:
          publishEventToStream({
            type: (action as TallyAction).type,
            answer: (action as TallyAction).answer,
            client_id: identity?.split(":")[1] || identity,
          });
          return;

        case ActionType.Track:
          console.log(`Track users activity`, action);
          analytics.track((action as TrackAction).event, {
            ...(action as TrackAction).properties,
            ...properties,
          });
          return;

        case ActionType.Stream:
          console.log(`Stream users activity`, action);

          // Interpolate function to enable user to use templates
          const interpolate = (str: string, params: { [key: string]: any }) => {
            const names = Object.keys(params);
            console.log(`Names`, names);
            const values = Object.values(params);
            console.log(`Values`, values);
            return new Function(...names, `return \`${str}\`;`)(...values);
          };

          try {
            let act = action as StreamAction;

            console.log(`Interpolating string: ${act.message}`);
            console.log(`act = `, act);
            console.log(`properties = `, properties);
            const res = interpolate(act.message, {
              ...act,
              ...properties,
            });

            console.log(`Interpolation result: ${res}`);

            publishEventToStream({
              type: act.type,
              message: res,
              client_id: identity?.split(":")[1] || identity,
            });
          } catch (err) {
            console.warn(`Error sending stream event`, err);
          }
          return;

        case ActionType.Identify:
          console.log(`Sending Identify (phone), action`, action, properties);
          analytics.identify(properties?.phone, {
            ...(action as IdentifyAction).properties,
            ...properties,
          });
          return;

        // case ActionType.Identify:
        //   console.log(
        //     `Sending Identify (phone, email or identity), action`,
        //     action,
        //     properties
        //   );
        //   analytics.identify(
        //     properties?.phone || properties?.email || identity,
        //     {
        //       ...(action as IdentifyAction).properties,
        //       ...properties,
        //     }
        //   );
        //   return;

        // case ActionType.Identify:
        //   console.log(
        //     `Sending Identify (email or identity), action`,
        //     action,
        //     properties
        //   );
        //   analytics.identify(properties?.email || identity, {
        //     ...(action as IdentifyAction).properties,
        //     ...properties,
        //   });
        //   return;

        // case ActionType.Identify:
        //   console.log(`Sending Identify, action`, action, properties);
        //   analytics.identify(identity?.split(":")[1] || identity, {
        //     ...(action as IdentifyAction).properties,
        //     ...properties,
        //   });
        //   return;
        case ActionType.URL:
          window.open((action as UrlAction).url, "_self");
          return;
        default:
          console.log(`[/] Attempt to run unknown action`, action);
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
        return <ReconnectingCard />;
    }
  };

  /**
   *
   * Return the component fot the current phase
   *
   */
  const getComponentForPhase = () => {
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
      // return (
      //   <ErrorCard
      //     title="Nothing to see here..."
      //     emphasis="Please scan the QR code again. "
      //     message="If symptoms persists for more than 4 hours consult a doctor!"
      //   />
      // );
    }
  };

  return (
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
  );
}
