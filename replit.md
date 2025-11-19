# FileShare - Temporary File Sharing Application

## Overview

FileShare is a temporary file sharing web application that allows users to upload files, receive shareable links, and set automatic deletion times. The application provides a simple, utility-focused interface for sharing files with configurable expiration periods ranging from 10 minutes to 7 days.

The application is built as a full-stack TypeScript solution with a React frontend and Express backend, utilizing Google Cloud Storage for file storage and PostgreSQL (via Neon) for metadata persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack Query (React Query) for server state
- **UI Framework:** shadcn/ui components built on Radix UI primitives
- **Styling:** Tailwind CSS with custom design system

**Design System:**
- Based on Material Design principles for utility-focused applications
- Typography: Inter font family via Google Fonts
- Consistent spacing system using Tailwind's spacing scale (2, 4, 6, 8, 12, 16)
- New York style variant from shadcn/ui
- Custom color theming with CSS variables for light/dark mode support

**Key Pages:**
1. **Home Page (`/`):** File upload interface with drag-and-drop zone, deletion time selector, and upload progress tracking
2. **Download Page (`/download/:id`):** File download interface displaying metadata and download button
3. **Not Found Page:** 404 error handling

**State Management Strategy:**
- Server state managed through React Query for caching and synchronization
- Local component state for UI interactions (drag-and-drop, progress tracking)
- Toast notifications for user feedback

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database ORM:** Drizzle ORM
- **Database:** PostgreSQL via Neon serverless
- **Object Storage:** Google Cloud Storage with Replit sidecar authentication

**API Endpoints:**
1. `POST /api/upload` - Generate presigned upload URL for direct-to-storage uploads
2. `POST /api/files` - Save file metadata after successful upload
3. `GET /api/files/:id` - Retrieve file metadata by ID
4. `GET /api/files/object/:objectPath` - Retrieve file metadata by storage path

**Storage Strategy:**
- **Direct Upload Pattern:** Client receives presigned URL and uploads directly to Google Cloud Storage, bypassing the Express server for file content
- **Metadata Storage:** PostgreSQL stores file metadata (filename, size, MIME type, expiration time, download count)
- **File Cleanup:** Cron job implementation for automatic deletion of expired files

**Database Schema:**
```typescript
files table:
- id: UUID (primary key, auto-generated)
- filename: text (storage filename)
- originalFilename: text (user's original filename)
- mimeType: text
- size: bigint
- objectPath: text (Google Cloud Storage path)
- uploadTime: timestamp (auto-set on creation)
- expirationTime: timestamp (user-configurable)
- downloadCount: integer (default 0)
```

### Object Storage Architecture

**Google Cloud Storage Integration:**
- Uses Replit's sidecar authentication pattern for Google Cloud credentials
- External account authentication with automatic token management
- Object path normalization for consistent storage keys
- Support for public and private object access policies (ACL system in development)

**File Lifecycle:**
1. Client requests upload URL from backend
2. Backend generates presigned URL via Google Cloud Storage SDK
3. Client uploads file directly to GCS using presigned URL
4. Client sends metadata to backend for database persistence
5. Backend normalizes storage path and creates database record
6. Cron job periodically checks for expired files and deletes them

### Build and Development

**Build System:**
- **Frontend:** Vite for fast development and optimized production builds
- **Backend:** esbuild for server-side bundling
- **TypeScript:** Shared type definitions between client and server via `shared/` directory

**Development Tools:**
- Replit-specific plugins for development experience (cartographer, dev banner, runtime error overlay)
- Hot module replacement (HMR) in development
- Path aliases for clean imports (`@/`, `@shared/`, `@assets/`)

**Production Build:**
- Frontend: Static assets compiled to `dist/public`
- Backend: Bundled server code to `dist/index.js`
- Environment-based configuration (NODE_ENV)

## External Dependencies

### Third-Party Services

**Google Cloud Storage:**
- File object storage service
- Authenticated via Replit sidecar (localhost:1106)
- External account credentials with automatic token rotation
- Used for storing uploaded files with automatic cleanup

**Neon PostgreSQL:**
- Serverless PostgreSQL database via `@neondatabase/serverless`
- Connection via DATABASE_URL environment variable
- Schema managed through Drizzle ORM
- Migrations stored in `./migrations` directory

### Key External Libraries

**UI Components:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library (New York variant)
- Comprehensive component set including forms, dialogs, tooltips, etc.

**File Upload:**
- Uppy file uploader with AWS S3 compatibility for Google Cloud Storage
- Dashboard UI for drag-and-drop and progress tracking

**Utilities:**
- `node-cron` for scheduled tasks (file cleanup)
- `class-variance-authority` and `clsx` for dynamic styling
- `zod` for runtime type validation
- TanStack Query for API data management

### Font Dependencies

Loaded via Google Fonts CDN:
- Inter (primary UI font)
- JetBrains Mono (monospace for codes/links)
- DM Sans, Fira Code, Geist Mono (design system alternatives)
- Architects Daughter (decorative)

## Docker Deployment

The application is fully containerized and can be deployed using Docker and Docker Compose. This enables deployment on various platforms including Unraid, standard Docker hosts, and cloud providers.

### Docker Configuration

**Multi-Stage Dockerfile:**
- Stage 1: Build frontend (Vite compilation)
- Stage 2: Prepare backend dependencies
- Stage 3: Production runtime (Alpine-based, ~100MB)

**Key Features:**
- Non-root user execution for security
- Health check endpoint at `/health`
- Persistent volumes for uploads and database
- Environment-based configuration
- Automatic container restart

**Deployment Files:**
- `Dockerfile` - Multi-stage production build
- `docker-compose.yml` - Complete stack with PostgreSQL
- `.dockerignore` - Build optimization
- `unraid-template.xml` - Unraid Community Applications template
- `DOCKER_DEPLOYMENT.md` - Comprehensive deployment guide
- `build-and-push.sh` - DockerHub publishing script

### Storage Adaptation

For Docker deployment, the application supports two storage modes:
1. **Replit Mode**: Uses Google Cloud Storage with sidecar authentication (default in Replit)
2. **Local Mode**: Uses local filesystem storage for standalone Docker deployment (set `STORAGE_TYPE=local`)

### Required Environment Variables (Docker)

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Random 32+ character string for session encryption
- `STORAGE_TYPE` - Set to "local" for Docker deployment
- `TZ` - Timezone for cron scheduler

### Volumes

- `/app/uploads` - Persistent file storage
- PostgreSQL data volume for database persistence

### Deployment Platforms

- **Docker Compose**: Local development and self-hosted deployments
- **Unraid**: One-click installation via Community Applications template
- **Standard Docker**: Manual container deployment with docker run
- **Cloud Platforms**: Compatible with any Docker-capable hosting (AWS ECS, Google Cloud Run, Azure Container Instances, etc.)