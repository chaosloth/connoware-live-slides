"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

import { Flex } from "@twilio-paste/core/flex";
import { Card } from "@twilio-paste/core/card";
import { Heading } from "@twilio-paste/core/heading";
import { Spinner } from "@twilio-paste/core/spinner";

import { FC } from "react";

import reconnectIcon from "@/icons/reconnect.svg";

import LogoHeader from "../LogoHeader";
import { Button } from "@twilio-paste/core/button";
import { Stack } from "@twilio-paste/core";

const ReconnectingCard: FC = () => {
  const [processing, setProcessing] = useState<boolean>(false);
  const [showReloadButton, setShowReloadButton] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => setShowReloadButton(true), 10000);
  }, []);

  return (
    <Card>
      <LogoHeader />
      <Heading as={"div"} variant={"heading30"}>
        {"Hit the refresh button to reconnect..."}
      </Heading>
      <Stack orientation={"vertical"} spacing={"space40"}>
        <Flex hAlignContent="center" vertical>
          <Image src={reconnectIcon} alt={"Reconnecting"} priority={true} />
        </Flex>
        <Flex hAlignContent={"center"} paddingTop={"space40"}>
          <Button
            disabled={processing}
            variant="primary"
            fullWidth={true}
            onClick={() => {
              setProcessing(true);
              window.location.reload();
            }}
          >
            Tap here to reload
            {processing && <Spinner decorative={true} />}
          </Button>
        </Flex>
      </Stack>
    </Card>
  );

  // return (
  //   <Card>
  //     <LogoHeader />
  //     <Heading as={"div"} variant={"heading30"}>
  //       {!showReloadButton && <>{"Standby, we're reconnecting..."}</>}
  //       {showReloadButton && <>{"Hit the refresh button below..."}</>}
  //     </Heading>
  //     <Stack orientation={"vertical"} spacing={"space40"}>
  //       <Flex hAlignContent="center" vertical>
  //         <Image src={reconnectIcon} alt={"Reconnecting"} priority={true} />
  //       </Flex>
  //       <Flex hAlignContent={"center"} paddingTop={"space40"}>
  //         {!showReloadButton && (
  //           <Spinner
  //             decorative={true}
  //             size={"sizeIcon80"}
  //             color={"colorTextDestructive"}
  //           />
  //         )}
  //         {showReloadButton && (
  //           <Button
  //             disabled={processing}
  //             variant="primary"
  //             fullWidth={true}
  //             onClick={() => {
  //               setProcessing(true);
  //               window.location.reload();
  //             }}
  //           >
  //             Tap here to reload
  //             {processing && <Spinner decorative={true} />}
  //           </Button>
  //         )}
  //       </Flex>
  //     </Stack>
  //   </Card>
  // );
};

export default ReconnectingCard;
