"use client";

import React, { FC, useCallback, useEffect, useState } from "react";
import { Stack } from "@twilio-paste/core/stack";
import {
  PageHeader,
  PageHeaderSetting,
  PageHeaderDetails,
  PageHeaderHeading,
  PageHeaderParagraph,
  PageHeaderActions,
} from "@twilio-paste/core/page-header";
import { useRouter } from "next/navigation";
import { SkeletonLoader } from "@twilio-paste/core/skeleton-loader";
import {
  Button,
  Modal,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalFooter,
  ModalFooterActions,
  TextArea,
  Label,
  FormControl,
} from "@twilio-paste/core";
import { Breadcrumb, BreadcrumbItem } from "@twilio-paste/core/breadcrumb";
import { useSyncClient } from "../../app/context/Sync";
import { PresentationMapItem } from "../../types/LiveSlides";
import LiveSlidesService from "../../utils/LiveSlidesService";
import PresentationList from "../../components/PresentationsList/PresentationsList";
import PresentationListEmpty from "../../components/PresentationsList/PresentationsListEmpty";
import NewPresentationModal from "../../components/NewPresentationModal";
import { ErrorMessage } from "@/components/ErrorBoundary";

const Dashboard: FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { client, state } = useSyncClient();
  const [items, setItems] = useState<PresentationMapItem[]>([]);
  const [isNewPresentationModalOpen, setNewPresentationModalOpen] =
    useState<boolean>(false);
  const [isAiModalOpen, setAiModalOpen] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const [code, setCode] = useState<string>("");

  const refreshData = useCallback(() => {
    if (!client) return;
    setLoading(true);
    setError(null);
    LiveSlidesService.getLiveSlides(client)
      .then((response) => {
        console.log(`Response after refreshing data`, response);
        setItems(response);
      })
      .catch((err) => {
        console.error(`Error fetching presentations`, err);
        setError(err instanceof Error ? err : new Error('Failed to load presentations'));
      })
      .finally(() => setLoading(false));

    console.log(`[/dashboard] Calling refreshData()`);
  }, [client]);

  useEffect(() => {
    refreshData();
  }, [client, refreshData]);

  const handleNewPresentation = () => {
    const code = LiveSlidesService.generateRandomCode();
    setCode(code);
    setNewPresentationModalOpen(true);
  };

  const handleAiGenerate = () => {
    setAiPrompt("");
    setAiModalOpen(true);
  };

  const handleGenerateWithAi = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-presentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate presentation');
      }

      const { presentation } = await response.json();
      const code = LiveSlidesService.generateRandomCode();

      await client?.map(LiveSlidesService.getPresentationMapName()).then((pMap) => {
        pMap.set(code, presentation);
        setAiModalOpen(false);
        router.push(`/visual-designer?pid=${code}`);
      });
    } catch (err) {
      console.error('Error generating presentation', err);
      setError(err instanceof Error ? err : new Error('Failed to generate presentation'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewPresentationAction = (title: string) => {
    setError(null);
    client
      ?.map(LiveSlidesService.getPresentationMapName())
      .then((pMap) => {
        pMap.set(code, {
          title,
          slides: [],
        });
        router.push(`/dashboard/designer?pid=${code}`);
      })
      .catch((err) => {
        console.error(`Error create new presentation entry`, err);
        setError(err instanceof Error ? err : new Error('Failed to create presentation'));
      });
  };

  const handleOpenPresenterView = (presentation: PresentationMapItem) => {
    router.push(`/presenter?pid=${presentation.key}`);
  };
  const handleMonitorPresentation = (presentation: PresentationMapItem) => {
    router.push(`/dashboard/monitor?pid=${presentation.key}`);
  };
  const handleEditPresentation = (presentation: PresentationMapItem) => {
    router.push(`/dashboard/designer?pid=${presentation.key}`);
  };
  const handleVisualDesigner = (presentation: PresentationMapItem) => {
    router.push(`/visual-designer?pid=${presentation.key}`);
  };
  const handleDeletePresentation = (presentation: PresentationMapItem) => {
    setError(null);
    client
      ?.map(LiveSlidesService.getPresentationMapName())
      .then((pMap) => pMap.remove(presentation.key))
      .then(() => refreshData())
      .catch((err) => {
        console.error(`Error deleting presentation`, err);
        setError(err instanceof Error ? err : new Error('Failed to delete presentation'));
      });
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
            <BreadcrumbItem>Dashboard</BreadcrumbItem>
          </Breadcrumb>
        </PageHeaderSetting>
        <PageHeaderDetails>
          <PageHeaderHeading>Live Slides Dashboard</PageHeaderHeading>
          <PageHeaderActions>
            <Stack orientation="horizontal" spacing="space40">
              <Button
                variant="secondary"
                onClick={() => router.push("/dashboard/admin-users")}
              >
                Manage Users
              </Button>
              <Button
                variant="secondary"
                disabled={loading}
                onClick={handleAiGenerate}
              >
                Create using AI
              </Button>
              <Button
                variant="primary"
                disabled={loading}
                onClick={handleNewPresentation}
              >
                Add new presentation
              </Button>
            </Stack>
          </PageHeaderActions>
          <PageHeaderParagraph>All the tools in one place</PageHeaderParagraph>
        </PageHeaderDetails>
      </PageHeader>
      <Stack orientation={"vertical"} spacing={"space40"}>
        {error && <ErrorMessage error={error} onRetry={refreshData} />}
        {loading && (
          <Stack orientation={"vertical"} spacing="space40">
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
          </Stack>
        )}
        {!loading && !error && items.length === 0 && (
          <PresentationListEmpty
            handleNewPresentation={handleNewPresentation}
          />
        )}
        {!error && items.length > 0 && (
          <PresentationList
            loading={loading}
            items={items}
            handleOpenPresenterView={handleOpenPresenterView}
            handleMonitorPresentation={handleMonitorPresentation}
            handleEditPresentation={handleEditPresentation}
            handleVisualDesigner={handleVisualDesigner}
            handleDeletePresentation={handleDeletePresentation}
            handleNewPresentation={handleNewPresentation}
          />
        )}
      </Stack>

      <NewPresentationModal
        isOpen={isNewPresentationModalOpen}
        handleCloseAction={() => setNewPresentationModalOpen(false)}
        handleSaveAction={(title) => handleNewPresentationAction(title)}
        defaultTitle={`New presentation`}
      />

      <Modal
        ariaLabelledby="ai-generate-modal"
        isOpen={isAiModalOpen}
        onDismiss={() => setAiModalOpen(false)}
        size="wide"
      >
        <ModalHeader>
          <ModalHeading as="h3" id="ai-generate-modal">
            Create Presentation with AI
          </ModalHeading>
        </ModalHeader>
        <ModalBody>
          <FormControl>
            <Label htmlFor="ai-prompt">
              Describe the presentation you want to create
            </Label>
            <TextArea
              id="ai-prompt"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Example: Create a presentation about the benefits of cloud computing with 5 slides including an introduction, 3 key benefits, and a conclusion"
              rows={6}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <ModalFooterActions>
            <Button variant="secondary" onClick={() => setAiModalOpen(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleGenerateWithAi} disabled={!aiPrompt.trim() || isGenerating} loading={isGenerating}>
              Generate Presentation
            </Button>
          </ModalFooterActions>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default Dashboard;
