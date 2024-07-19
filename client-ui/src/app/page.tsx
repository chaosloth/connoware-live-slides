"use client";
import { ConnectionState, SyncClient } from "twilio-sync";
import { useState, useEffect } from "react";
import { generateSlug } from "random-word-slugs";
import useWindowFocus from "use-window-focus";
import { Theme } from "@twilio-paste/core/theme";

import { Phase } from "@/types/Phases";
import { AnalyticsProvider } from "@/components/Analytics";
import CenterLayout from "@/components/CenterLayout";
import WelcomeCard from "@/components/WelcomeCard";
import ErrorCard from "@/components/ErrorCard";
import { Cta, CurrentState, LiveSlides, Page } from "@/types/LiveSlides";
import DynamicCardWrapper from "@/components/DynamicCardWrapper";
import { Paragraph } from "@twilio-paste/core";

export default function Home() {
  const [phase, setPhase] = useState<Phase>(Phase.Welcome);
  const [currentPage, setCurrentPage] = useState<Page>();
  const [presentationState, setCurrentState] = useState<CurrentState>();
  const [identity, setIdentity] = useState<string>();
  const [pid, setPresentationId] = useState<string | undefined>();
  const [status, setStatus] = useState<string>();
  const [syncClient, setSyncClient] = useState<SyncClient>();
  const [token, setToken] = useState<string>();
  const [pages, setPages] = useState<LiveSlides>();
  const [connectionState, setConnectionState] = useState<ConnectionState>();

  const windowFocused = useWindowFocus();

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE || "";

  /**
   *
   * Get a token and register the device
   *
   */
  // Helper method to get an access token
  const getToken = () =>
    fetch(`${BASE_URL}/api/token?identity=${identity}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(`Received access token`, data);
        setStatus("Got access token");
        // Create Twilio Sync client with newly received token
        return data.token;
      })
      .catch((reason: any) => {
        setStatus("Could not fetch token");
        console.error("Error getting token", reason);
      });

  /**
   *
   * Set the users identity based on passed in parameters or local cache
   *
   */
  useEffect(() => {
    // Get client ID from local storage or generate new one
    let localIdentity =
      localStorage.getItem("identity") || "web:" + generateSlug();

    // Parse identity query parameter (optional)
    const searchParams = new URLSearchParams(document.location.search);
    const searchParamsIdentity = searchParams.get("identity");
    if (searchParamsIdentity) {
      console.log(
        `Setting identity from search params [${searchParamsIdentity}]`
      );
      localIdentity = searchParamsIdentity || localIdentity;
    }

    // Set the local identity
    localStorage.setItem("identity", localIdentity);
    console.log(`Using identity [${localIdentity}]`);
    setIdentity(localIdentity);
  }, []);

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
   * Detect focus on app
   *
   */
  useEffect(() => {
    if (!identity || identity === "") return;
    //TODO: Ensure reconnect of Sync

    //TODO: Let app know that we've changed focus, need to pass client ID
    fetch(
      `${BASE_URL}/api/focus?windowFocused=${windowFocused}&identity=${identity}&ts=${Date.now()}`
    )
      .then((response) => response.json())
      // .then((data) => console.log(`Focus changed`, data))
      .catch((err) =>
        console.log(`Error sending focus event [${windowFocused}]`, err)
      );
  }, [windowFocused, identity, BASE_URL]);

  /**
   *
   * Create sync client and logic for token refresh
   *
   */
  useEffect(() => {
    if (!identity || identity === "") return;

    (async () => {
      console.log(`Fetching access token with identity [${identity}]`);
      setStatus("Fetching access token");

      try {
        // Get a new token on load
        let token = await getToken();

        if (!token) {
          console.warn(`Twilio token unavailable, see error logs`);
          setPhase(Phase.ErrorNoToken);
          return;
        }

        console.log("Creating new sync client");
        setStatus("Creating new sync client");

        let client = new SyncClient(token);
        setSyncClient(client);

        client.on("tokenAboutToExpire", async () => {
          console.log("tokenAboutToExpire - Fetching token for sync client");
          const newToken = await getToken();
          if (!newToken) {
            console.warn(`Twilio token unavailable, see error logs`);
            setPhase(Phase.ErrorNoToken);
            return;
          }
          setToken(newToken);
          await client.updateToken(newToken);
          console.log("tokenAboutToExpire - Updated access token", newToken);
        });

        client.on("tokenExpired", async () => {
          console.log("tokenExpired - Fetching token for sync client");
          setPhase(Phase.ErrorTokeExpired);
        });

        client.on("connectionError", async (connectionError) => {
          console.log("Sync Client Connection error", connectionError);
        });

        client.on("connectionStateChanged", async (newState) => {
          console.log("Sync Connection State", newState);
          setConnectionState(newState);
        });
      } catch (err) {
        setStatus("Error creating sync client. Check logs");
        console.error(err);
      }

      setToken(token);
    })();

    return () => {
      if (syncClient) {
        console.log("Shutting down sync client");
        setStatus("Shutting down sync client");
        syncClient.shutdown();
        setSyncClient(undefined);
      }
    };
  }, [identity]);

  /**
   *
   * Subscribe to updates on main doc
   *
   */
  useEffect(() => {
    if (!syncClient) return;
    if (!pid) return;

    const presentationDefinitionDoc = `PRESENTATION-${pid}`;
    console.log(
      `Creating subscription to document ${presentationDefinitionDoc}`
    );

    // Create a subscription to the document
    syncClient.document(presentationDefinitionDoc).then((doc) => {
      console.log("SYNC presentation pages retrieved", doc.data);
      if (doc) setPages(doc.data as LiveSlides);

      doc.on("updated", (event) => {
        if (event) setPages(event.data as LiveSlides);
        console.log("SYNC presentation pages updated", event.data);
        setStatus("Last activity " + new Date().toTimeString());
      });
    });

    const presentationStateDoc = `STATE-${pid}`;
    console.log(`Creating subscription to document ${presentationStateDoc}`);

    syncClient.document(presentationStateDoc).then((doc) => {
      console.log("SYNC presentation state retrieved", doc.data);
      if (doc) setCurrentState(doc.data as CurrentState);

      doc.on("updated", (event) => {
        if (event) setCurrentState(event.data as CurrentState);
        console.log("SYNC presentation state updated", event.data);
        setStatus("Last activity " + new Date().toTimeString());
      });
    });
  }, [syncClient, pid]);

  /**
   *
   * Set phase based on current state
   *
   */
  useEffect(() => {
    if (!presentationState) return;
    let targetPage = pages?.pages.find(
      (p) => p.id === presentationState.currentPageId
    );

    if (!targetPage) return;

    if (targetPage.type) {
      console.log(`Setting phase to [${targetPage.type}]`, targetPage);
      setCurrentPage(targetPage);
      setPhase(Phase[targetPage.type]);
    }
  }, [presentationState?.currentPageId]);

  const callNextPage = (target: string) => {
    let targetPage = pages?.pages.find((p) => p.id === target);
    console.log(`Local request for page [${target}]`, targetPage);
    if (!targetPage) return;

    if (targetPage.type) {
      console.log(`Setting phase to [${targetPage.type}]`, targetPage);
      setCurrentPage(targetPage);
      setPhase(Phase[targetPage.type]);
    }
  };

  const trackCta = (cta: Cta) => {
    console.log(`Tracking action for cta [${cta.label}] => [${cta.url}]`);
  };

  const performCta = (cta: Cta) => {
    console.log(`User performed cta [${cta.label}] => [${cta.url}]`);
    const url = new URL(cta.url);
    switch (url.protocol) {
      case "page":
        callNextPage(url.hostname);
        return;
      case "track":
        trackCta(cta);
        return;
      case "tel":
      case "http":
      case "https":
        window.open(cta.url);
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
          <DynamicCardWrapper page={currentPage} performCta={performCta} />
        );
      case Phase.ErrorNoPid:
        return (
          <ErrorCard
            title="Let's try that again..."
            emphasis="Please scan the QR code again. "
            message="If symptoms persists for more than 4 hours consult a doctor!"
          />
        );
      case Phase.ErrorNoToken:
        return (
          <ErrorCard
            title="Let's try that again..."
            emphasis="Please scan the QR code again. "
            message="Best thing about COVID-19 is that we all know how now!"
            showReloadButton={true}
          />
        );
      case Phase.ErrorTokeExpired:
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

  return (
    <AnalyticsProvider
      writeKey={process.env.NEXT_PUBLIC_SEGMENT_API_KEY || "not configured"}
    >
      <Theme.Provider theme="twilio">
        <CenterLayout>{getComponentForPhase()}</CenterLayout>
      </Theme.Provider>
    </AnalyticsProvider>
  );
}
