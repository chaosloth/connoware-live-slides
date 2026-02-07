# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Connoware Live Slides is a real-time interactive presentation platform that enables engaging audience participation during live presentations. The system consists of three main components:

1. **Audience Mobile App** - Allows audience members to interact with presentations in real-time
2. **Presenter Feedback UI** - Shows live feedback and responses to the presenter
3. **Keynote Screen** - Public display synchronized with audience interactions

## Repository Structure

This is a monorepo with two main directories:

- `client-ui/` - Next.js web application (audience, presenter, screen views)
- `serverless/` - Twilio Serverless Functions (backend API)
- `examples/` - Sample presentation JSON files for testing and reference

## Development Setup

### Client UI (Next.js Application)

```bash
cd client-ui
npm install
npm run dev          # Start development server at http://localhost:3000
npm run build        # Production build
npm run lint         # Run ESLint
```

### Serverless Functions (Twilio Backend)

```bash
cd serverless
npm install
npm run build        # Compile TypeScript and copy assets
npm start            # Start local Twilio Functions server
npm run deploy       # Deploy to Twilio
npm test             # Type check with tsc --noEmit
```

### Building for Serverless Deployment

To build the client UI and transfer static assets to the serverless directory:

```bash
cd client-ui
npm run build:serverless  # Builds Next.js static export and copies to ../serverless/dist/assets/
```

## Architecture

### Technology Stack

**Frontend:**
- Next.js 14 with TypeScript
- Twilio Paste UI components
- Twilio Sync for real-time data synchronization
- Segment Analytics for event tracking
- React Context for state management

**Backend:**
- Twilio Serverless Functions
- Twilio Sync Service for data persistence
- Twilio Chat for messaging capabilities

### Key Architectural Patterns

**Real-time Synchronization:**
- Presentations and slides are stored in Twilio Sync Maps
- Current presentation state is managed via Sync Documents
- Live updates use Sync Streams for event broadcasting
- Token-based authentication via `/api/token` endpoint

**Data Flow:**
1. Client requests access token from `/api/token` with identity
2. Client connects to Twilio Sync using token
3. Presentation data is loaded from Sync Map
4. Real-time updates are received via Sync Streams
5. User actions trigger state changes and analytics events

### Serverless API Endpoints

Located in `serverless/src/functions/api/`:

- `token.ts` - Generate Twilio access tokens for Sync and Chat
- `create.ts` - Create TaskRouter tasks (for workflow integration)
- `update.ts` - Update presentation or slide data
- `focus.ts` - Track focus/presence events
- `number-lookup.ts` - Phone number validation

### Client UI Structure

**Routes:**
- `/` - Audience participation view
- `/dashboard` - Presentation management interface
- `/dashboard/designer` - Presentation editor
- `/presenter` - Presenter view with audience feedback
- `/screen` - Public keynote display
- `/stream` - Stream view for audience content
- `/signal` - Signaling view for coordination

**Context Providers:**
- `SyncContext` - Manages Twilio Sync client connection and state
- `PresentationContext` - Handles presentation data and slides
- `ActionContext` - Processes user actions (voting, navigation, etc.)
- `AnalyticsContext` - Wraps Segment analytics tracking

### Slide Types

The system supports multiple slide types defined in `client-ui/src/types/LiveSlides.ts`:

- `QuestionSlide` - Multiple choice questions with voting
- `GateSlide` - Audience identification/gating
- `CtaSlide` - Call-to-action buttons
- `WaitSlide` - Hold screen while presenter speaks
- `WebRtcSlide` - WebRTC communication features
- `SubmittedSlide` - Confirmation after submission
- `EndedSlide` - End of presentation

### Action System

Actions are triggered in response to user interactions (defined in `client-ui/src/types/ActionTypes.ts`):

- `SlideAction` - Navigate to specific slide
- `TrackAction` - Send analytics event to Segment
- `IdentifyAction` - Identify user in analytics
- `StreamAction` - Publish message to Sync Stream
- `UrlAction` - Navigate to external URL
- `TallyAction` - Record vote/response

## Environment Variables

### Client UI (.env)

```
NEXT_PUBLIC_SERVERLESS_URL=<Twilio Functions base URL>
```

### Serverless (.env)

```
TWILIO_ACCOUNT_SID=<Account SID>
TWILIO_API_KEY=<API Key>
TWILIO_API_SECRET=<API Secret>
SYNC_SERVICE_SID=<Sync Service SID>
CHAT_SERVICE_SID=<Chat Service SID>
```

## Working with Presentations

Presentation data is stored as JSON and synced via Twilio Sync Maps. See `examples/` directory for sample presentation structures.

**Key Presentation Properties:**
- `title` - Presentation name
- `slides[]` - Array of slide objects
- `segmentWriteKey` - Optional Segment analytics key for the presentation

**Adding Slides:**
Slides are managed through the dashboard interface. Each slide requires:
- `id` - Unique identifier
- `kind` - Slide type (from Phase enum)
- `title` - Display title
- `description` - Slide content
- Type-specific properties (e.g., `options[]` for QuestionSlide)

## Deployment

**Client UI:**
- Builds to static site export
- Deployable to Vercel or any static host
- Use `npm run build:serverless` to prepare for Twilio Functions hosting

**Serverless Functions:**
- Deploy to Twilio using `npm run deploy` from serverless directory
- Requires Twilio CLI and proper environment configuration
- Deployment info stored in `.twiliodeployinfo`

## Common Tasks

**Test a presentation locally:**
1. Start serverless: `cd serverless && npm start`
2. Start client: `cd client-ui && npm run dev`
3. Navigate to dashboard to create/load presentation
4. Use presenter view to control slides

**Add a new slide type:**
1. Add Phase enum value in `client-ui/src/types/Phases.ts`
2. Create slide class in `client-ui/src/types/LiveSlides.ts`
3. Create component in `client-ui/src/components/`
4. Update slide rendering logic in relevant views

**Modify API endpoints:**
1. Edit TypeScript files in `serverless/src/functions/api/`
2. Run `npm run build` to compile
3. Test locally with `npm start`
4. Deploy with `npm run deploy`
