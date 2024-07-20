import React from "react";
import {
  Form,
  FormControl,
  FormControlTwoColumn,
} from "@twilio-paste/core/form";
import { Label } from "@twilio-paste/core/label";
import { Select, Option } from "@twilio-paste/core/select";
import { Input } from "@twilio-paste/core/input";
import { Paragraph } from "@twilio-paste/core/paragraph";
import { Heading } from "@twilio-paste/core/heading";
import { Slide } from "../../types/LiveSlides";
import { Phase } from "../../types/Phases";

export interface BasicInfoProps {
  slide: Slide;
  handleKindChange: (evt: React.ChangeEvent<HTMLSelectElement>) => void;
  handleIdChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  handleTitleChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  handleDescriptionChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
}

const BasicInfo: React.FC<BasicInfoProps> = (props: BasicInfoProps) => {
  const KindOptions = () =>
    (Object.keys(Phase) as Array<keyof typeof Phase>).map((key) => {
      return (
        <Option key={`slide-kind-${key as string}`} value={key as string}>
          {key as string}
        </Option>
      );
    });

  return (
    <Form>
      <Paragraph marginBottom="space0">
        Select the type of slide you wish to display, required options will be
        displayed based on the chosen type.
      </Paragraph>
      <FormControlTwoColumn>
        <FormControl>
          <Label htmlFor={`selection-slide-kind`}>Kind</Label>
          <Select
            id={`selection-slide-kind`}
            name="kind"
            onChange={props.handleKindChange}
            value={props.slide.kind}
          >
            <Option value="">(Choose slide kind from list)</Option>
            <KindOptions />
          </Select>
        </FormControl>
        <FormControl>
          <Label htmlFor={`slide-id`}>ID</Label>
          <Input
            id={`slide-id`}
            value={props.slide.id}
            type={"text"}
            placeholder="ID number"
            onChange={props.handleIdChange}
          ></Input>
        </FormControl>
      </FormControlTwoColumn>
      <FormControl>
        <Label htmlFor={`slide-title`}>Title</Label>
        <Input
          id={`slide-title`}
          value={props.slide.title}
          type={"text"}
          placeholder="Title of the slide"
          onChange={props.handleTitleChange}
        ></Input>
      </FormControl>

      <FormControl>
        <Label htmlFor={`slide-description`}>Description</Label>
        <Input
          id={`slide-description`}
          value={props.slide.description}
          type={"text"}
          placeholder="Copy to be displayed in the slide body"
          onChange={props.handleDescriptionChange}
        ></Input>
      </FormControl>
    </Form>
  );
};

export default BasicInfo;
