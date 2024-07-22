import React, { FC, useState } from "react";
import { Box } from "@twilio-paste/core/box";
import { Button } from "@twilio-paste/core/button";
import { Heading } from "@twilio-paste/core/heading";
import { Stack } from "@twilio-paste/core/stack";
import {
  Disclosure,
  DisclosureContent,
  DisclosureHeading,
} from "@twilio-paste/core/disclosure";
import { Action, Option } from "../../types/LiveSlides";
import { Paragraph } from "@twilio-paste/core/paragraph";
import ActionPanel from "./ActionsPanel";
import { Input } from "@twilio-paste/core/input";
import {
  Form,
  FormControl,
  FormControlTwoColumn,
} from "@twilio-paste/core/form";
import { Label } from "@twilio-paste/core/label";
import { Alert } from "@twilio-paste/core/alert";
import { HelpText } from "@twilio-paste/core/help-text";
import { DeleteIcon } from "@twilio-paste/icons/esm/DeleteIcon";
import { ActionType } from "@/types/ActionTypes";

export interface OptionsPanelProps {
  options: Option[];
}

const OptionsPanel: FC<OptionsPanelProps> = (props: OptionsPanelProps) => {
  const [options, setOptions] = useState<Option[]>([
    {
      primary: true,
      optionLabel: "First option",
      optionValue: "first option",
      afterSubmitActions: [
        {
          type: ActionType.Slide,
        },
      ],
    },
    {
      primary: false,
      optionLabel: "Second option",
      optionValue: "second option",
      afterSubmitActions: [
        {
          type: ActionType.Slide,
        },
      ],
    },
  ]);

  const handleOptionTitleChange = (
    idx: number,
    evt: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedOptions = [...options];
    updatedOptions[idx] = {
      ...updatedOptions[idx],
      optionLabel: evt.target.value,
    };
    setOptions(updatedOptions);
  };

  const handleAddNewOption = () => {
    const newOption: Option = {
      primary: false,
      optionLabel: "(New Option)",
      optionValue: "",
      afterSubmitActions: [],
    };
    setOptions((prev) => [...prev, newOption]);
  };

  const handleDeleteOption = (idx: number) => {
    const updatedOptions = [...options];
    updatedOptions.splice(idx, 1);
    setOptions(updatedOptions);
  };

  const handleActionsUpdated = (idx: number, actions: Action[]) => {
    console.log(`OptionsPanel - handleActionsUpdated - idx [${idx}]`, actions);
    const updatedOptions = [...options];
    updatedOptions[idx] = {
      ...updatedOptions[idx],
      afterSubmitActions: actions,
    };
    setOptions(updatedOptions);
  };

  return (
    <Box
      padding={"space60"}
      display="flex"
      flexDirection="column"
      backgroundColor="colorBackgroundNew"
      borderRadius="borderRadius30"
    >
      <Heading as={"h3"} variant={"heading50"}>
        Question response options
      </Heading>
      <Paragraph>Target between one and four options at most</Paragraph>
      <Stack orientation="vertical" spacing="space30">
        {options && options.length > 4 ? (
          <Alert variant="warning">
            <strong>You might be displaying too many options</strong> Each
            option is rendered as a button on screen, make sure the list is not
            too long for the user
          </Alert>
        ) : (
          <></>
        )}
        {options.map((option, idx) => (
          <Disclosure key={`option-row-${idx}`}>
            <DisclosureHeading as={"div"} variant={"heading50"}>
              {option.optionLabel}
            </DisclosureHeading>
            <DisclosureContent>
              <Stack orientation="vertical" spacing="space30">
                <Form>
                  <FormControlTwoColumn>
                    <FormControl>
                      <Label htmlFor={`option-title-${idx}`}>
                        Response label
                      </Label>
                      <Input
                        id={`option-title-${idx}`}
                        value={option.optionLabel}
                        type={"text"}
                        placeholder="Label of the answer"
                        onChange={(evt) => handleOptionTitleChange(idx, evt)}
                      ></Input>
                      <HelpText>
                        This will show as a button to the audience
                      </HelpText>
                    </FormControl>
                    <FormControl>
                      <Box
                        textAlign={"end"}
                        alignContent={"center"}
                        height={"100%"}
                      >
                        <Button
                          variant="destructive_secondary"
                          onClick={() => handleDeleteOption(idx)}
                        >
                          {" "}
                          <DeleteIcon decorative />
                          Delete this option
                        </Button>
                      </Box>
                    </FormControl>
                  </FormControlTwoColumn>
                </Form>

                <ActionPanel
                  actions={option.afterSubmitActions}
                  onActionsUpdated={(actions) =>
                    handleActionsUpdated(idx, actions)
                  }
                />
              </Stack>
            </DisclosureContent>
          </Disclosure>
        ))}
        <Button variant="primary" onClick={handleAddNewOption}>
          Add new option
        </Button>
      </Stack>
    </Box>
  );
};

export default OptionsPanel;
