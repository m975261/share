# File Sharing App Design Guidelines

## Design Approach
**Material Design System** - Selected for its excellent handling of utility-focused applications with clear interaction patterns, ideal for file upload/download workflows and data display.

## Typography System
- **Primary Font**: Inter via Google Fonts CDN
- **Headings**: 
  - H1: 2.5rem (40px), font-weight 700 - Page titles
  - H2: 1.875rem (30px), font-weight 600 - Section headers
  - H3: 1.25rem (20px), font-weight 600 - Card titles
- **Body Text**: 1rem (16px), font-weight 400 - Default content
- **Metadata/Labels**: 0.875rem (14px), font-weight 500 - File info, timestamps
- **Mono Font**: JetBrains Mono for file links and codes

## Layout & Spacing System
**Tailwind Units**: Standardize on 2, 4, 6, 8, 12, 16 for consistent rhythm
- Component padding: p-6 or p-8
- Section spacing: py-12 or py-16
- Element gaps: gap-4 or gap-6
- Margins: m-4, m-6, m-8

**Container Strategy**:
- Main content: max-w-4xl mx-auto
- Upload zone: max-w-2xl
- Download page: max-w-xl for focused experience

## Core Components

### Upload Page Layout
- Centered single-column layout with max-w-2xl
- Hero section (h-64): Brief headline + value proposition
- Upload card: Large drag-drop zone (min-h-96) with dashed border
  - Icon (w-16 h-16) centered
  - Primary text: "Drag & drop files here"
  - Secondary text: "or click to browse" (text-sm)
  - File type/size limits below
- Settings panel below upload zone:
  - Deletion time selector (radio buttons or segmented control)
  - Options: 10 min (default), 1 hour, 24 hours, 7 days
  - Grid layout: grid-cols-2 md:grid-cols-4 gap-3

### Progress & Success States
- Linear progress bar (h-2) with percentage indicator
- Success card: 
  - Checkmark icon (w-12 h-12)
  - File name + size + expiration time
  - Public link in mono font with copy button
  - Large "Copy Link" primary button

### Download Page Layout
- Centered card (max-w-xl)
- File icon representing type (w-24 h-24)
- File name as H2
- Metadata grid (2 columns):
  - File size, Upload date, Expires in
- Primary download button (w-full, h-12)
- Secondary "Report file" link

### Navigation
- Top bar: Logo left, "Upload New File" button right
- Footer: Simple centered text with links

## Component Specifications

**Buttons**:
- Primary: h-12, px-8, rounded-lg, font-medium
- Secondary: h-10, px-6, rounded-lg
- Icon buttons: w-10 h-10, rounded-full

**Cards**:
- rounded-xl shadow-md p-8
- Hover state: shadow-lg transition

**Input Fields** (if needed):
- h-12 rounded-lg border px-4
- Focus: ring-2 ring-offset-2

**Icons**: 
- Heroicons via CDN (outline for general, solid for emphasis)
- Sizes: w-5 h-5 (inline), w-8 h-8 (standalone), w-16 h-16 (hero)

## Page-Specific Layouts

### Upload Page Structure:
1. Simple header (h-16)
2. Hero text section (py-12): Centered, concise value prop
3. Upload interface card (my-8)
4. Settings section (mt-6)
5. Footer (py-8)

### Download Page Structure:
1. Minimal header (h-16)
2. Download card centered vertically (min-h-screen flex items-center)
3. Minimal footer

## Interaction Patterns
- File upload: Highlight drop zone on drag-over
- Copy link: Button text changes to "Copied!" briefly
- Progress: Smooth indeterminate → determinate transition
- Deletion timer: Countdown display (dynamic)

## Responsive Behavior
- Mobile (< 768px): Single column, full-width cards with p-4
- Tablet/Desktop: Centered layouts with generous whitespace
- Upload zone: Maintains aspect ratio across breakpoints

## Images
No hero images needed - this is a utility-focused tool. Use illustrative icons instead:
- Upload page: Large upload cloud icon in drop zone
- Download page: File type-specific icons (document, image, video, archive)
- Success state: Checkmark or link icon

**Accessibility**: Ensure upload zone is keyboard accessible, clear focus states on all interactive elements, proper ARIA labels for screen readers, high contrast for text on all backgrounds.