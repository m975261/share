# FileShare - Temporary File Sharing

[![Docker Pulls](https://img.shields.io/docker/pulls/yourusername/fileshare.svg)](https://hub.docker.com/r/yourusername/fileshare/)
[![Docker Image Size](https://img.shields.io/docker/image-size/yourusername/fileshare/latest.svg)](https://hub.docker.com/r/yourusername/fileshare/)

A beautiful, simple temporary file sharing application with automatic deletion. Upload files, get shareable links, and let them automatically expire after your chosen time period.

## Features

- 📤 **Easy Upload**: Drag-and-drop or browse to upload files
- ⏱️ **Auto-Delete**: Choose from 10 minutes, 1 hour, 24 hours, or 7 days
- 🔗 **Shareable Links**: Get instant shareable URLs
- 🎨 **Beautiful UI**: Clean, modern interface built with React and Tailwind CSS
- 🔒 **Privacy-Focused**: Files are automatically deleted, no permanent storage
- 📊 **Download Tracking**: See how many times files have been downloaded

## Quick Start

### Using Docker Compose (Recommended)

1. Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: fileshare
      POSTGRES_PASSWORD: change-this-password
      POSTGRES_DB: fileshare
    volumes:
      - postgres-data:/var/lib/postgresql/data

  app:
    image: yourusername/fileshare:latest
    restart: unless-stopped
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://fileshare:change-this-password@postgres:5432/fileshare
      SESSION_SECRET: "change-this-to-random-32-character-string"
      STORAGE_TYPE: local
      NODE_ENV: production
    volumes:
      - upload-data:/app/uploads
    depends_on:
      - postgres

volumes:
  postgres-data:
  upload-data:
```

2. Start the application:

```bash
docker-compose up -d
```

3. Access at: `http://localhost:5000`

### Using Docker CLI

```bash
# Create network
docker network create fileshare-network

# Run PostgreSQL
docker run -d \
  --name fileshare-db \
  --network fileshare-network \
  -e POSTGRES_USER=fileshare \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=fileshare \
  -v fileshare-db:/var/lib/postgresql/data \
  postgres:16-alpine

# Run FileShare
docker run -d \
  --name fileshare-app \
  --network fileshare-network \
  -p 5000:5000 \
  -e DATABASE_URL=postgresql://fileshare:secure_password@fileshare-db:5432/fileshare \
  -e SESSION_SECRET=your-random-32-character-secret \
  -v fileshare-uploads:/app/uploads \
  yourusername/fileshare:latest
```

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | Random secret for sessions (32+ chars) | Use `openssl rand -base64 32` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `5000` |
| `STORAGE_TYPE` | Storage backend (`local` or `gcs`) | `local` |
| `UPLOAD_DIR` | Upload directory path | `/app/uploads` |
| `TZ` | Timezone for logs and scheduler | `America/New_York` |
| `NODE_ENV` | Node environment | `production` |

## Volumes

| Container Path | Description |
|---------------|-------------|
| `/app/uploads` | Uploaded files storage (must be persisted) |

## Ports

| Container Port | Description |
|---------------|-------------|
| `5000` | Web UI and API |

## Health Check

The container includes a health check at `/health` endpoint.

```bash
# Check container health
docker ps

# Manual health check
curl http://localhost:5000/health
```

## Backup and Restore

### Backup

```bash
# Backup database
docker exec fileshare-db pg_dump -U fileshare fileshare > backup.sql

# Backup uploaded files
docker run --rm -v fileshare-uploads:/data -v $(pwd):/backup alpine \
  tar czf /backup/uploads-backup.tar.gz -C /data .
```

### Restore

```bash
# Restore database
docker exec -i fileshare-db psql -U fileshare fileshare < backup.sql

# Restore uploaded files
docker run --rm -v fileshare-uploads:/data -v $(pwd):/backup alpine \
  sh -c "cd /data && tar xzf /backup/uploads-backup.tar.gz"
```

## Updating

```bash
# Docker Compose
docker-compose pull
docker-compose up -d

# Docker CLI
docker pull yourusername/fileshare:latest
docker stop fileshare-app
docker rm fileshare-app
# Re-run the docker run command
```

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Storage**: Local filesystem (Docker volume)
- **Image Size**: ~100MB (Alpine-based)

## Unraid

This container includes an Unraid template for one-click installation. See the [full deployment guide](https://github.com/yourusername/fileshare/blob/main/DOCKER_DEPLOYMENT.md) for details.

## Security

- Always use strong `SESSION_SECRET` (32+ random characters)
- Change default database password
- Use HTTPS in production (reverse proxy recommended)
- Regular backups of database and uploads
- Keep container updated

## Support

- **GitHub**: https://github.com/yourusername/fileshare
- **Issues**: https://github.com/yourusername/fileshare/issues
- **Documentation**: [Full Deployment Guide](https://github.com/yourusername/fileshare/blob/main/DOCKER_DEPLOYMENT.md)

## License

[Your License]

---

Built with ❤️ using React, TypeScript, and Express
