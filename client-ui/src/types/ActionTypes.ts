export enum ActionType {
  Track = "Track",
  Identify = "Identify",
  Slide = "Slide",
  URL = "URL",
  Tally = "Tally",
  Stream = "Stream",
  Unknown = "Unknown",
}

// Import Action types for type guards
import {
  Action,
  SlideAction,
  TallyAction,
  TrackAction,
  StreamAction,
  IdentifyAction,
  UrlAction,
} from "./LiveSlides";

/**
 * Type guard to check if an action is a SlideAction
 */
export function isSlideAction(action: Action): action is SlideAction {
  return action.type === ActionType.Slide;
}

/**
 * Type guard to check if an action is a TallyAction
 */
export function isTallyAction(action: Action): action is TallyAction {
  return action.type === ActionType.Tally;
}

/**
 * Type guard to check if an action is a TrackAction
 */
export function isTrackAction(action: Action): action is TrackAction {
  return action.type === ActionType.Track;
}

/**
 * Type guard to check if an action is a StreamAction
 */
export function isStreamAction(action: Action): action is StreamAction {
  return action.type === ActionType.Stream;
}

/**
 * Type guard to check if an action is an IdentifyAction
 */
export function isIdentifyAction(action: Action): action is IdentifyAction {
  return action.type === ActionType.Identify;
}

/**
 * Type guard to check if an action is a UrlAction
 */
export function isUrlAction(action: Action): action is UrlAction {
  return action.type === ActionType.URL;
}
