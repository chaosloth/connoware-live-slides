"use client";

import React, { FC, useEffect, useState } from "react";
import {
  PageHeader,
  PageHeaderSetting,
  PageHeaderDetails,
  PageHeaderHeading,
  PageHeaderActions,
  PageHeaderParagraph,
} from "@twilio-paste/core/page-header";
import { Breadcrumb, BreadcrumbItem } from "@twilio-paste/core/breadcrumb";
import { Button } from "@twilio-paste/core/button";
import { Form, FormControl } from "@twilio-paste/core/form";
import { Input } from "@twilio-paste/core/input";
import { Stack } from "@twilio-paste/core/stack";
import { Label } from "@twilio-paste/core/label";
import { HelpText } from "@twilio-paste/core/help-text";
import { useRouter } from "next/navigation";
import LiveSlidesService from "@/utils/LiveSlidesService";
import { useSideModalState } from "@twilio-paste/core";
import { FileImageIcon } from "@twilio-paste/icons/esm/FileImageIcon";

import { usePresentationContext } from "@/app/context/Presentation";
import QRCodeModal from "@/components/QRCodeModal";
import { ButtonGroup } from "@twilio-paste/core/button-group";
import SlideDetailSideModal from "@/components/SlideDetailSideModal";
import { LiveSlidePresentation, Slide } from "@/types/LiveSlides";
import SlideList from "../../../components/SlideList/SlideList";
import { useSyncClient } from "../../context/Sync";

const Designer: FC = () => {
  const { client, identity, state } = useSyncClient();
  const { presentation, setPresentation } = usePresentationContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [pid, setPid] = useState<string>("");
  const [isQrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState<Slide>(new Slide());
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const sideModalState = useSideModalState({});
  const router = useRouter();

  const handelActivateSlide = (slide: Slide) => {
    if (!client) return;
    if (!pid) return;
    LiveSlidesService.activateSlideInPresentation(client, pid, slide.id)
      .then(() =>
        console.log(
          `[Dashboard/Designer] Updated presentation ${pid} state to slide ${slide.id}`
        )
      )
      .catch((err) =>
        console.log(`Something went wrong update presentation site`, err)
      );
  };

  const savePresentation = () => {
    if (!presentation) return;
    if (!client) return;
    setLoading(true);

    const newPresentation = { ...presentation };
    newPresentation.slides = slides;

    console.log(`Pre-save newPresentation`, newPresentation);

    LiveSlidesService.savePresentation(client, pid, newPresentation).finally(
      () => {
        setLoading(false);
        setIsDirty(false);
      }
    );
    console.log(`Saving preso`, newPresentation);
    setLoading(false);
  };

  /**
   *
   * Get the presentation id
   *
   */
  useEffect(() => {
    // Parse pid query parameter
    const searchParams = new URLSearchParams(document.location.search);
    const pid = searchParams.get("pid");

    if (!pid) {
      console.warn(`No PID passed in or found`);
      return;
    }
    setPid(pid);
  }, []);

  /**
   *
   * Fetch the presentation definition
   *
   */
  useEffect(() => {
    if (!client) return;
    if (!pid) return;
    setLoading(true);
    LiveSlidesService.getPresentation(client, pid)
      .then((response) => {
        console.log(
          `Received Map Item casting data to LiveSlidePresentation`,
          response
        );
        setPresentation(response.data as LiveSlidePresentation);
      })
      .catch((err) => console.log(`Error fetching presentations`, err))
      .finally(() => setLoading(false));
  }, [client, pid, setPresentation]);

  useEffect(() => {
    if (!presentation) return;
    if (!presentation.slides) return;
    console.log(
      `Updating current slides from presentation.sides`,
      presentation.slides
    );
    setSlides(presentation.slides);
  }, [presentation, presentation?.slides]);

  const handleNewSlide = () => {
    console.log(`Called - handleNewSlide`);
    setCurrentSlide(new Slide());
    sideModalState.show();
  };

  const handleOpenSlide = (slide: Slide) => {
    console.log(`Called - handleOpenSlide`, slide);
    setCurrentSlide(slide);
    sideModalState.show();
  };

  const handleDeleteSlide = (slide: Slide) => {
    console.log(`Called - handleDeleteSlide`);
    const updatedSlides = slides.filter((s) => s.id !== slide.id);
    console.log(`After delete filter`, updatedSlides);
    setSlides(updatedSlides);
    setIsDirty(true);
  };

  const handleSavePresentation = () => {
    console.log(`Called - handleSavePresentation`);
    if (!presentation) return;
    savePresentation();
  };

  const handleSaveSlideAction = () => {
    if (!currentSlide) return;
    const updatedSlides = slides.map((slide) =>
      slide.id === currentSlide.id ? currentSlide : slide
    );
    if (!slides.find((slide) => slide.id === currentSlide.id)) {
      updatedSlides.push(currentSlide);
    }
    setSlides(updatedSlides);
    sideModalState.hide();
  };

  const handleOnSlideUpdate = (slide: Slide) => {
    console.log(`Called - handleOnSlideUpdate`);
    setCurrentSlide(slide);
    setIsDirty(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!presentation) return;
    const newPresentation = { ...presentation };
    newPresentation.title = e.target.value;
    setPresentation(newPresentation);
    setIsDirty(true);
  };

  return (
    <>
      <PageHeader size="default">
        <PageHeaderSetting>
          <Breadcrumb>
            <BreadcrumbItem
              href="/"
              onClick={(e) => {
                e.preventDefault();
                router.push("/");
              }}
            >
              LiveSlides
            </BreadcrumbItem>
            <BreadcrumbItem
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                router.push("/dashboard");
              }}
            >
              Dashboard
            </BreadcrumbItem>
            <BreadcrumbItem>Designer</BreadcrumbItem>
          </Breadcrumb>
        </PageHeaderSetting>
        <PageHeaderDetails>
          <PageHeaderHeading>
            Live Slides Designer
            <FormControl>
              <Label htmlFor="presentation_id">Presentation Title</Label>
              <Input
                id="presentation_title"
                name="presentation_title"
                type="text"
                value={presentation?.title || ""}
                onChange={handleTitleChange}
              />
            </FormControl>
          </PageHeaderHeading>

          <PageHeaderActions>
            <Stack orientation={"horizontal"} spacing={"space40"}>
              <Form>
                <FormControl>
                  <Label htmlFor="presentation_id">Presentation ID</Label>
                  <Input
                    aria-describedby="presentation_id_help_text"
                    id="presentation_id"
                    name="presentation_id"
                    type="text"
                    value={pid}
                    readOnly
                    insertAfter={
                      <Button
                        variant="link"
                        onClick={() => setQrModalOpen(true)}
                      >
                        <FileImageIcon
                          decorative={false}
                          size="sizeIcon20"
                          title="Get QR Code"
                        />
                      </Button>
                    }
                  />
                  <HelpText id="presentation_id_help_text">
                    Auto generated
                  </HelpText>
                </FormControl>
              </Form>
              <ButtonGroup>
                <Button
                  variant="destructive"
                  onClick={handleSavePresentation}
                  disabled={loading || !isDirty}
                >
                  Save
                </Button>

                <Button
                  variant="primary"
                  onClick={handleNewSlide}
                  disabled={loading}
                >
                  New Slide
                </Button>
              </ButtonGroup>
            </Stack>
          </PageHeaderActions>
          <PageHeaderParagraph>
            Use this editor to create Live Slides, these are composed of
            multiple Slides that can be triggered by the presenter. Start by
            creating the first slide.
          </PageHeaderParagraph>
        </PageHeaderDetails>
      </PageHeader>

      <Stack orientation={"vertical"} spacing={"space40"}>
        <SlideList
          loading={loading}
          slides={slides}
          handleOpenSlide={handleOpenSlide}
          handleDeleteSlide={handleDeleteSlide}
          handleNewSlide={handleNewSlide}
          handelActivateSlide={handelActivateSlide}
        />
      </Stack>

      <QRCodeModal
        presentationId={pid}
        isOpen={isQrModalOpen}
        handleCloseAction={() => setQrModalOpen(false)}
      />

      <SlideDetailSideModal
        state={sideModalState}
        handleCloseAction={() => sideModalState.hide()}
        handleSaveAction={handleSaveSlideAction}
        handleOnSlideUpdate={handleOnSlideUpdate}
        slide={currentSlide}
      />
    </>
  );
};

export default Designer;
