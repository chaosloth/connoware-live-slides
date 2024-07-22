"use client";

import React, { FC, useEffect, useState } from "react";
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
import { Button } from "@twilio-paste/core";
import { Breadcrumb, BreadcrumbItem } from "@twilio-paste/core/breadcrumb";
import { useSyncClient } from "../../app/context/Sync";
import { PresentationMapItem } from "../../types/LiveSlides";
import LiveSlidesService from "../../utils/LiveSlidesService";
import PresentationList from "../../components/PresentationsList/PresentationsList";
import PresentationListEmpty from "../../components/PresentationsList/PresentationsListEmpty";
import NewPresentationModal from "../../components/NewPresentationModal";

const Dashboard: FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { client, identity, state } = useSyncClient();
  const [items, setItems] = useState<PresentationMapItem[]>([]);
  const [isNewPresentationModalOpen, setNewPresentationModalOpen] =
    useState<boolean>(false);
  const router = useRouter();
  const [code, setCode] = useState<string>("");

  const refreshData = () => {
    if (!client) return;
    setLoading(true);
    LiveSlidesService.getLiveSlides(client)
      .then((response) => {
        console.log(`Response after refreshing data`, response);
        setItems(response);
      })
      .catch((err) => console.log(`Error fetching presentations`, err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refreshData();
  });

  const handleNewPresentation = () => {
    const code = LiveSlidesService.generateRandomCode();
    setCode(code);
    setNewPresentationModalOpen(true);
  };

  const handleNewPresentationAction = (title: string) => {
    client
      ?.map(LiveSlidesService.getPresentationMapName())
      .then((pMap) => {
        pMap.set(code, {
          title,
          slides: [],
        });
        router.push(`/dashboard/designer?pid=${code}`);
      })
      .catch((err) => console.warn(`Error create new presentation entry`, err));
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
  const handleDeletePresentation = (presentation: PresentationMapItem) => {
    client
      ?.map(LiveSlidesService.getPresentationMapName())
      .then((pMap) => pMap.remove(presentation.key))
      .then(() => refreshData())
      .catch((err) => console.warn(`Error create new presentation entry`, err));
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
            <Button
              variant="primary"
              disabled={loading}
              onClick={handleNewPresentation}
            >
              Add new presentation
            </Button>
          </PageHeaderActions>
          <PageHeaderParagraph>All the tools in one place</PageHeaderParagraph>
        </PageHeaderDetails>
      </PageHeader>
      <Stack orientation={"vertical"} spacing={"space40"}>
        {loading && (
          <Stack orientation={"vertical"} spacing="space40">
            <SkeletonLoader />
            <SkeletonLoader />
            <SkeletonLoader />
          </Stack>
        )}
        {!loading && items.length === 0 && (
          <PresentationListEmpty
            handleNewPresentation={handleNewPresentation}
          />
        )}
        {items.length > 0 && (
          <PresentationList
            loading={loading}
            items={items}
            handleOpenPresenterView={handleOpenPresenterView}
            handleMonitorPresentation={handleMonitorPresentation}
            handleEditPresentation={handleEditPresentation}
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
    </>
  );
};

export default Dashboard;
