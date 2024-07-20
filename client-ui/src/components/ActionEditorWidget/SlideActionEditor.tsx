import React, { useEffect } from "react";
import { Action, SlideAction } from "../../types/LiveSlides";
import { Form, FormControl } from "@twilio-paste/core/form";
import { Label } from "@twilio-paste/core/label";
import { HelpText } from "@twilio-paste/core/help-text";
import { Select, Option } from "@twilio-paste/core/select";
import { usePresentationContext } from "../../app/context/Presentation";

interface SlideActionEditorProps {
  action: SlideAction;
  handleActionChange: (action: Action) => void;
}

const SlideActionEditor: React.FC<SlideActionEditorProps> = (
  props: SlideActionEditorProps
) => {
  const { presentation } = usePresentationContext();
  const [action, setAction] = React.useState(props.action || new SlideAction());

  const handleSlideChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSlideId = event.target.value;
    const selectedSlide = presentation?.slides.find(
      (slide) => slide.id === selectedSlideId
    );
    if (selectedSlide) {
      const updatedAction: SlideAction = {
        ...action,
        slideId: selectedSlideId,
      };
      setAction(updatedAction);
      props.handleActionChange(updatedAction);
    }
  };

  return (
    <Form>
      <FormControl>
        <Label htmlFor={`slide-action-editor-select-slide`}>Select slide</Label>
        <Select
          id={"slide-action-editor-select-slide"}
          disabled={!presentation || presentation?.slides.length === 0}
          onChange={handleSlideChange}
          value={action.slideId}
        >
          {presentation?.slides.map((slide, idx) => (
            <Option key={`slide-${idx}`} value={slide.id}>
              {slide.kind} - {slide.title}
            </Option>
          )) ?? []}
        </Select>
        {!presentation || presentation?.slides.length === 0 ? (
          <HelpText variant="error">
            There are no slides in this presentation
          </HelpText>
        ) : (
          <HelpText>The user will be navigated to this slide</HelpText>
        )}
      </FormControl>
    </Form>
  );
};

export default SlideActionEditor;
