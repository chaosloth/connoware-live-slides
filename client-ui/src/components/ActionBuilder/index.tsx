"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Select,
  Option as SelectOption,
  Input,
  Label,
  FormControl,
  HelpText,
  TextArea,
  Stack,
  Text,
  Disclosure,
  DisclosureHeading,
  DisclosureContent,
} from "@twilio-paste/core";
import { DeleteIcon } from "@twilio-paste/icons/esm/DeleteIcon";
import { PlusIcon } from "@twilio-paste/icons/esm/PlusIcon";
import { CopyIcon } from "@twilio-paste/icons/esm/CopyIcon";
import { ActionType } from "@/types/ActionTypes";
import { ACTION_TYPES } from "@/schemas/presentationSchema";
import {
  Action,
  SlideAction,
  TrackAction,
  IdentifyAction,
  StreamAction,
  UrlAction,
  TallyAction,
  Slide,
} from "@/types/LiveSlides";

interface ActionBuilderProps {
  actions: Action[];
  onChange: (actions: Action[]) => void;
  availableSlides?: Slide[];
  label?: string;
  helpText?: string;
}

/**
 * Component for building and editing actions
 */
export function ActionBuilder({
  actions,
  onChange,
  availableSlides = [],
  label = "Actions",
  helpText,
}: ActionBuilderProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddAction = () => {
    const newAction = new Action();
    newAction.type = ActionType.Track;
    onChange([...actions, newAction]);
    setEditingIndex(actions.length);
  };

  const handleCloneAction = (index: number) => {
    const clonedAction = JSON.parse(JSON.stringify(actions[index]));
    const newActions = [...actions];
    newActions.splice(index + 1, 0, clonedAction);
    onChange(newActions);
  };

  const handleRemoveAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleMoveAction = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= actions.length) return;

    const newActions = [...actions];
    const [movedAction] = newActions.splice(fromIndex, 1);
    newActions.splice(toIndex, 0, movedAction);
    onChange(newActions);
  };

  const handleUpdateAction = (index: number, updatedAction: Action) => {
    const newActions = [...actions];
    newActions[index] = updatedAction;
    onChange(newActions);
  };

  const handleTypeChange = (index: number, newType: ActionType) => {
    let newAction: Action;

    switch (newType) {
      case ActionType.Slide:
        newAction = new SlideAction();
        break;
      case ActionType.Track:
        newAction = new TrackAction();
        break;
      case ActionType.Identify:
        newAction = new IdentifyAction();
        break;
      case ActionType.Stream:
        newAction = new StreamAction();
        break;
      case ActionType.URL:
        newAction = new UrlAction();
        break;
      case ActionType.Tally:
        newAction = new TallyAction();
        break;
      default:
        newAction = new Action();
    }

    handleUpdateAction(index, newAction);
  };

  const renderActionForm = (action: Action, index: number) => {
    const metadata = ACTION_TYPES.find((t) => t.type === action.type);
    const actionLabel = metadata?.label || "Action";

    return (
      <Box key={index} marginBottom="space40">
        <Disclosure variant="contained">
          <DisclosureHeading as="h5" variant="heading60">
            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
              <Text as="span">
                Action {index + 1}: {actionLabel}
              </Text>
              <Box display="flex" columnGap="space20" alignItems="center" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="secondary"
                  size="icon_small"
                  onClick={() => handleCloneAction(index)}
                  title="Clone action"
                >
                  <CopyIcon decorative={false} title="Clone action" />
                </Button>
                <Button
                  variant="destructive_link"
                  size="icon_small"
                  onClick={() => handleRemoveAction(index)}
                  title="Remove action"
                >
                  <DeleteIcon decorative={false} title="Remove action" />
                </Button>
              </Box>
            </Box>
          </DisclosureHeading>
          <DisclosureContent>
            <Stack orientation="vertical" spacing="space40">
              <FormControl>
                <Label htmlFor={`action-type-${index}`}>Action Type</Label>
                <Select
                  id={`action-type-${index}`}
                  value={action.type}
                  onChange={(e) => handleTypeChange(index, e.target.value as ActionType)}
                >
                  {ACTION_TYPES.map((type) => (
                    <SelectOption key={type.type} value={type.type}>
                      {type.label}
                    </SelectOption>
                  ))}
                </Select>
                {metadata && (
                  <HelpText id={`action-type-help-${index}`}>{metadata.description}</HelpText>
                )}
              </FormControl>

              {/* Type-specific fields */}
              {action.type === ActionType.Slide && (
                <FormControl>
                  <Label htmlFor={`slide-id-${index}`}>Target Slide</Label>
                  <Select
                    id={`slide-id-${index}`}
                    value={(action as SlideAction).slideId || ""}
                    onChange={(e) => {
                      const updated = { ...action } as SlideAction;
                      updated.slideId = e.target.value;
                      handleUpdateAction(index, updated);
                    }}
                  >
                    <SelectOption value="">Select a slide</SelectOption>
                    {availableSlides.map((slide) => (
                      <SelectOption key={slide.id} value={slide.id}>
                        {slide.title || slide.id}
                      </SelectOption>
                    ))}
                  </Select>
                  <HelpText>Navigate to this slide when action executes</HelpText>
                </FormControl>
              )}

              {action.type === ActionType.Track && (
                <>
                  <FormControl>
                    <Label htmlFor={`event-name-${index}`}>Event Name</Label>
                    <Input
                      id={`event-name-${index}`}
                      type="text"
                      value={(action as TrackAction).event || ""}
                      onChange={(e) => {
                        const updated = { ...action } as TrackAction;
                        updated.event = e.target.value;
                        handleUpdateAction(index, updated);
                      }}
                      placeholder="e.g., Button Clicked"
                    />
                    <HelpText>Event name in Segment analytics</HelpText>
                  </FormControl>
                  <FormControl>
                    <Label htmlFor={`event-props-${index}`}>Properties (JSON)</Label>
                    <TextArea
                      id={`event-props-${index}`}
                      value={JSON.stringify((action as TrackAction).properties || {}, null, 2)}
                      onChange={(e) => {
                        try {
                          const props = JSON.parse(e.target.value);
                          const updated = { ...action } as TrackAction;
                          updated.properties = props;
                          handleUpdateAction(index, updated);
                        } catch (err) {
                          // Invalid JSON, ignore
                        }
                      }}
                      placeholder={'{\n  "key": "value"\n}'}
                    />
                    <HelpText>Additional properties to send with the event</HelpText>
                  </FormControl>
                </>
              )}

              {action.type === ActionType.Identify && (
                <FormControl>
                  <Label htmlFor={`identify-props-${index}`}>User Properties (JSON)</Label>
                  <TextArea
                    id={`identify-props-${index}`}
                    value={JSON.stringify((action as IdentifyAction).properties || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const props = JSON.parse(e.target.value);
                        const updated = { ...action } as IdentifyAction;
                        updated.properties = props;
                        handleUpdateAction(index, updated);
                      } catch (err) {
                        // Invalid JSON, ignore
                      }
                    }}
                    placeholder={'{\n  "plan": "premium"\n}'}
                  />
                  <HelpText>Properties to identify the user with</HelpText>
                </FormControl>
              )}

              {action.type === ActionType.Stream && (
                <>
                  <FormControl>
                    <Label htmlFor={`stream-message-${index}`}>Message Template</Label>
                    <TextArea
                      id={`stream-message-${index}`}
                      value={(action as StreamAction).message || ""}
                      onChange={(e) => {
                        const updated = { ...action } as StreamAction;
                        updated.message = e.target.value;
                        handleUpdateAction(index, updated);
                      }}
                      placeholder="User selected: ${optionLabel}"
                    />
                    <HelpText>Use ${"{variable}"} for interpolation</HelpText>
                  </FormControl>
                  <FormControl>
                    <Label htmlFor={`stream-props-${index}`}>Properties (JSON)</Label>
                    <TextArea
                      id={`stream-props-${index}`}
                      value={JSON.stringify((action as StreamAction).properties || {}, null, 2)}
                      onChange={(e) => {
                        try {
                          const props = JSON.parse(e.target.value);
                          const updated = { ...action } as StreamAction;
                          updated.properties = props;
                          handleUpdateAction(index, updated);
                        } catch (err) {
                          // Invalid JSON, ignore
                        }
                      }}
                      placeholder={'{\n  "key": "value"\n}'}
                    />
                    <HelpText>Additional properties for the stream message</HelpText>
                  </FormControl>
                </>
              )}

              {action.type === ActionType.URL && (
                <FormControl>
                  <Label htmlFor={`url-${index}`}>URL</Label>
                  <Input
                    id={`url-${index}`}
                    type="url"
                    value={(action as UrlAction).url || ""}
                    onChange={(e) => {
                      const updated = { ...action } as UrlAction;
                      updated.url = e.target.value;
                      handleUpdateAction(index, updated);
                    }}
                    placeholder="https://example.com"
                  />
                  <HelpText>URL to navigate to (must be http:// or https://)</HelpText>
                </FormControl>
              )}

              {action.type === ActionType.Tally && (
                <FormControl>
                  <Label htmlFor={`tally-answer-${index}`}>Answer Value</Label>
                  <Input
                    id={`tally-answer-${index}`}
                    type="text"
                    value={(action as TallyAction).answer || ""}
                    onChange={(e) => {
                      const updated = { ...action } as TallyAction;
                      updated.answer = e.target.value;
                      handleUpdateAction(index, updated);
                    }}
                    placeholder="e.g., option-a"
                  />
                  <HelpText>Value to record for this vote/response</HelpText>
                </FormControl>
              )}
            </Stack>
          </DisclosureContent>
        </Disclosure>
      </Box>
    );
  };

  return (
    <Box>
      {label && (
        <Box marginBottom="space30">
          <Label htmlFor="actions-builder">
            {label}
          </Label>
        </Box>
      )}
      {helpText && (
        <Box marginBottom="space40">
          <HelpText>{helpText}</HelpText>
        </Box>
      )}

      {actions.length === 0 ? (
        <Box
          padding="space60"
          backgroundColor="colorBackgroundWeak"
          borderRadius="borderRadius30"
          textAlign="center"
        >
          <Stack orientation="vertical" spacing="space40">
            <Text as="p" color="colorTextWeak">
              No actions configured
            </Text>
            <Button variant="secondary" onClick={handleAddAction}>
              <PlusIcon decorative />
              Add Action
            </Button>
          </Stack>
        </Box>
      ) : (
        <>
          {actions.map((action, index) => renderActionForm(action, index))}
          <Button variant="primary" onClick={handleAddAction}>
            <PlusIcon decorative />
            Add Another Action
          </Button>
        </>
      )}
    </Box>
  );
}
