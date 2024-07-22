import React, { useEffect, useState } from "react";
import { IdentifyAction, Slide, UrlAction } from "../../types/LiveSlides";
import { Form, FormControl } from "@twilio-paste/core/form";
import { EditableCodeBlock, HelpText } from "@twilio-paste/core";

interface SlideCodePanelProps {
  slide: Slide;
  handleChangeSlideCode: (slide: Slide) => void;
}

const SlideCodePanel: React.FC<SlideCodePanelProps> = (
  props: SlideCodePanelProps
) => {
  const [hasError, setHasError] = useState<boolean>(false);

  const handleActionPropertiesChange = (value: string | undefined) => {
    if (!value) {
      setHasError(true);
      return;
    }
    try {
      const slideAsJson = JSON.parse(value);
      setHasError(false);
      props.handleChangeSlideCode(slideAsJson);
    } catch (err) {
      setHasError(true);
    }
  };

  return (
    <Form>
      <FormControl>
        <EditableCodeBlock
          height="45vh"
          language="json"
          defaultLanguage="json"
          lineNumbers="on"
          folding={true}
          indentationGuide={true}
          value={JSON.stringify(props.slide, null, 2)}
          onChange={handleActionPropertiesChange}
        />
        <HelpText variant="error"> Error with above JSON</HelpText>
      </FormControl>
    </Form>
  );
};

export default SlideCodePanel;
