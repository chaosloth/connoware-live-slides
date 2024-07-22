import React, { useEffect, useState } from "react";
import {
  Action,
  IdentifyAction,
  SlideAction,
  TrackAction,
  UrlAction,
} from "../../types/LiveSlides";
import { ActionType } from "../../types/ActionTypes";
import SlideActionEditor from "./SlideActionEditor";
import UrlActionEditor from "./UrlActionEditor";
import TrackActionEditor from "./TrackActionEditor";
import { Select, Option } from "@twilio-paste/core/select";
import { Stack } from "@twilio-paste/core/stack";
import { ActionContext } from "../../app/context/ActionContext";

interface ActionEditorWidgetProps {
  children?: React.ReactNode;
  action: Action;
  updateAction: (action: Action) => void;
}

const ActionEditorWidget: React.FC<ActionEditorWidgetProps> = (props) => {
  const [action, setAction] = useState(props.action);

  useEffect(() => {
    console.log(`ActionEditorWidget - action updated`, action);
    props.updateAction(action);
  }, [action, props]);

  useEffect(() => {
    console.log(`ActionEditorWidget - props.action updated`, props.action);
  }, [props.action]);

  const handleActionTypeChange = (
    evt: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedType = evt.target.value;
    let newAction: Action;

    switch (selectedType) {
      case ActionType.Slide:
        newAction = new SlideAction();
        break;
      case ActionType.URL:
        newAction = new UrlAction();
        break;
      case ActionType.Identify:
        newAction = new IdentifyAction();
        break;
      case ActionType.Track:
        newAction = new TrackAction();
        break;
      default:
        newAction = { type: ActionType.Unknown };
        break;
    }

    console.log(`Created action`, newAction);
    setAction(newAction);
  };

  const Widget = () => {
    switch (action.type) {
      case ActionType.Slide:
        return <SlideActionEditor />;
      case ActionType.URL:
        return <UrlActionEditor />;
      case ActionType.Track:
      case ActionType.Identify:
        return <TrackActionEditor />;
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
    <ActionContext.Provider value={{ action, setAction }}>
      <Stack orientation="vertical" spacing="space30">
        <Widget />
        {props.action.type === ActionType.Unknown && (
          <Select value={props.action.type} onChange={handleActionTypeChange}>
            <Option key={`action-type-unknown`} value={ActionType.Unknown}>
              {" "}
              (Select action type)
            </Option>
            <ActionTypeOptions />
          </Select>
        )}
        {props.children}
      </Stack>
    </ActionContext.Provider>
  );
};

export default ActionEditorWidget;
