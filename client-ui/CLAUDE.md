# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Connoware Live Slides is a real-time interactive presentation platform built with Next.js. The application allows users to create interactive presentations with various types of slides (questions, demos, etc.) and share them with an audience. Key features include:

- Live audience interaction (polls, questions, responses)
- Real-time data visualization of audience responses
- Presenter view with slide control and audience feedback
- Dashboard for creating and managing presentations
- Integration with analytics via Segment

## Key Commands

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build the application
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Build and transfer assets to serverless directory
npm run build:serverless
```

## Architecture

### Core Technology Stack

- **Framework**: Next.js 14
- **UI Library**: Twilio Paste (components, layout, styling)
- **Real-time Sync**: Twilio Sync
- **Analytics**: Segment and Vercel Analytics
- **Language**: TypeScript

### Application Structure

The application is organized into the following key areas:

1. **Page Routes**:
   - `/` - Main audience view for participating in presentations
   - `/dashboard` - Management interface for creating/editing presentations
   - `/presenter` - Presenter view showing real-time audience responses
   - `/screen` - Public display view for presenting slides
   - `/stream` - Stream view for audience content

2. **Core Components**:
   - Context providers (Sync, Analytics, Presentation, Action)
   - Slide type components (Question, Welcome, Identify, etc.)
   - Dashboard components for presentation management
   - Visualization components (DonutChart)

3. **Data Flow**:
   - Presentations and slides are stored in Twilio Sync Maps
   - Real-time updates use Twilio Sync Streams
   - Client state is managed through React context

### Key Concepts

#### Presentation Structure

A presentation consists of:
- A unique identifier (pid)
- A collection of slides
- Configuration settings (analytics key, etc.)

#### Slide Types

The application supports various slide types:
- `Question` - Presents options for audience voting
- `Identify` - Collects user information
- `WatchPresenter` - Directs attention to presenter
- `WebRtc` - Web real-time communication features
- `DemoCta` - Call-to-action slides
- `Ended` - End of presentation

#### Actions

Actions are operations triggered in response to user interactions:
- `SlideAction` - Navigate to a specific slide
- `TrackAction` - Track an analytics event
- `StreamAction` - Send a message to the stream
- `IdentifyAction` - Identify a user in analytics
- `UrlAction` - Navigate to an external URL
- `TallyAction` - Record a vote or response

## Working with the Codebase

### Real-time Data

Twilio Sync is used for real-time data synchronization:
- `SyncClient` establishes the connection
- `SyncMap` stores presentation and slide data
- `SyncStream` handles real-time events and messages
- `SyncDocument` maintains current presentation state

### Sync Context

The `useSyncClient` hook provides:
- Client instance for Sync operations
- User identity
- Connection state

### Analytics Integration

The application integrates with Segment for analytics:
- The `useAnalytics` hook provides track/identify methods
- Events are triggered by TrackAction and IdentifyAction
- Segment write keys can be set per-presentation

### Adding New Slides

To add a new slide type:
1. Add the phase to the `Phase` enum in `src/types/Phases.ts`
2. Create a new slide class extending `Slide` in `src/types/LiveSlides.ts`
3. Add a component to render the slide in `src/components`
4. Update the `DynamicCardWrapper` component to handle the new slide type

### Dashboard Interface

The dashboard provides tools to:
- Create new presentations
- Edit existing presentations
- Delete presentations
- Launch presenter view
- Monitor active presentations

## Deployment

The application is designed to be deployed on Vercel:
1. Build with `npm run build`
2. For serverless deployment: `npm run build:serverless` (transfers assets to serverless directory)