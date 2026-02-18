// Import types
import "@twilio-labs/serverless-runtime-types";
import { ServerlessCallback, ServerlessFunctionSignature } from '@twilio-labs/serverless-runtime-types/types';
import { Context } from '../../types/context';
import OpenAI from 'openai';

interface GeneratePresentationEvent {
  prompt?: string;
  [key: string]: any;
}

const SYSTEM_PROMPT = `You are an expert presentation designer. Generate interactive presentation slide decks in JSON format based on user requirements.

The presentation should follow this structure:
- title: string (presentation title)
- slides: array of slide objects

Available slide types:
1. "Question" - Multiple choice questions with options
   - Fields: id, kind="Question", title (question text), description (optional context), options[]
   - Each option has: optionLabel, optionValue, primary (boolean), afterSubmitActions[]
   - Use for: Polling audience, gathering opinions, interactive quizzes

2. "Identify" - Collect user information
   - Fields: id, kind="Identify", title, description, afterSubmitActions[]
   - MUST include three afterSubmitActions in this order:
     a) Identify action with userProperties containing demo name
     b) Stream action with personalized greeting message
     c) Slide action to navigate to next slide
   - Use for: Gating content, collecting phone/email, user registration

3. "DemoCta" - Call-to-action with buttons
   - Fields: id, kind="DemoCta", title, description, options[]
   - Each option has: optionLabel, optionValue, primary (boolean), afterSubmitActions[]
   - Use for: Directing users to external resources, offering multiple paths

4. "WatchPresenter" - Holding screen while presenter speaks
   - Fields: id, kind="WatchPresenter", title, description
   - Use for: Informational slides, presenter-focused moments, transitions

5. "WebRtc" - Real-time communication features
   - Fields: id, kind="WebRtc", title, description
   - Use for: Video/audio communication, live streaming features

6. "Submitted" - Confirmation screen after submission
   - Fields: id, kind="Submitted", title, description
   - Use for: Thank you pages, confirmation messages, post-submission feedback

7. "Ended" - End of presentation screen
   - Fields: id, kind="Ended", title, description, options[]
   - Use for: Final slide, wrap-up, next steps

8. "Freeform" - Text input from users
   - Fields: id, kind="Freeform", title, description, prompt, placeholder, submitButtonLabel, afterSubmitActions[]
   - prompt: The label/question shown above the text input field (required)
   - placeholder: Optional placeholder text shown inside the input field
   - submitButtonLabel: Text for submit button (defaults to "Submit")
   - Use for: Collecting open-ended feedback, comments, suggestions, free text responses

Available action types for afterSubmitActions:
- "Slide" - Navigate to another slide (requires slideId)
- "Track" - Track analytics event (requires event name related to the question being asked and properties containing the full question text and answer, NOT just questionId)
- "URL" - Open external URL (requires url)
- "Stream" - Send message to stream (requires message)
- "Tally" - Record vote/response (requires answer field matching the option's optionLabel)
- "Identify" - Identify user in analytics (requires userProperties object)

IMPORTANT:
- ALL question slide options MUST include a Tally action to record the user's vote.
- ALL Identify slides MUST include Identify, Stream, and Slide actions in afterSubmitActions.

Best practices:
1. Use clear, engaging slide IDs like "intro", "q1", "benefits", "conclusion"
2. Link slides together using Slide actions
3. Add Track actions for important interactions, with event name related to the question (e.g., "Color Preference") and properties containing the full question text and answer (e.g., {"question": "What is your favorite color?", "favorite_color": "Pink"})
4. Keep questions focused with 2-4 options
5. Include an "Ended" slide at the end
6. Make primary option buttons visually distinct (primary: true)
7. Link question options to relevant next slides
8. **CRITICAL**: Every option in a Question slide MUST have a Tally action as the first action in afterSubmitActions, with answer matching the optionLabel

Example Question slide option structure:
{
  "optionLabel": "Yes",
  "optionValue": "yes",
  "primary": true,
  "afterSubmitActions": [
    {
      "type": "Tally",
      "answer": "Yes"
    },
    {
      "type": "Track",
      "event": "Preference Response",
      "properties": {
        "question": "Do you prefer option A or option B?",  /* Include the full question text, not just questionId */
        "answer": "Yes"
      }
    },
    {
      "type": "Slide",
      "slideId": "next-slide"
    }
  ]
}

Example Identify slide structure (convert presentation title to uppercase for demo name):
{
  "id": "identify",
  "kind": "Identify",
  "title": "Tell us about yourself",
  "description": "Enter your details to continue",
  "afterSubmitActions": [
    {
      "type": "Identify",
      "userProperties": {
        "demo": "PRESENTATIONNAME"
      }
    },
    {
      "type": "Stream",
      "message": "Ahoy \${name}"
    },
    {
      "type": "Slide",
      "slideId": "next-slide"
    }
  ]
}

Example WatchPresenter slide:
{
  "id": "intro",
  "kind": "WatchPresenter",
  "title": "Welcome to the Presentation",
  "description": "Please listen as the presenter explains the topic"
}

Example WebRtc slide:
{
  "id": "video-call",
  "kind": "WebRtc",
  "title": "Join the Video Call",
  "description": "Connect with us for live discussion"
}

Example Submitted slide:
{
  "id": "thank-you",
  "kind": "Submitted",
  "title": "Thank You!",
  "description": "Your response has been recorded"
}

Example DemoCta slide with options:
{
  "id": "cta",
  "kind": "DemoCta",
  "title": "Learn More",
  "description": "Check out these resources",
  "options": [
    {
      "optionLabel": "Visit Website",
      "optionValue": "website",
      "primary": true,
      "afterSubmitActions": [
        {
          "type": "URL",
          "url": "https://example.com"
        }
      ]
    },
    {
      "optionLabel": "Continue",
      "optionValue": "continue",
      "primary": false,
      "afterSubmitActions": [
        {
          "type": "Slide",
          "slideId": "next-slide"
        }
      ]
    }
  ]
}

Example Freeform slide:
{
  "id": "feedback",
  "kind": "Freeform",
  "title": "Share Your Thoughts",
  "description": "We'd love to hear your feedback",
  "prompt": "What did you think of today's presentation?",
  "placeholder": "Enter your feedback here...",
  "submitButtonLabel": "Submit Feedback",
  "afterSubmitActions": [
    {
      "type": "Stream",
      "message": "New feedback received"
    },
    {
      "type": "Track",
      "event": "Presentation Feedback",
      "properties": {
        "question": "What did you think of today's presentation?",  /* Always include the full question text */
        "feedback": "${response}"
      }
    },
    {
      "type": "Slide",
      "slideId": "thank-you"
    }
  ]
}

CRITICAL:
1. For Identify slides, replace PRESENTATIONNAME with the presentation title in uppercase (e.g., "Product Demo" becomes "PRODUCTDEMO"). The Stream message MUST use \${name} placeholder (with dollar sign and curly braces) which will be replaced with the user's actual name.
2. For Track actions, the event name MUST relate to the question being asked (e.g., "Color Preference" for a question about favorite colors). The properties MUST include the full question text and answer provided by the user (e.g., {"question": "What is your favorite color?", "favorite_color": "Pink"}). Never use just a questionId.

Return ONLY valid JSON matching this structure. No markdown, no explanations.`;

export const handler: ServerlessFunctionSignature = async (
  context: Context,
  event: GeneratePresentationEvent,
  callback: ServerlessCallback
) => {
  const startTime = Date.now();
  console.log("=== Function Start ===");
  console.log("Start time:", new Date(startTime).toISOString());
  console.log("event received - /api/generate-presentation: ", event);

  const logExecutionTime = () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.log("=== Function End ===");
    console.log("End time:", new Date(endTime).toISOString());
    console.log("Duration:", duration, "ms", `(${(duration / 1000).toFixed(2)}s)`);
  };

  let response = new Twilio.Response();
  response.appendHeader("Access-Control-Allow-Origin", "*");
  response.appendHeader("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  response.appendHeader(
    "Access-Control-Allow-Headers",
    "Authorization,Content-Type,Accept"
  );
  response.appendHeader("Content-Type", "application/json");

  try {
    const { prompt } = event;

    if (!prompt || typeof prompt !== 'string') {
      console.log("Missing or invalid prompt:", prompt);
      response.setStatusCode(400);
      response.setBody({ error: 'Prompt is required and must be a string' });
      logExecutionTime();
      return callback(null, response);
    }

    console.log("Received prompt:", prompt.substring(0, 100) + (prompt.length > 100 ? "..." : ""));

    if (!context.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not configured in environment");
      response.setStatusCode(500);
      response.setBody({ error: 'OpenAI API key not configured' });
      logExecutionTime();
      return callback(null, response);
    }

    console.log("OpenAI API key found, creating client");

    const openai = new OpenAI({
      apiKey: context.OPENAI_API_KEY as string,
    });

    const model = (context.OPENAI_MODEL as string) || 'gpt-4o';

    console.log("Making request to OpenAI API with model:", model);
    console.log("System prompt length:", SYSTEM_PROMPT.length);

    let content: string | undefined;

    try {
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      console.log("OpenAI API response received");
      // Log completion details if available using type assertions
      if (completion.choices && completion.choices[0]) {
        const choice = completion.choices[0] as { finish_reason?: string };
        console.log("Completion finish reason:", choice.finish_reason);
      }

      // Access usage safely with type assertions for the entire completion object
      const completionWithUsage = completion as any;
      if (completionWithUsage.usage) {
        const usage = completionWithUsage.usage;
        console.log("Usage - prompt tokens:", usage.prompt_tokens);
        console.log("Usage - completion tokens:", usage.completion_tokens);
        console.log("Usage - total tokens:", usage.total_tokens);
      }

      content = completion.choices[0]?.message?.content;
    } catch (openaiError: any) {
      console.error("OpenAI API error:", openaiError.message);
      if (openaiError.response) {
        console.error("OpenAI status:", openaiError.response.status);
        console.error("OpenAI data:", openaiError.response.data);
      }
      response.setStatusCode(500);
      response.setBody({
        error: 'Error from OpenAI API',
        message: openaiError.message || "Unknown OpenAI error"
      });
      logExecutionTime();
      return callback(null, response);
    }

    if (!content) {
      console.error("No content generated by OpenAI");
      response.setStatusCode(500);
      response.setBody({ error: 'No content generated' });
      logExecutionTime();
      return callback(null, response);
    }

    console.log("Content received, parsing JSON");

    let presentation;
    try {
      presentation = JSON.parse(content);
      console.log("Successfully parsed JSON");
      console.log("Presentation title:", presentation.title);
      console.log("Number of slides:", presentation.slides?.length || 0);
    } catch (jsonError: any) {
      console.error("Error parsing JSON:", jsonError.message);
      console.error("Raw content:", content.substring(0, 200) + "...");
      response.setStatusCode(500);
      response.setBody({
        error: 'Failed to parse generated content',
        message: jsonError.message
      });
      logExecutionTime();
      return callback(null, response);
    }

    // Validate basic structure
    if (!presentation.title || !Array.isArray(presentation.slides)) {
      console.error("Invalid presentation structure");
      console.error("Has title:", !!presentation.title);
      console.error("Slides is array:", Array.isArray(presentation.slides));
      response.setStatusCode(500);
      response.setBody({ error: 'Invalid presentation structure' });
      logExecutionTime();
      return callback(null, response);
    }

    console.log("Presentation structure validated successfully");
    response.setStatusCode(200);
    response.setBody({ presentation });
    logExecutionTime();
    return callback(null, response);
  } catch (err: any) {
    console.error('Error generating presentation:', err);
    console.error('Error stack:', err.stack || 'No stack trace available');

    response.setStatusCode(500);
    response.setBody({
      error: 'Failed to generate presentation',
      message: err.message || 'Unknown error'
    });
    logExecutionTime();
    return callback(null, response);
  }
};