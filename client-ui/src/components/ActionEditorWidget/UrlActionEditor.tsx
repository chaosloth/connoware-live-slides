import React, { useEffect } from "react";
import { Action, UrlAction } from "../../types/LiveSlides";
import { Form, FormControl } from "@twilio-paste/core/form";
import { Label } from "@twilio-paste/core/label";
import { HelpText } from "@twilio-paste/core/help-text";
import { Input } from "@twilio-paste/core/input";
import { usePresentationContext } from "../../app/context/Presentation";

interface UrlActionEditorProps {
  action: UrlAction;
  handleActionChange: (action: Action) => void;
}

const UrlActionEditor: React.FC<UrlActionEditorProps> = (
  props: UrlActionEditorProps
) => {
  const [action, setAction] = React.useState(props.action);

  useEffect(() => {
    props.handleActionChange(action);
  }, [action]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAction({ ...action, url: event.target.value });
  };

  return (
    <Form>
      <FormControl>
        <Label>Select slide</Label>
        <Input type={"url"} onChange={handleInputChange}></Input>
        <HelpText>
          URL Actions will open in a new window. You can use tel:// to dial
          phone numbers, or https:// for websites
        </HelpText>
      </FormControl>
    </Form>
  );
};

export default UrlActionEditor;
