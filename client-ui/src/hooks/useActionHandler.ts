"use client";

import { useCallback } from "react";
import { SyncClient } from "twilio-sync";
import { AnalyticsBrowser } from "@segment/analytics-next";
import {
  Action,
  Slide,
  LiveSlidePresentation,
} from "@/types/LiveSlides";
import {
  ActionType,
  isSlideAction,
  isTallyAction,
  isTrackAction,
  isStreamAction,
  isIdentifyAction,
  isUrlAction,
} from "@/types/ActionTypes";
import { Phase } from "@/types/Phases";
import { safeOpenUrl } from "@/utils/security";

interface UseActionHandlerProps {
  presentation?: LiveSlidePresentation;
  analytics: AnalyticsBrowser;
  identity?: string;
  userData: { [key: string]: string };
  stream?: any;
  onSlideChange?: (slide: Slide, phase: Phase) => void;
  onUserDataChange?: (data: { [key: string]: string }) => void;
}

/**
 * Custom hook to handle all action types in the application
 * Extracts the complex action handling logic from page components
 */
export function useActionHandler({
  presentation,
  analytics,
  identity,
  userData,
  stream,
  onSlideChange,
  onUserDataChange,
}: UseActionHandlerProps) {
  /**
   * Publishes an event to the Twilio Sync stream
   */
  const publishEventToStream = useCallback(
    (props: any) => {
      if (!stream) {
        console.warn("Stream not available for publishing event");
        return;
      }

      const evt = {
        sid: undefined, // Will be set by caller if needed
        ...props,
      };

      console.log(`[useActionHandler] Publishing event to stream`, evt);
      stream.publishMessage(evt);
    },
    [stream]
  );

  /**
   * Handles SlideAction - navigates to a specific slide
   */
  const handleSlideAction = useCallback(
    (action: Action) => {
      if (!isSlideAction(action)) return;

      console.log(`[handleSlideAction] Navigating to slide: ${action.slideId}`);

      const targetSlide = presentation?.slides.find(
        (p) => p.id === action.slideId
      );

      if (!targetSlide) {
        console.warn(`Slide not found: ${action.slideId}`);
        return;
      }

      console.log(`[handleSlideAction] Found target slide:`, targetSlide);

      if (onSlideChange && targetSlide.kind) {
        console.log(`[handleSlideAction] Calling onSlideChange`);
        onSlideChange(targetSlide, targetSlide.kind);
      } else {
        console.warn(`[handleSlideAction] Cannot change slide - onSlideChange: ${!!onSlideChange}, kind: ${targetSlide.kind}`);
      }
    },
    [presentation?.slides, onSlideChange]
  );

  /**
   * Handles TallyAction - records a vote or response
   */
  const handleTallyAction = useCallback(
    (action: Action) => {
      if (!isTallyAction(action)) return;

      publishEventToStream({
        type: action.type,
        answer: action.answer,
        client_id: identity?.split(":")[1] || identity,
      });
    },
    [publishEventToStream, identity]
  );

  /**
   * Handles TrackAction - sends analytics event
   */
  const handleTrackAction = useCallback(
    (action: Action, properties?: { [key: string]: any }) => {
      if (!isTrackAction(action)) return;

      console.log(`Track users activity`, action);

      // Cache data locally
      if (onUserDataChange) {
        onUserDataChange({ ...userData, ...action.properties });
      }

      // Send to Segment
      analytics.track(action.event, {
        ...action.properties,
        ...properties,
      });
    },
    [analytics, userData, onUserDataChange]
  );

  /**
   * Interpolates template strings with provided parameters
   * Used for StreamAction message templates
   */
  const interpolateString = useCallback(
    (template: string, params: { [key: string]: any }): string => {
      const names = Object.keys(params);
      const values = Object.values(params);

      try {
        return new Function(...names, `return \`${template}\`;`)(...values);
      } catch (err) {
        console.error(`Error interpolating string: "${template}"`, err);
        return template; // Return original if interpolation fails
      }
    },
    []
  );

  /**
   * Handles StreamAction - publishes message to stream with interpolation
   */
  const handleStreamAction = useCallback(
    (action: Action, properties?: { [key: string]: any }) => {
      if (!isStreamAction(action)) return;

      console.log(`Stream users activity`, action);

      try {
        console.log(`Interpolating string: ${action.message}`);
        const interpolatedMessage = interpolateString(action.message, {
          ...action,
          ...properties,
        });

        console.log(`Interpolation result: ${interpolatedMessage}`);

        publishEventToStream({
          type: action.type,
          message: interpolatedMessage,
          client_id: identity?.split(":")[1] || identity,
        });
      } catch (err) {
        console.error(`Error sending stream event`, err);
      }
    },
    [publishEventToStream, identity, interpolateString]
  );

  /**
   * Handles IdentifyAction - identifies user in analytics
   */
  const handleIdentifyAction = useCallback(
    (action: Action, properties?: { [key: string]: any }) => {
      if (!isIdentifyAction(action)) return;

      console.log(`Sending Identify (phone), action`, action, properties);

      analytics.identify(properties?.phone, {
        ...userData,
        ...action.properties,
        ...properties,
      });
    },
    [analytics, userData]
  );

  /**
   * Handles UrlAction - safely opens URL after validation
   */
  const handleUrlAction = useCallback((action: Action) => {
    if (!isUrlAction(action)) return;

    const success = safeOpenUrl(action.url, "_self");
    if (!success) {
      console.error(`Blocked invalid URL: ${action.url}`);
    }
  }, []);

  /**
   * Main action performer - dispatches actions to appropriate handlers
   */
  const performActions = useCallback(
    (actions: Action[], properties?: { [key: string]: any }) => {
      // Safety check for undefined or null actions
      if (!actions || !Array.isArray(actions)) {
        console.warn('performActions called with invalid actions:', actions);
        return;
      }

      console.log(`Performing [${actions.length}] actions`);

      actions.forEach((action) => {
        switch (action.type) {
          case ActionType.Slide:
            handleSlideAction(action);
            break;

          case ActionType.Tally:
            handleTallyAction(action);
            break;

          case ActionType.Track:
            handleTrackAction(action, properties);
            break;

          case ActionType.Stream:
            handleStreamAction(action, properties);
            break;

          case ActionType.Identify:
            handleIdentifyAction(action, properties);
            break;

          case ActionType.URL:
            handleUrlAction(action);
            break;

          default:
            console.warn(`[useActionHandler] Unknown action type`, action);
        }
      });
    },
    [
      handleSlideAction,
      handleTallyAction,
      handleTrackAction,
      handleStreamAction,
      handleIdentifyAction,
      handleUrlAction,
    ]
  );

  return {
    performActions,
    publishEventToStream,
  };
}
