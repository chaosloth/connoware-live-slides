import React, { useEffect } from "react";
import { UrlAction } from "../../types/LiveSlides";
import { Form, FormControl } from "@twilio-paste/core/form";
import { Label } from "@twilio-paste/core/label";
import { HelpText } from "@twilio-paste/core/help-text";
import { Input } from "@twilio-paste/core/input";
import { useActionContext } from "@/app/context/ActionContext";

interface UrlActionEditorProps {}

const UrlActionEditor: React.FC<UrlActionEditorProps> = (
  props: UrlActionEditorProps
) => {
  const { action, setAction } = useActionContext();

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = event.target.value;
    setAction((prev: UrlAction) => ({ ...prev, url: newUrl }));
  };

  useEffect(() => {
    // Do something with the updated URL
    console.log(`Updated url ${action.url}`);
  }, [action.url]);

  return (
    <Form>
      <FormControl>
        <Label htmlFor={`url-action-input`}>URL</Label>
        <Input
          id={`url-action-input`}
          type={"url"}
          value={action.url}
          onChange={handleUrlChange}
        ></Input>
        <HelpText>
          URL Actions will open in a new window. You can use tel:// to dial
          phone numbers, or https:// for websites
        </HelpText>
      </FormControl>
    </Form>
  );
};

export default UrlActionEditor;
