"use client";

import React, { useEffect, useState } from "react";
import { Call, Device } from "@twilio/voice-sdk";
import { Card, Box, Text, Button, Alert, Stack } from "@twilio-paste/core";
import { Heading } from "@twilio-paste/core/heading";
import { FC } from "react";
import { generateSlug } from "random-word-slugs";

import LogoHeader from "../LogoHeader";
import { WebRtcSlide } from "@/types/LiveSlides";
import VoiceService from "@/services/VoiceService";

export type WebRtcCardProps = {
  data: WebRtcSlide;
};

enum CallPhase {
  Initializing = "Initializing",
  Ready = "Ready",
  Dialling = "Dialling",
  Ringing = "Ringing",
  Accepted = "Accepted",
  RemoteAudio = "RemoteAudio",
}

const WebRtcCard: FC<WebRtcCardProps> = (props: WebRtcCardProps) => {
  const [device, setDevice] = useState<Device>();
  const [call, setCall] = useState<Call>();
  const [callTimer, setCallTimer] = useState(0);
  const [isMuted, setMuted] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>("Loading...");
  const [isMainButtonEnabled, setMainButtonEnabled] = useState<boolean>(false);
  const [phase, setPhase] = useState<CallPhase>(CallPhase.Initializing);
  const [hasPermissionError, setPermissionError] = useState(false);

  /**
   * Initialize Voice Service
   */
  useEffect(() => {
    console.log("Init Voice Service");
    setStatusText("Initializing");

    // Get client ID from local storage or generate new one
    let defaultUserId = localStorage.getItem("userId") || generateSlug();
    localStorage.setItem("userId", defaultUserId);

    VoiceService.init(defaultUserId).then((device) => {
      console.log("Init Voice Service - Done");
      setDevice(device);
      registerDeviceHandlers(device);
      device.register();
      setPhase(CallPhase.Ready);
    });
  }, []);

  /**
   * Set UI items based on current state
   */
  useEffect(() => {
    console.log(`Current Phase: ${phase}`);
    switch (phase) {
      case CallPhase.Initializing:
        setMainButtonEnabled(false);
        break;

      case CallPhase.Ready:
        setStatusText("Tap to call");
        setMainButtonEnabled(true);
        break;

      case CallPhase.Dialling:
        setStatusText("Dialling...");
        break;

      case CallPhase.Accepted:
      case CallPhase.RemoteAudio:
        console.log("Have remote audio");
        setStatusText("Connected");
        setCallTimer(0);
        /** Call Timer **/
        const interval = setInterval(() => setCallTimer((prev) => prev + 1), 1000);
        return () => clearInterval(interval);
    }
  }, [phase]);

  /**
   * What should the main button do for each phase
   */
  const handleOnMainPress = () => {
    console.log("Main button press, current phase:", phase);

    switch (phase) {
      case CallPhase.Initializing:
        console.log("Press during init");
        break;
      case CallPhase.Ready:
        console.log("Press during ready");
        if (device) {
          device.connect().then((call) => {
            registerCallHandler(call);
            setCall(call);
          });
        }
        setPhase(CallPhase.Dialling);
        break;

      case CallPhase.Accepted:
      case CallPhase.Ringing:
      case CallPhase.RemoteAudio:
      case CallPhase.Dialling:
        console.log("Disconnecting");
        call?.disconnect();
        break;
    }
  };

  /**
   * Handle Device events
   */
  const registerDeviceHandlers = (device: Device) => {
    device.on("error", function (error) {
      console.log("Twilio.Device Error: " + error.message);
    });

    device.on("registered", function () {
      console.log("Device registered");
      setPhase(CallPhase.Ready);
    });
  };

  /**
   * Handle Call events
   */
  const registerCallHandler = (call: Call) => {
    call.on("error", (e: any) => {
      if (31401 === e.code) setPermissionError(true);

      console.log("Call error", e);
      if (e) console.log(JSON.stringify(e));
      handleDisconnectedIncomingCall(e);
    });
    call.on("accept", (call) => {
      setCall(call);
      setPhase(CallPhase.Accepted);
    });
    call.on("ringing", (hasEarlyMedia) => {
      console.log("Has early media: ", hasEarlyMedia);
      setPhase(CallPhase.Ringing);
    });
    call.on("mute", (isMute, call) => {
      console.log("Call mute status now:", isMute);
      setMuted(isMute);
    });
    call.on("cancel", handleDisconnectedIncomingCall);
    call.on("disconnect", handleDisconnectedIncomingCall);
    call.on("reject", handleDisconnectedIncomingCall);
    call.on("warning", (name, data) => {
      console.warn(name, data);
    });
  };

  /**
   * Disconnect handler
   */
  const handleDisconnectedIncomingCall = (payload: any) => {
    setPhase(CallPhase.Ready);
    setStatusText("Disconnected");
    console.log("handleDisconnectedIncomingCall called", payload);
  };

  /**
   * The all important mute button
   */
  const handleMutePress = () => {
    console.log("Mute pressed");
    if (call) {
      call.mute(!isMuted);
      console.log("Muting call", call);
    }
  };

  // Format timer display
  const minutes = Math.floor(callTimer / 60);
  const seconds = callTimer - minutes * 60;
  const stringPadLeft = (value: number, pad: string, length: number) => {
    return (new Array(length + 1).join(pad) + value).slice(-length);
  };
  const finalTime = stringPadLeft(minutes, "0", 2) + ":" + stringPadLeft(seconds, "0", 2);

  return (
    <Card>
      <LogoHeader />
      <Heading as={"div"} variant={"heading20"}>
        {props.data.title}
      </Heading>
      {props.data.description && (
        <Text as="p" marginTop="space40" marginBottom="space60">
          {props.data.description}
        </Text>
      )}

      {hasPermissionError && (
        <Alert variant="error">
          <strong>Oops! </strong>Microphone access is required. Please try again{" "}
          <Button variant="link" onClick={() => window.location.reload()}>
            Click here to reload
          </Button>
        </Alert>
      )}

      <Box alignContent={"center"} justifyContent={"center"} display={"grid"} marginBottom="space60">
        <Box
          style={{
            background: "linear-gradient(90deg, rgba(89,255,0,1) 0%, rgba(3,159,255,1) 99%)",
          }}
          marginTop={"space40"}
          borderRadius={"borderRadiusCircle"}
          height={"205px"}
          width={"205px"}
          alignContent={"center"}
          justifyContent={"center"}
          display={"grid"}
        >
          <Box
            borderColor={"colorBorderDecorative10Weaker"}
            // borderStyle={"solid"}
            borderWidth={"borderWidth30"}
            borderRadius={"borderRadiusCircle"}
            height={"200px"}
            width={"200px"}
            alignContent={"center"}
            justifyContent={"center"}
            display={"grid"}
            _hover={{ backgroundColor: "colorBackgroundBodyElevationPrimary" }}
            backgroundColor={"colorBackgroundBody"}
            cursor={"pointer"}
            onClick={handleOnMainPress}
          >
            {phase === CallPhase.Accepted ? (
              <Box textAlign={"center"}>
                <Text
                  as="p"
                  fontSize={"fontSize70"}
                  fontWeight={"fontWeightBold"}
                  cursor="pointer"
                  color={isMainButtonEnabled ? "colorText" : "colorTextWeak"}
                >
                  {finalTime}
                </Text>
                <Text
                  marginTop={"space40"}
                  as="p"
                  fontSize={"fontSize30"}
                  fontWeight={"fontWeightBold"}
                  cursor="pointer"
                  color={isMainButtonEnabled ? "colorText" : "colorTextWeak"}
                >
                  Tap to disconnect
                </Text>
              </Box>
            ) : (
              <Text
                as="span"
                fontSize={"fontSize50"}
                fontWeight={"fontWeightBold"}
                cursor="pointer"
                textAlign="center"
                color={isMainButtonEnabled ? "colorText" : "colorTextWeak"}
              >
                {statusText}
              </Text>
            )}
          </Box>
        </Box>
      </Box>

      {phase === CallPhase.Accepted && (
        <Stack orientation="vertical" spacing="space40">
          <Button variant={isMuted ? "primary" : "destructive"} fullWidth onClick={handleMutePress}>
            {isMuted ? "Unmute" : "Mute"}
          </Button>
        </Stack>
      )}
    </Card>
  );
};

export default WebRtcCard;
