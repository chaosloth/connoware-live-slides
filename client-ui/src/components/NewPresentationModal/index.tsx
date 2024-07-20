import { Button } from "@twilio-paste/core/button";
import {
  Modal,
  ModalHeading,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalFooterActions,
} from "@twilio-paste/core/modal";
import { Form, FormControl } from "@twilio-paste/core/form";
import { Input } from "@twilio-paste/core/input";
import { Label } from "@twilio-paste/core/label";
import { useUID } from "@twilio-paste/core/dist/uid-library";
import React, { useState } from "react";

export interface SlideModalProps {
  isOpen: boolean;
  defaultTitle: string;
  handleCloseAction: () => void;
  handleSaveAction: (name: string) => void;
}

const NewPresentationModal: React.FC<SlideModalProps> = (props) => {
  // Modal properties
  const modalHeadingID = useUID();
  const [title, setTitle] = useState<string>(props.defaultTitle);

  const handleTitleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(evt.target.value);
  };

  return (
    <Modal
      ariaLabelledby={modalHeadingID}
      isOpen={props.isOpen}
      onDismiss={props.handleCloseAction}
      size="default"
    >
      <ModalHeader>
        <ModalHeading as="h3" id={modalHeadingID}>
          Create new presentation
        </ModalHeading>
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormControl>
            <Label htmlFor={"kind"}>Presentation Name</Label>
            <Input
              value={title}
              type={"text"}
              onChange={(evt) => handleTitleChange(evt)}
            ></Input>
          </FormControl>
        </Form>
      </ModalBody>
      <ModalFooter>
        <ModalFooterActions>
          <Button variant="secondary" onClick={props.handleCloseAction}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => props.handleSaveAction(title)}
          >
            Save
          </Button>
        </ModalFooterActions>
      </ModalFooter>
    </Modal>
  );
};

export default NewPresentationModal;
