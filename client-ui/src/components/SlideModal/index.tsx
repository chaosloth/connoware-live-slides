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
import { Select, Option } from "@twilio-paste/core/select";
import { Label } from "@twilio-paste/core/label";
import { Input } from "@twilio-paste/core/input";
import { Grid, Column } from "@twilio-paste/core/grid";
import { Box } from "@twilio-paste/core/box";
import { Text } from "@twilio-paste/core/text";
import { useUID } from "@twilio-paste/core/dist/uid-library";
import React, { useState } from "react";

export interface SlideModalProps {
  isOpen: boolean;
  handleCloseAction: () => void;
  handleSaveAction: () => void;
}

const SlideModal: React.FC<SlideModalProps> = (props) => {
  // Modal properties
  const modalHeadingID = useUID();
  const [id, setId] = useState<string>();
  const [title, setTitle] = useState<string>();
  const [kind, setKind] = useState<string>();
  const [description, setDescription] = useState<string>();

  const handleKindChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    setKind(evt.target.value);
  };

  const handleIdChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setId(evt.target.value);
  };

  const handleTitleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(evt.target.value);
  };

  const handleDescriptionChange = (
    evt: React.ChangeEvent<HTMLInputElement>
  ) => {
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
          Slide Editor
        </ModalHeading>
      </ModalHeader>
      <ModalBody>
        <Grid gutter="space50">
          <Column>
            <Form>
              <FormControl>
                <Label htmlFor={"kind"}>Kind</Label>
                <Select
                  id={"kind"}
                  name="kind"
                  onChange={(evt) => handleKindChange}
                >
                  <Option value="Welcome">Welcome</Option>
                  <Option value="Question">Question</Option>
                  <Option value="Submitted">Submitted</Option>
                  <Option value="Identify">Identification Gate</Option>
                  <Option value="DemoCta">CTA</Option>
                  <Option value="WatchPresenter">Watch Presenter</Option>
                  <Option value="WebRtc">WebRTC</Option>
                  <Option value="Ended">Ended</Option>
                </Select>
              </FormControl>
              <FormControl>
                <Label htmlFor={"id"}>ID</Label>
                <Input
                  value={id}
                  type={"text"}
                  onChange={(evt) => handleIdChange(evt)}
                ></Input>
              </FormControl>
              <FormControl>
                <Label htmlFor={"kind"}>Title</Label>
                <Input
                  value={title}
                  type={"text"}
                  onChange={(evt) => handleTitleChange(evt)}
                ></Input>
              </FormControl>

              <FormControl>
                <Label htmlFor={"kind"}>Description</Label>
                <Input
                  value={description}
                  type={"text"}
                  onChange={(evt) => handleDescriptionChange(evt)}
                ></Input>
              </FormControl>
            </Form>
          </Column>

          <Column>
            <Box
              backgroundColor="colorBackground"
              height="size20"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text as="p" textAlign="center">
                Widge preview
              </Text>
            </Box>
          </Column>
        </Grid>
      </ModalBody>
      <ModalFooter>
        <ModalFooterActions>
          <Button variant="secondary" onClick={props.handleCloseAction}>
            Close
          </Button>
          <Button variant="primary" onClick={props.handleSaveAction}>
            Add Slide
          </Button>
        </ModalFooterActions>
      </ModalFooter>
    </Modal>
  );
};

export default SlideModal;
