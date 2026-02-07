# Visual Designer Documentation

## Overview

The Visual Designer is a new interface for creating and editing LiveSlides presentations without directly editing JSON. It provides a drag-and-drop interface with real-time preview, making it easy to create engaging presentations.

## Features

### 1. **Visual Slide Type Selection**
- Choose from categorized slide types:
  - **Interactive**: Question, Identify, Call-to-Action
  - **Informational**: Watch Presenter, WebRTC
  - **Transition**: Submitted, End
- Each type has an icon, description, and category

### 2. **Form-Based Editing**
- Dedicated forms for each slide type
- Validation and helpful hints
- No JSON knowledge required

### 3. **Real-Time Preview**
- See exactly how your slide will appear to users
- Updates as you edit
- Matches the actual presentation rendering

### 4. **Slide Management**
- Reorder slides with up/down buttons
- Delete slides with confirmation
- View all slides in a list
- Edit any slide by clicking

### 5. **Action Builder**
- Visual interface for adding actions
- Supports all action types:
  - Navigate to Slide
  - Track Event (Segment)
  - Identify User
  - Stream Message
  - Open URL
  - Record Vote
- Configure properties without JSON

## Accessing the Visual Designer

### From Dashboard
1. Go to the Dashboard
2. Find your presentation
3. Click the "..." menu
4. Select "Visual Designer"

### Direct URL
```
/dashboard/visual-designer?pid=YOUR_PRESENTATION_ID
```

## Creating a New Slide

1. Click "Add Slide" button
2. Choose a slide type from the modal
3. Fill in the form fields:
   - **Slide ID**: Unique identifier (auto-generated)
   - **Title**: Main heading
   - **Description**: Additional context
   - Type-specific fields (options, actions, etc.)
4. Preview updates automatically
5. Changes are saved immediately to the presentation

## Slide Types Guide

### Question Slide
**Purpose**: Ask the audience a multiple-choice question

**Fields**:
- Question text
- Response key (for analytics)
- Multiple answer options:
  - Label (shown to users)
  - Value (stored in analytics)
  - Primary/secondary button style
  - Actions after selection

**Example Use Cases**:
- Polls: "What's your favorite feature?"
- Surveys: "Rate your experience"
- Quizzes: "Which answer is correct?"

### Identify Slide
**Purpose**: Collect user information

**Fields**:
- Title and description
- Actions after submission

**Collected Data**:
- Phone number (automatically validated)
- Can be extended for email, name, etc.

**Example Use Cases**:
- Lead capture forms
- Event registration
- Contact information collection

### Call-to-Action (CTA) Slide
**Purpose**: Present action buttons to the audience

**Fields**:
- Title and description
- Multiple buttons:
  - Label
  - Primary/secondary style
  - Actions on click

**Example Use Cases**:
- "Call us now" buttons
- "Visit our website" links
- "Schedule a demo" actions

### Watch Presenter Slide
**Purpose**: Hold screen while presenter speaks

**Fields**:
- Title
- Description

**Example Use Cases**:
- "Watch the screen" messages
- Transitional slides
- Holding patterns

### WebRTC Slide
**Purpose**: Enable real-time communication

**Fields**:
- Title
- Description

**Example Use Cases**:
- Video chat integration
- Live streaming features

### Submitted/Ended Slides
**Purpose**: Confirmation and conclusion screens

**Fields**:
- Title
- Description
- Optional buttons (for Ended)

## Action Configuration

### Navigate to Slide
**Purpose**: Go to a specific slide

**Configuration**:
- Select target slide from dropdown

**Example**: After answering question A, go to slide "RESULT-A"

### Track Event
**Purpose**: Send analytics event to Segment

**Configuration**:
- Event name (e.g., "Button Clicked")
- Properties (JSON object)

**Example**:
```json
{
  "button_label": "Learn More",
  "category": "engagement"
}
```

### Identify User
**Purpose**: Identify user in analytics

**Configuration**:
- User properties (JSON object)

**Example**:
```json
{
  "plan": "premium",
  "company": "Acme Corp"
}
```

### Stream Message
**Purpose**: Publish message to presenter stream

**Configuration**:
- Message template (supports ${variable} interpolation)
- Additional properties

**Example**: `User selected: ${optionLabel}`

### Open URL
**Purpose**: Navigate to external website

**Configuration**:
- URL (must be http:// or https://)

**Security**: URLs are validated to prevent XSS attacks

### Record Vote (Tally)
**Purpose**: Record audience response

**Configuration**:
- Answer value to record

**Example**: For option "A", record "option-a"

## Advanced Features

### Slide Reordering
- Click up/down arrows to reorder
- Changes order in presentation flow
- Updates immediately

### Slide Duplication
(Coming soon)
- Duplicate existing slides
- Modify duplicates for variations

### Bulk Actions
(Coming soon)
- Select multiple slides
- Delete, reorder, or modify in bulk

### Templates
(Coming soon)
- Save slide configurations as templates
- Reuse common patterns

## JSON Schema

The visual designer uses a comprehensive schema defined in `src/schemas/presentationSchema.ts`:

### Schema Features
- Type validation for all slide types
- Action type validation
- Required field checking
- Unique ID validation
- Property structure validation

### Validation Rules
1. **Slide IDs**: Must be unique, alphanumeric with hyphens/underscores
2. **Titles**: Required for all slides
3. **Options**: Question and CTA slides must have at least one option
4. **Actions**: Must have valid type and required properties

## Component Architecture

### Key Components

#### `SlideTypeSelector`
- Visual grid of slide types
- Categorized by purpose
- Icon and description for each type

#### `SlideEditor`
- Universal editor component
- Routes to specific form based on slide type
- Handles validation

#### `QuestionSlideForm`
- Form for question slides
- Option management
- Action configuration per option

#### `IdentifySlideForm`
- Form for identify slides
- User data collection configuration

#### `CtaSlideForm`
- Form for CTA/Ended slides
- Button management
- Action configuration per button

#### `BasicSlideForm`
- Form for simple slides (Watch, WebRTC, Submitted)
- Title and description only

#### `ActionBuilder`
- Reusable action configuration component
- Type-specific fields
- JSON editing for properties

#### `SlidePreview`
- Real-time preview rendering
- Matches actual presentation appearance
- Updates on every change

#### `SlideListEditor`
- Slide list with thumbnails
- Reordering controls
- Selection and deletion

## Best Practices

### Slide Organization
1. **Start with Welcome**: Use a simple slide to introduce the presentation
2. **Group by Topic**: Keep related slides together
3. **Use Transitions**: Add "Watch Presenter" slides between major sections
4. **End Gracefully**: Use an Ended slide with next steps

### Action Design
1. **Keep It Simple**: Don't chain too many actions
2. **Track Meaningfully**: Use descriptive event names
3. **Validate URLs**: Always test external links
4. **Think Mobile**: Remember users are on phones

### Testing
1. **Preview Often**: Use the preview panel constantly
2. **Test on Device**: QR code makes this easy
3. **Check Actions**: Verify all actions execute correctly
4. **Monitor Analytics**: Ensure events are tracked

## Keyboard Shortcuts

(Coming soon)
- `Cmd/Ctrl + S`: Save presentation
- `Cmd/Ctrl + N`: New slide
- `↑/↓`: Navigate slides
- `Delete`: Delete selected slide

## Troubleshooting

### Slide Won't Save
**Issue**: Changes don't persist

**Solutions**:
- Check for validation errors (red borders)
- Ensure Slide ID is unique
- Verify required fields are filled
- Check browser console for errors

### Preview Not Updating
**Issue**: Preview shows old content

**Solutions**:
- Click outside form field to trigger update
- Refresh the page
- Clear browser cache

### Actions Not Working
**Issue**: Actions don't execute in presentation

**Solutions**:
- Verify action type is correct
- Check required fields (slideId, url, etc.)
- Validate JSON in properties fields
- Test in presenter view

### Can't Reorder Slides
**Issue**: Up/down buttons disabled

**Solutions**:
- First slide can't move up
- Last slide can't move down
- Save presentation and try again

## Migration from JSON Editor

### Converting Existing Presentations
1. Open presentation in Visual Designer
2. All slides load automatically
3. Edit using forms
4. Save - JSON is updated automatically

### JSON Compatibility
- Visual Designer and JSON editor are fully compatible
- Can switch between editors freely
- JSON structure is preserved
- All features supported in both

### When to Use JSON Editor
- Bulk operations
- Advanced customization
- Copying between presentations
- Debugging issues

### When to Use Visual Designer
- Creating new presentations
- Adding/editing individual slides
- Learning the platform
- Quick edits

## API Reference

### Schema Functions

#### `createSlide(type: Phase, id: string): Slide`
Creates a new slide of specified type with given ID

#### `validateSlide(slide: Slide): ValidationResult`
Validates a slide and returns errors

#### `validatePresentation(presentation: LiveSlidePresentation): ValidationResult`
Validates entire presentation

#### `generateSlideId(existingSlides: Slide[], prefix: string): string`
Generates unique slide ID

### Type Metadata

#### `SLIDE_TYPES: SlideTypeMetadata[]`
Array of all slide types with labels, descriptions, icons

#### `ACTION_TYPES: ActionTypeMetadata[]`
Array of all action types with metadata

## Future Enhancements

### Planned Features
- [ ] Drag-and-drop slide reordering
- [ ] Slide templates library
- [ ] Bulk edit operations
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts
- [ ] Import/export slides
- [ ] Slide duplication
- [ ] Rich text editor for descriptions
- [ ] Image upload support
- [ ] Color/theme customization
- [ ] A/B testing support
- [ ] Version history
- [ ] Collaboration features
- [ ] Mobile editing support

## Support

### Getting Help
- Check this documentation
- Review example presentations in `/examples`
- Contact support at [support email]

### Reporting Issues
When reporting issues, include:
- Browser and version
- Presentation ID
- Steps to reproduce
- Screenshot if applicable
- Console errors

### Feature Requests
Submit feature requests through:
- GitHub issues
- Feedback form in dashboard
- Email to product team

## Changelog

### v1.0.0 (Current)
- Initial release
- All slide types supported
- Action builder
- Real-time preview
- Slide reordering
- Validation

### Upcoming
- v1.1.0: Drag-and-drop reordering
- v1.2.0: Templates library
- v1.3.0: Undo/redo support
