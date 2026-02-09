/**
 * JSON Schema and validation for presentations
 */

import { Phase } from "@/types/Phases";
import { ActionType } from "@/types/ActionTypes";
import {
  LiveSlidePresentation,
  Slide,
  QuestionSlide,
  GateSlide,
  CtaSlide,
  WaitSlide,
  WebRtcSlide,
  EndedSlide,
  Action,
  Option,
} from "@/types/LiveSlides";

/**
 * Metadata for slide types - used in UI
 */
export interface SlideTypeMetadata {
  type: Phase;
  label: string;
  description: string;
  icon: string;
  category: "interactive" | "informational" | "transition";
}

/**
 * Metadata for action types - used in UI
 */
export interface ActionTypeMetadata {
  type: ActionType;
  label: string;
  description: string;
  requiresProperties: boolean;
  propertyHint?: string;
}

/**
 * All available slide types with metadata
 */
export const SLIDE_TYPES: SlideTypeMetadata[] = [
  {
    type: Phase.Question,
    label: "Question",
    description: "Ask the audience a question with multiple choice answers",
    icon: "InformationIcon",
    category: "interactive",
  },
  {
    type: Phase.Identify,
    label: "Identify",
    description: "Collect user information (phone, email)",
    icon: "ProductContactCenterAdminIcon",
    category: "interactive",
  },
  {
    type: Phase.DemoCta,
    label: "Call-to-Action",
    description: "Present buttons for the audience to take action",
    icon: "LinkExternalIcon",
    category: "interactive",
  },
  {
    type: Phase.WatchPresenter,
    label: "Watch Presenter",
    description: "Show a holding screen while presenter speaks",
    icon: "ShowIcon",
    category: "informational",
  },
  {
    type: Phase.WebRtc,
    label: "WebRTC",
    description: "Enable real-time communication features",
    icon: "FileVideoIcon",
    category: "interactive",
  },
  {
    type: Phase.Submitted,
    label: "Submitted",
    description: "Confirmation screen after submission",
    icon: "AcceptIcon",
    category: "transition",
  },
  {
    type: Phase.Ended,
    label: "End",
    description: "End of presentation screen",
    icon: "CheckboxCheckIcon",
    category: "transition",
  },
];

/**
 * All available action types with metadata
 */
export const ACTION_TYPES: ActionTypeMetadata[] = [
  {
    type: ActionType.Slide,
    label: "Navigate to Slide",
    description: "Navigate to a specific slide",
    requiresProperties: false,
  },
  {
    type: ActionType.Track,
    label: "Track Event",
    description: "Send an analytics event to Segment",
    requiresProperties: true,
    propertyHint: "Event name and properties to track",
  },
  {
    type: ActionType.Identify,
    label: "Identify User",
    description: "Identify user in analytics",
    requiresProperties: true,
    propertyHint: "User properties to identify",
  },
  {
    type: ActionType.Stream,
    label: "Stream Message",
    description: "Publish a message to the stream",
    requiresProperties: true,
    propertyHint: "Message template (use ${variable} for interpolation)",
  },
  {
    type: ActionType.URL,
    label: "Open URL",
    description: "Navigate to an external URL",
    requiresProperties: false,
  },
  {
    type: ActionType.Tally,
    label: "Record Vote",
    description: "Record a vote/response",
    requiresProperties: false,
  },
];

/**
 * Validation functions
 */

export function validateSlideId(id: string): { valid: boolean; error?: string } {
  if (!id || id.trim() === "") {
    return { valid: false, error: "Slide ID is required" };
  }
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    return {
      valid: false,
      error: "Slide ID can only contain letters, numbers, hyphens, and underscores",
    };
  }
  return { valid: true };
}

export function validateSlide(slide: Slide): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate ID
  const idValidation = validateSlideId(slide.id);
  if (!idValidation.valid && idValidation.error) {
    errors.push(idValidation.error);
  }

  // Validate title
  if (!slide.title || slide.title.trim() === "") {
    errors.push("Slide title is required");
  }

  // Validate kind
  if (!slide.kind) {
    errors.push("Slide type is required");
  }

  // Type-specific validation
  if (slide instanceof QuestionSlide) {
    if (!slide.options || slide.options.length === 0) {
      errors.push("Question slides must have at least one option");
    }
    if (slide.options) {
      slide.options.forEach((opt, idx) => {
        if (!opt.optionLabel || opt.optionLabel.trim() === "") {
          errors.push(`Option ${idx + 1} must have a label`);
        }
      });
    }
  }

  if (slide instanceof CtaSlide) {
    if (!slide.options || slide.options.length === 0) {
      errors.push("CTA slides must have at least one option");
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateAction(action: Action): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!action.type) {
    errors.push("Action type is required");
  }

  // Type-specific validation would go here
  // e.g., SlideAction needs slideId, TrackAction needs event name, etc.

  return { valid: errors.length === 0, errors };
}

export function validatePresentation(
  presentation: LiveSlidePresentation
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!presentation.title || presentation.title.trim() === "") {
    errors.push("Presentation title is required");
  }

  if (!presentation.slides || presentation.slides.length === 0) {
    errors.push("Presentation must have at least one slide");
  }

  // Validate each slide
  if (presentation.slides) {
    // Check for duplicate IDs
    const ids = presentation.slides.map((s) => s.id);
    const duplicates = ids.filter((id, idx) => ids.indexOf(id) !== idx);
    if (duplicates.length > 0) {
      errors.push(`Duplicate slide IDs found: ${duplicates.join(", ")}`);
    }

    // Validate each slide
    presentation.slides.forEach((slide, idx) => {
      const slideValidation = validateSlide(slide);
      if (!slideValidation.valid) {
        errors.push(`Slide ${idx + 1} (${slide.id}): ${slideValidation.errors.join(", ")}`);
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Factory functions for creating new slides
 */

export function createSlide(type: Phase, id: string): Slide {
  switch (type) {
    case Phase.Question:
      const questionSlide = new QuestionSlide(id, "", "");
      questionSlide.options = [];
      return questionSlide;

    case Phase.Identify:
      return new GateSlide(id, "", "");

    case Phase.DemoCta:
      const ctaSlide = new CtaSlide(id, "", "");
      ctaSlide.options = [];
      return ctaSlide;

    case Phase.WatchPresenter:
      return new WaitSlide(id, "", "");

    case Phase.WebRtc:
      return new WebRtcSlide(id, "", "");

    case Phase.Ended:
      const endedSlide = new EndedSlide(id, "", "");
      endedSlide.options = [];
      return endedSlide;

    default:
      return new Slide();
  }
}

/**
 * Helper to generate unique slide IDs
 */
export function generateSlideId(existingSlides: Slide[], prefix: string = "SLIDE"): string {
  let counter = 1;
  let id = `${prefix}-${counter}`;

  while (existingSlides.some((s) => s.id === id)) {
    counter++;
    id = `${prefix}-${counter}`;
  }

  return id;
}

/**
 * JSON Schema for presentations (for documentation and validation tools)
 */
export const presentationJsonSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Live Slides Presentation",
  type: "object",
  required: ["title", "slides"],
  properties: {
    title: {
      type: "string",
      description: "Presentation title",
      minLength: 1,
    },
    segmentWriteKey: {
      type: "string",
      description: "Segment analytics write key (optional)",
    },
    slides: {
      type: "array",
      description: "Array of slides",
      minItems: 1,
      items: {
        type: "object",
        required: ["id", "title", "kind"],
        properties: {
          id: {
            type: "string",
            pattern: "^[A-Za-z0-9_-]+$",
            description: "Unique slide identifier",
          },
          title: {
            type: "string",
            description: "Slide title shown to users",
          },
          description: {
            type: "string",
            description: "Slide description/content",
          },
          kind: {
            type: "string",
            enum: Object.values(Phase),
            description: "Type of slide",
          },
          options: {
            type: "array",
            description: "Options for interactive slides",
            items: {
              type: "object",
              required: ["optionLabel"],
              properties: {
                primary: {
                  type: "boolean",
                  description: "Is this a primary option",
                },
                optionLabel: {
                  type: "string",
                  description: "Label shown to user",
                },
                optionValue: {
                  type: "string",
                  description: "Value for this option",
                },
                afterSubmitActions: {
                  type: "array",
                  description: "Actions to execute when option is selected",
                },
              },
            },
          },
          afterSubmitActions: {
            type: "array",
            description: "Actions to execute after slide submission",
          },
        },
      },
    },
  },
};
