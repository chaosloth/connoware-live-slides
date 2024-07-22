import React, { useEffect, useState } from "react";
import { IdentifyAction, UrlAction } from "../../types/LiveSlides";
import { Form, FormControl } from "@twilio-paste/core/form";
import { EditableCodeBlock } from "@twilio-paste/core";

import { useActionContext } from "@/app/context/ActionContext";

interface TrackActionEditorProps {}

const TrackActionEditor: React.FC<TrackActionEditorProps> = (
  props: TrackActionEditorProps
) => {
  const { action, setAction } = useActionContext();
  const [hasError, setHasError] = useState<boolean>(false);

  const handleActionPropertiesChange = (value: string | undefined) => {
    if (!value) {
      setHasError(true);
      return;
    }
    try {
      const properties = JSON.parse(value);
      setHasError(false);
      setAction((prev: IdentifyAction) => ({ ...prev, properties }));
    } catch (err) {
      setHasError(true);
    }
  };

  useEffect(() => {
    // Do something with the updated thing
    console.log(`TrackActionEditor - Updated action,`, action);
  }, [action]);

  return (
    <Form>
      <FormControl>
        <EditableCodeBlock
          height="20vh"
          language="json"
          defaultLanguage="json"
          defaultValue={JSON.stringify((action as IdentifyAction).properties)}
          onChange={handleActionPropertiesChange}
        />
      </FormControl>
    </Form>
  );
};

export default TrackActionEditor;
