"use client";
import React from "react";

import { Card } from "@twilio-paste/core/card";
import { Heading } from "@twilio-paste/core/heading";
import { Form, FormControl } from "@twilio-paste/core/form";
import { Label } from "@twilio-paste/core/label";
import { Input } from "@twilio-paste/core/input";
import { Button } from "@twilio-paste/core/button";
import { HelpText } from "@twilio-paste/core/help-text";

import { FC } from "react";

import LogoHeader from "../LogoHeader";

const IdentifyCard: FC = () => {
  return (
    <Card>
      <LogoHeader />
      <Heading as={"div"} variant={"heading20"}>
        Tell us about yourself
      </Heading>
      <Form>
        <FormControl>
          <Label>Name</Label>
          <Input type="text" id={"name"} name="name" placeholder="Jess Smith" />
          <HelpText>So we know what to call you</HelpText>
        </FormControl>

        <FormControl>
          <Label>Email</Label>
          <Input
            type="email"
            id={"email"}
            name="email"
            placeholder="j.smith@example.com"
          />
          <HelpText>Want a copy of the ebook?</HelpText>
        </FormControl>

        <FormControl>
          <Label>Phone</Label>
          <Input
            type="tel"
            id={"phone"}
            name="phone"
            placeholder="+61491570006"
          />
          <HelpText>Use your real number for the demo</HelpText>
        </FormControl>

        <Button fullWidth={true} variant="primary">
          Next
        </Button>
      </Form>
    </Card>
  );
};

export default IdentifyCard;
