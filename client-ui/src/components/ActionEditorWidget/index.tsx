import React, { useEffect, useState } from "react";
import { Action, SlideAction, UrlAction } from "../../types/LiveSlides";
import { ActionType } from "../../types/ActionTypes";
import SlideActionEditor from "./SlideActionEditor";
import UrlActionEditor from "./UrlActionEditor";
import { Select, Option } from "@twilio-paste/core/select";
import { Stack } from "@twilio-paste/core/stack";

interface ActionEditorWidgetProps {
  action: Action;
  handleActionChange: (action: Action) => void;
  children?: React.ReactNode;
}

const ActionEditorWidget: React.FC<ActionEditorWidgetProps> = (props) => {
  const [action, setAction] = useState<Action>(props.action);

  useEffect(() => {
    props.handleActionChange(action);
  }, [action]);

  const handleActionTypeChange = (
    evt: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedType = evt.target.value as ActionType;
    const updatedAction: Action = { ...action, type: selectedType };
    setAction(updatedAction);
  };

  const handleActionChange = (act: Action) => {
    const updatedAction: Action = { ...action, ...act };
    setAction(updatedAction);
  };

  const Widget = () => {
    switch (props.action.type) {
      case ActionType.Slide:
        return (
          <SlideActionEditor
            action={props.action as SlideAction}
            handleActionChange={handleActionChange}
          />
        );
      case ActionType.URL:
        return (
          <UrlActionEditor
            action={props.action as UrlAction}
            handleActionChange={handleActionChange}
          />
        );
    }
  };

  const ActionTypeOptions = () =>
    (Object.keys(ActionType) as Array<keyof typeof ActionType>).map((key) => {
      if (key === ActionType.Unknown) return;
      return (
        <Option key={`action-type-${key as string}`} value={key as string}>
          {key as string}
        </Option>
      );
    });

  return (
    <Stack orientation="vertical" spacing="space30">
      <Widget />
      {props.action.type === ActionType.Unknown && (
        <Select value={props.action.type} onChange={handleActionTypeChange}>
          <ActionTypeOptions />
        </Select>
      )}
      {props.children}
    </Stack>
  );
};

export { ActionEditorWidget, SlideActionEditor, UrlActionEditor };
export default ActionEditorWidget;
