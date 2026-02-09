"use client";

import React, { FC, useEffect, useState, useCallback } from "react";
import {
  PageHeader,
  PageHeaderSetting,
  PageHeaderDetails,
  PageHeaderHeading,
  PageHeaderActions,
} from "@twilio-paste/core/page-header";
import { Breadcrumb, BreadcrumbItem } from "@twilio-paste/core/breadcrumb";
import { Button } from "@twilio-paste/core/button";
import { Form, FormControl } from "@twilio-paste/core/form";
import { Input } from "@twilio-paste/core/input";
import { Stack } from "@twilio-paste/core/stack";
import { Label } from "@twilio-paste/core/label";
import { HelpText } from "@twilio-paste/core/help-text";
import {
  Box,
  Separator,
  Modal,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalFooter,
  ModalFooterActions,
  Text,
} from "@twilio-paste/core";
import { useRouter } from "next/navigation";
import { FileImageIcon } from "@twilio-paste/icons/esm/FileImageIcon";
import { ChevronDoubleRightIcon } from "@twilio-paste/icons/esm/ChevronDoubleRightIcon";

import LiveSlidesService from "@/utils/LiveSlidesService";
import { usePresentationContext } from "@/app/context/Presentation";
import { useSyncClient } from "@/app/context/Sync";
import QRCodeModal from "@/components/QRCodeModal";
import { LiveSlidePresentation, Slide } from "@/types/LiveSlides";
import { SlideListEditor } from "@/components/SlideListEditor";
import { SlideTypeSelector } from "@/components/SlideTypeSelector";
import { SlideEditor } from "@/components/SlideEditor";
import { RealSlidePreview } from "@/components/SlidePreview/RealPreview";
import { Phase } from "@/types/Phases";
import { createSlide, generateSlideId } from "@/schemas/presentationSchema";
import { ErrorMessage } from "@/components/ErrorBoundary";

const VisualDesigner: FC = () => {
  const { client } = useSyncClient();
  const { presentation, setPresentation } = usePresentationContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [pid, setPid] = useState<string>("");
  const [isQrModalOpen, setQrModalOpen] = useState<boolean>(false);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState<Slide | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isNewSlideModalOpen, setNewSlideModalOpen] = useState<boolean>(false);
  const [selectedSlideType, setSelectedSlideType] = useState<Phase | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isSlideListCollapsed, setSlideListCollapsed] = useState<boolean>(false);
  const router = useRouter();

  /**
   * Get the presentation id
   */
  useEffect(() => {
    const searchParams = new URLSearchParams(document.location.search);
    const pid = searchParams.get("pid");

    if (!pid) {
      console.warn(`No PID passed in or found`);
      setError(new Error("No presentation ID provided"));
      return;
    }
    setPid(pid);
  }, []);

  /**
   * Fetch the presentation definition
   */
  useEffect(() => {
    if (!client) return;
    if (!pid) return;

    setLoading(true);
    setError(null);

    LiveSlidesService.getPresentation(client, pid)
      .then((response) => {
        console.log(`Received presentation data`, response);
        setPresentation(response.data as LiveSlidePresentation);
      })
      .catch((err) => {
        console.error(`Error fetching presentation`, err);
        setError(err instanceof Error ? err : new Error("Failed to load presentation"));
      })
      .finally(() => setLoading(false));
  }, [client, pid, setPresentation]);

  useEffect(() => {
    if (!presentation) return;
    if (!presentation.slides) return;
    setSlides(presentation.slides);
  }, [presentation]);

  const savePresentation = useCallback(() => {
    if (!presentation) return;
    if (!client) return;

    setLoading(true);
    setError(null);

    const newPresentation = { ...presentation, slides };

    LiveSlidesService.savePresentation(client, pid, newPresentation)
      .then(() => {
        setIsDirty(false);
        console.log(`Presentation saved successfully`);
      })
      .catch((err) => {
        console.error(`Error saving presentation`, err);
        setError(err instanceof Error ? err : new Error("Failed to save presentation"));
      })
      .finally(() => setLoading(false));
  }, [presentation, client, pid, slides]);

  const handleNewSlide = () => {
    setSelectedSlideType(null);
    setNewSlideModalOpen(true);
  };

  const handleSelectSlide = (slide: Slide) => {
    setCurrentSlide(slide);
    setSlideListCollapsed(true);
  };

  const handleCreateSlideWithType = () => {
    if (!selectedSlideType) return;

    const newId = generateSlideId(slides);
    const newSlide = createSlide(selectedSlideType, newId);

    setCurrentSlide(newSlide);
    setNewSlideModalOpen(false);
    setIsDirty(true);
  };

  const handleSaveSlide = (slideToSave?: Slide) => {
    const slide = slideToSave || currentSlide;
    if (!slide) return;

    const existingIndex = slides.findIndex((s) => s.id === slide.id);

    if (existingIndex >= 0) {
      // Update existing slide
      const updatedSlides = [...slides];
      updatedSlides[existingIndex] = slide;
      setSlides(updatedSlides);
    } else {
      // Add new slide
      setSlides([...slides, slide]);
    }

    setIsDirty(true);
  };

  const handleSlideChange = (updatedSlide: Slide) => {
    setCurrentSlide(updatedSlide);
    handleSaveSlide(updatedSlide);
  };

  const handleReorderSlide = (fromIndex: number, toIndex: number) => {
    const newSlides = [...slides];
    const [movedSlide] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, movedSlide);
    setSlides(newSlides);
    setIsDirty(true);
  };

  const handleCloneSlide = (slide: Slide) => {
    const clonedSlide = JSON.parse(JSON.stringify(slide));
    const newId = generateSlideId([...slides, clonedSlide]);
    clonedSlide.id = newId;
    clonedSlide.title = `${slide.title || slide.id} (Copy)`;

    const slideIndex = slides.findIndex((s) => s.id === slide.id);
    const updatedSlides = [...slides];
    updatedSlides.splice(slideIndex + 1, 0, clonedSlide);
    setSlides(updatedSlides);
    setIsDirty(true);
    setCurrentSlide(clonedSlide);
  };

  const handleDeleteSlide = (slide: Slide) => {
    if (confirm(`Are you sure you want to delete slide "${slide.title || slide.id}"?`)) {
      const updatedSlides = slides.filter((s) => s.id !== slide.id);
      setSlides(updatedSlides);
      setIsDirty(true);

      if (currentSlide?.id === slide.id) {
        setCurrentSlide(null);
      }
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!presentation) return;
    const newPresentation = { ...presentation, title: e.target.value };
    setPresentation(newPresentation);
    setIsDirty(true);
  };

  const handleWriteKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!presentation) return;
    const newPresentation = { ...presentation, segmentWriteKey: e.target.value };
    setPresentation(newPresentation);
    setIsDirty(true);
  };

  const handleActivateSlide = (slide: Slide) => {
    if (!client || !pid) return;

    LiveSlidesService.activateSlideInPresentation(client, pid, slide.id)
      .then(() => {
        console.log(`Activated slide ${slide.id}`);
      })
      .catch((err) => {
        console.error(`Error activating slide`, err);
        setError(err instanceof Error ? err : new Error("Failed to activate slide"));
      });
  };

  return (
    <>
      <style jsx>{`
        :global([data-paste-element="PAGE_HEADER_DETAILS"]) {
          margin-bottom: 0 !important;
        }
      `}</style>
      <Box
        marginTop={["space10", "space60"]}
        backgroundColor={"colorBackgroundBody"}
        paddingLeft="space60"
        paddingRight="space60"
        paddingTop="space70"
        paddingBottom="space40"
        borderBottomWidth="borderWidth10"
        borderBottomStyle="solid"
        borderBottomColor="colorBorder"
      >
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
              <BreadcrumbItem>Visual Designer</BreadcrumbItem>
            </Breadcrumb>
          </PageHeaderSetting>

          <PageHeaderDetails>
            <PageHeaderHeading>
              <FormControl>
                <Label htmlFor="presentation_title">Presentation Title</Label>
                <Input
                  id="presentation_title"
                  name="presentation_title"
                  type="text"
                  value={presentation?.title || ""}
                  onChange={handleTitleChange}
                  placeholder="Enter presentation title"
                />
              </FormControl>
            </PageHeaderHeading>

            <PageHeaderActions>
              <Stack orientation="horizontal" spacing="space40">
                <Form>
                  <FormControl>
                    <Label htmlFor="segment_write_key">Segment Write Key</Label>
                    <Input
                      id="segment_write_key"
                      name="segment_write_key"
                      type="text"
                      value={presentation?.segmentWriteKey || ""}
                      onChange={handleWriteKeyChange}
                      placeholder="Optional"
                    />
                    <HelpText>Defaults to global key</HelpText>
                  </FormControl>
                </Form>

                <FormControl>
                  <Label htmlFor="presentation_id">Presentation ID</Label>
                  <Input
                    id="presentation_id"
                    name="presentation_id"
                    type="text"
                    value={pid}
                    readOnly
                    insertAfter={
                      <Button variant="link" onClick={() => setQrModalOpen(true)}>
                        <FileImageIcon decorative={false} size="sizeIcon20" title="Get QR Code" />
                      </Button>
                    }
                  />
                  <HelpText>Auto generated</HelpText>
                </FormControl>

                <Box display="flex" alignItems="flex-end">
                  <Button variant="primary" onClick={savePresentation} disabled={loading || !isDirty} loading={loading}>
                    {isDirty ? "Save Changes" : "Saved"}
                  </Button>
                </Box>
              </Stack>
            </PageHeaderActions>
          </PageHeaderDetails>
        </PageHeader>
      </Box>

      {error && (
        <Box paddingLeft="space60" paddingRight="space60" paddingTop="space30">
          <ErrorMessage error={error} onRetry={() => window.location.reload()} />
        </Box>
      )}

      {/* Main content area with connected panels */}
      <Box display="flex" height="100vh" backgroundColor="colorBackgroundBody">
        {/* Left sidebar: Slide list */}
        {isSlideListCollapsed && currentSlide ? (
          <Box
            width="50px"
            backgroundColor="colorBackgroundWeak"
            borderRightWidth="borderWidth10"
            borderRightStyle="solid"
            borderRightColor="colorBorder"
            padding="space30"
          >
            <Box display="flex" flexDirection="column" alignItems="center" rowGap="space40">
              <Button
                variant="link"
                size="icon_small"
                onClick={() => setSlideListCollapsed(false)}
                title="Expand slide list"
              >
                <ChevronDoubleRightIcon decorative={false} title="Expand" />
              </Button>
              <Separator orientation="horizontal" />
              <Text as="p" fontSize="fontSize20" color="colorTextWeak" style={{ writingMode: "vertical-rl" }}>
                {slides.length} Slides
              </Text>
            </Box>
          </Box>
        ) : (
          <Box
            width="420px"
            backgroundColor="colorBackgroundWeak"
            borderRightWidth="borderWidth10"
            borderRightStyle="solid"
            borderRightColor="colorBorder"
            overflowY="auto"
            padding="space40"
          >
            <SlideListEditor
              slides={slides}
              selectedSlideId={currentSlide?.id}
              onSelectSlide={handleSelectSlide}
              onReorderSlide={handleReorderSlide}
              onDeleteSlide={handleDeleteSlide}
              onCloneSlide={handleCloneSlide}
              onAddSlide={handleNewSlide}
              isCollapsed={isSlideListCollapsed}
              onToggleCollapse={() => setSlideListCollapsed(!isSlideListCollapsed)}
            />
          </Box>
        )}

        {/* Middle panel: Editor */}
        <Box
          flex="1"
          backgroundColor="colorBackgroundBody"
          borderRightWidth="borderWidth10"
          borderRightStyle="solid"
          borderRightColor="colorBorder"
          overflowY="auto"
        >
          {currentSlide ? (
            <Box>
              <Box
                padding="space40"
                backgroundColor="colorBackgroundWeak"
                borderBottomWidth="borderWidth10"
                borderBottomStyle="solid"
                borderBottomColor="colorBorder"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Text as="p" fontWeight="fontWeightSemibold" fontSize="fontSize40">
                  Edit Slide
                </Text>
                <Button variant="primary" size="small" onClick={() => handleActivateSlide(currentSlide)}>
                  Activate
                </Button>
              </Box>
              <Box padding="space60">
                <SlideEditor slide={currentSlide} onChange={handleSlideChange} allSlides={slides} />
              </Box>
            </Box>
          ) : (
            <Box
              padding="space100"
              textAlign="center"
              height="100%"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Stack orientation="vertical" spacing="space40">
                <Text as="p" fontSize="fontSize50">
                  👈
                </Text>
                <Text as="p" color="colorTextWeak">
                  Select a slide to edit or add a new one
                </Text>
                <Button variant="primary" onClick={handleNewSlide}>
                  Add New Slide
                </Button>
              </Stack>
            </Box>
          )}
        </Box>

        {/* Right panel: Preview */}
        <Box width="450px" backgroundColor="colorBackgroundBody" overflowY="auto" padding="space60">
          <RealSlidePreview slide={currentSlide || new Slide()} />
        </Box>
      </Box>

      {/* New Slide Modal */}
      <Modal
        ariaLabelledby="new-slide-modal"
        isOpen={isNewSlideModalOpen}
        onDismiss={() => setNewSlideModalOpen(false)}
        size="wide"
      >
        <ModalHeader>
          <ModalHeading as="h3" id="new-slide-modal">
            Choose Slide Type
          </ModalHeading>
        </ModalHeader>
        <ModalBody>
          <SlideTypeSelector onSelect={setSelectedSlideType} selectedType={selectedSlideType || undefined} />
        </ModalBody>
        <ModalFooter>
          <ModalFooterActions>
            <Button variant="secondary" onClick={() => setNewSlideModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateSlideWithType} disabled={!selectedSlideType}>
              Create Slide
            </Button>
          </ModalFooterActions>
        </ModalFooter>
      </Modal>

      <QRCodeModal presentationId={pid} isOpen={isQrModalOpen} handleCloseAction={() => setQrModalOpen(false)} />
    </>
  );
};

export default VisualDesigner;
