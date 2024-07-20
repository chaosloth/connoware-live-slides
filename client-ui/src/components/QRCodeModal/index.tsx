import { Button } from "@twilio-paste/core/button";
import {
  Modal,
  ModalHeading,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalFooterActions,
} from "@twilio-paste/core/modal";
import { Flex } from "@twilio-paste/core/flex";
import { useUID } from "@twilio-paste/core/dist/uid-library";
import { Form, FormControl } from "@twilio-paste/core/form";
import { Label } from "@twilio-paste/core/label";
import { Input } from "@twilio-paste/core/input";
import { Stack } from "@twilio-paste/core/stack";
import { HelpText } from "@twilio-paste/core/help-text";
import { LinkIcon } from "@twilio-paste/icons/esm/LinkIcon";
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";

export interface QRCodeModalProps {
  presentationId: string;
  isOpen: boolean;
  handleCloseAction: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = (props) => {
  // Modal properties
  const modalHeadingID = useUID();

  // QR Code
  const [code, setCode] = useState<string>("");

  useEffect(() => {
    setCode(window.origin + "?pid=" + props.presentationId);
  }, [props.presentationId]);

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(
      window.origin + "?pid=" + props.presentationId
    );
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
          QR Code for presentation {props.presentationId}
        </ModalHeading>
      </ModalHeader>
      <ModalBody>
        <Flex vAlignContent={"center"} hAlignContent={"center"}>
          <Stack orientation={"vertical"} spacing={"space40"}>
            <QRCode value={code} />
            <Form>
              <FormControl>
                <Label htmlFor="presentation_url">Audience Link</Label>
                <Input
                  aria-describedby="presentation_url_help_text"
                  id="presentation_url"
                  name="presentation_url"
                  type="text"
                  value={code}
                  readOnly
                  insertAfter={
                    <Button
                      variant="link"
                      onClick={() => copyLinkToClipboard()}
                    >
                      <LinkIcon
                        decorative={false}
                        size="sizeIcon20"
                        title="Copy link to clipboard"
                      />
                    </Button>
                  }
                />
                <HelpText id="presentation_url_help_text">
                  Share this with the audience
                </HelpText>
              </FormControl>
            </Form>
          </Stack>
        </Flex>
      </ModalBody>
      <ModalFooter>
        <ModalFooterActions>
          <Button variant="primary" onClick={props.handleCloseAction}>
            Close
          </Button>
        </ModalFooterActions>
      </ModalFooter>
    </Modal>
  );
};

export default QRCodeModal;
