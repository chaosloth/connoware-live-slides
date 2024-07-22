import React, { useEffect } from "react";
import { Form, FormControl } from "@twilio-paste/core/form";
import { Label } from "@twilio-paste/core/label";
import { HelpText } from "@twilio-paste/core/help-text";
import { Select, Option } from "@twilio-paste/core/select";
import { usePresentationContext } from "@/app/context/Presentation";
import { useActionContext } from "@/app/context/ActionContext";
import { SlideAction } from "@/types/LiveSlides";

interface SlideActionEditorProps {}

const SlideActionEditor: React.FC<SlideActionEditorProps> = (
  props: SlideActionEditorProps
) => {
  const { presentation } = usePresentationContext();
  const { action, setAction } = useActionContext();

  const handleSetSlideKind = (slideId: string) => {
    setAction((prev: SlideAction) => ({ ...prev, slideId }));
  };

  if (!action) {
    console.log(`SlideActionEditor - Action is: `, action);
    return <div>No action has been set</div>;
  }

  return (
    <Form>
      <FormControl>
        <Label htmlFor={`slide-action-editor-select-slide`}>Select slide</Label>
        <Select
          id={"slide-action-editor-select-slide"}
          disabled={!presentation || presentation?.slides.length === 0}
          onChange={(evt) => handleSetSlideKind(evt.target.value)}
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
