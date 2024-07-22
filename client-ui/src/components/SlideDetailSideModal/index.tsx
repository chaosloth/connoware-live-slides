import { Button } from "@twilio-paste/core/button";
import {
  SideModal,
  SideModalHeading,
  SideModalHeader,
  SideModalBody,
  SideModalContainer,
  SideModalFooter,
  SideModalFooterActions,
} from "@twilio-paste/core/side-modal";

import SlideEditorWidget from "@/components/SlideEditorWidget";
import { Box } from "@twilio-paste/core/box";
import { useUID } from "@twilio-paste/core/dist/uid-library";
import React, { useState } from "react";
import { Slide } from "@/types/LiveSlides";

export interface SlideModalProps {
  state: any;
  slide: Slide;
  handleCloseAction: () => void;
  handleSaveAction: () => void;
  handleOnSlideUpdate: (slide: Slide) => void;
}

const SlideDetailSideModal: React.FC<SlideModalProps> = (props) => {
  // Modal properties
  const modalHeadingID = useUID();
  return (
    <Box display="flex" flexDirection="row" columnGap="space70">
      <SideModalContainer state={props.state}>
        <SideModal aria-label={""}>
          <SideModalHeader>
            <SideModalHeading as="h3" id={modalHeadingID}>
              Slide Editor
            </SideModalHeading>
          </SideModalHeader>
          <SideModalBody>
            <SlideEditorWidget
              slide={props.slide}
              onSlideUpdate={props.handleOnSlideUpdate}
            />
          </SideModalBody>
          <SideModalFooter>
            <SideModalFooterActions>
              <Button variant="primary" onClick={props.handleSaveAction}>
                Save
              </Button>
            </SideModalFooterActions>
          </SideModalFooter>
        </SideModal>
      </SideModalContainer>
    </Box>
  );
};

export default SlideDetailSideModal;
