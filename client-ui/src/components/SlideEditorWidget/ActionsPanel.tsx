import React, { FC, useEffect, useState } from "react";
import { Box } from "@twilio-paste/core/box";
import { Button } from "@twilio-paste/core/button";
import { Heading } from "@twilio-paste/core/heading";
import { Stack } from "@twilio-paste/core/stack";
import {
  Disclosure,
  DisclosureContent,
  DisclosureHeading,
} from "@twilio-paste/core/disclosure";
import { DeleteIcon } from "@twilio-paste/icons/esm/DeleteIcon";
import { Action } from "../../types/LiveSlides";
import { Paragraph } from "@twilio-paste/core";
import { ActionEditorWidget } from "@/components/ActionEditorWidget";
import { ActionType } from "@/types/ActionTypes";

export interface ActionsPanelProps {
  actions: Action[];
  onActionsUpdated: (actions: Action[]) => void;
}

const ActionsPanel: FC<ActionsPanelProps> = (props: ActionsPanelProps) => {
  const [actions, setActions] = useState<Action[]>(props.actions);

  useEffect(() => {
    props.onActionsUpdated(actions);
  }, [actions]);

  const handleActionUpdate = (index: number, updatedAction: Action) => {
    const updatedActions = [...actions];
    updatedActions[index] = updatedAction;
    setActions(updatedActions);
  };

  const handleAddNewAction = () => {
    const newAction: Action = {
      type: ActionType.Unknown,
    };
    setActions((prev) => [...prev, newAction]);
  };

  const handleDeleteAction = (index: number) => {
    const updatedActions = [...actions];
    updatedActions.splice(index, 1);
    setActions(updatedActions);
  };

  return (
    <Box
      padding={"space60"}
      display="flex"
      flexDirection="column"
      backgroundColor="colorBackgroundNewWeakest"
      borderRadius="borderRadius30"
    >
      <Heading as={"h3"} variant={"heading50"}>
        Actions
      </Heading>
      <Paragraph>
        Actions will be performed in response to use activity
      </Paragraph>

      <Stack orientation="vertical" spacing="space30">
        {actions.map((action, idx) => (
          <Disclosure key={`action-row-${idx}`}>
            <DisclosureHeading as={"div"} variant={"heading50"}>
              {action.type}
            </DisclosureHeading>
            <DisclosureContent>
              <ActionEditorWidget
                action={action}
                handleActionChange={(changedAction) =>
                  handleActionUpdate(idx, changedAction)
                }
              >
                <Box textAlign={"end"} alignContent={"center"} height={"100%"}>
                  <Button
                    variant="destructive_secondary"
                    onClick={() => handleDeleteAction(idx)}
                  >
                    {" "}
                    <DeleteIcon decorative />
                    Delete this action
                  </Button>
                </Box>
              </ActionEditorWidget>
            </DisclosureContent>
          </Disclosure>
        ))}
        <Button variant="primary" onClick={handleAddNewAction}>
          Add new action
        </Button>
      </Stack>
    </Box>
  );
};

export default ActionsPanel;
