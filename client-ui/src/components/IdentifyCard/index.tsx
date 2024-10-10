"use client";
import React, { useEffect, useState } from "react";

import { Card } from "@twilio-paste/core/card";
import { Heading } from "@twilio-paste/core/heading";
import { Form, FormControl } from "@twilio-paste/core/form";
import { Label } from "@twilio-paste/core/label";
import { Input } from "@twilio-paste/core/input";
import { Button } from "@twilio-paste/core/button";
import { HelpText } from "@twilio-paste/core/help-text";

import { FC } from "react";

import LogoHeader from "../LogoHeader";
import { GateSlide, Action } from "@/types/LiveSlides";
import { Stack } from "@twilio-paste/core/stack";
import { Spinner } from "@twilio-paste/core/spinner";
import { Box } from "@twilio-paste/core/box";
import { Anchor } from "@twilio-paste/core/anchor";
import { IPInfo } from "@/types/IPInfo";

export type IdentifyCardProps = {
  data: GateSlide;
  performActions: (
    actions: Action[],
    properties?: { [key: string]: any }
  ) => void;
};

const IdentifyCard: FC<IdentifyCardProps> = (props) => {
  const [ip_info, setIPInfo] = useState<IPInfo>();
  const [isFetchingPhone, setIsFetchingPhone] = useState<boolean>(false);
  const [isValidPhone, setIsValidPhone] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [normalizedPhone, setNormalizedPhone] = useState<string>("");

  useEffect(() => {
    if (!phone || phone === "") return;
    setIsValidPhone(false);
    const controller = new AbortController();
    const signal = controller.signal;
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

    setIsFetchingPhone(true);
    fetch(
      `${API_BASE}/api/number-lookup?countryCode=${
        ip_info?.countryCode || "AU"
      }&From=${encodeURIComponent(phone)}`,
      { signal }
    )
      .then((resp) => resp.json())
      .then((data) => {
        const normalizedPhoneNumber = data.phoneNumber;
        if (normalizedPhoneNumber && normalizedPhoneNumber.length > 0) {
          setNormalizedPhone(normalizedPhoneNumber);
          setIsValidPhone(true);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          console.log(`Aborted number validation`);
        } else {
          console.log(`Error normalizing phone number`, err);
        }
        setIsValidPhone(false);
      })
      .finally(() => setIsFetchingPhone(false));

    return () => {
      // Abort the request when the component unmounts or when a dependency changes
      controller.abort();
    };
  }, [ip_info?.countryCode, phone]);

  useEffect(() => {
    const getInfo = async () => {
      const resp = await fetch("https://freeipapi.com/api/json");
      const data = await resp.json();
      setIPInfo(data);
    };
    getInfo().catch((err) => {
      return err;
    });
  }, [phone]);

  const handleOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
  };

  return (
    <Card>
      <LogoHeader />
      <Heading as={"div"} variant={"heading20"} marginBottom="space0">
        {props.data.title}
      </Heading>
      <Form element="CUSTOM_ID_FORM">
        <FormControl>
          <Label>Name</Label>
          <Input
            type="text"
            id={"name"}
            name="name"
            placeholder="Jess Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <HelpText>So we know what to call you.</HelpText>
        </FormControl>

        <FormControl>
          <Label>Company</Label>
          <Input
            type="text"
            id={"company"}
            name="company"
            placeholder="ACME Corp"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            required
          />
          <HelpText>Who do you work for? Tell me! Who!?</HelpText>
        </FormControl>

        <FormControl>
          <Label>Email</Label>
          <Input
            type="email"
            id={"email"}
            name="email"
            placeholder="j.smith@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <HelpText>Want a copy of the ebook? Fill this in!</HelpText>
        </FormControl>

        <FormControl>
          <Label>Phone</Label>
          <Input
            type="tel"
            id={"phone"}
            name="phone"
            value={phone}
            placeholder="+61491570006"
            onChange={handleOnChange}
            required
          />
          <HelpText
            variant={isValidPhone && !isFetchingPhone ? "default" : "error"}
          >
            <Stack orientation="horizontal" spacing="space10">
              {isFetchingPhone && (
                <Spinner decorative={true} size="sizeIcon10" title="" />
              )}
              {isValidPhone && !isFetchingPhone
                ? `Using phone number ${normalizedPhone}`
                : "Use your real number for the demo"}
            </Stack>
          </HelpText>
        </FormControl>

        <Box>
          We will use the information you provide consistent with our{" "}
          <Anchor
            href="https://www.twilio.com/legal/privacy"
            showExternal
            target="_blank"
          >
            Privacy Policy.
          </Anchor>
        </Box>

        <Button
          fullWidth={true}
          variant="primary"
          disabled={!isValidPhone}
          onClick={() => {
            props.performActions(props.data.afterSubmitActions, {
              name,
              company,
              phone: normalizedPhone,
              email,
            });
          }}
        >
          Next
        </Button>
      </Form>
    </Card>
  );
};

export default IdentifyCard;
