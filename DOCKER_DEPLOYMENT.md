# FileShare - Docker Deployment Guide

This guide covers deploying FileShare using Docker and Docker Compose, including special instructions for Unraid.

## Quick Start with Docker Compose

### Prerequisites
- Docker and Docker Compose installed
- At least 1GB free disk space

### 1. Clone or Download the Project

```bash
git clone <your-repo-url>
cd fileshare
```

### 2. Configure Environment Variables

Edit `docker-compose.yml` and update the following:

```yaml
environment:
  # REQUIRED: Change this to a secure random string (at least 32 characters)
  SESSION_SECRET: "your-secure-random-string-here"
  
  # REQUIRED: Change the database password
  # Also update it in the postgres service section
  DATABASE_URL: postgresql://fileshare:YOUR_PASSWORD_HERE@postgres:5432/fileshare
  
  # Optional: Change timezone
  TZ: America/New_York
```

### 3. Start the Application

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Stop and remove all data (WARNING: Deletes all files and database!)
docker-compose down -v
```

### 4. Access the Application

Open your browser to: `http://localhost:5000`

---

## Docker Hub Deployment

### Build and Push to Docker Hub

```bash
# 1. Login to Docker Hub
docker login

# 2. Build the image (replace 'yourusername' with your Docker Hub username)
docker build -t yourusername/fileshare:latest .

# 3. Tag with version (optional)
docker tag yourusername/fileshare:latest yourusername/fileshare:1.0.0

# 4. Push to Docker Hub
docker push yourusername/fileshare:latest
docker push yourusername/fileshare:1.0.0
```

### Pull and Run from Docker Hub

```bash
# Create a network
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

# Run the application
docker run -d \
  --name fileshare-app \
  --network fileshare-network \
  -p 5000:5000 \
  -e DATABASE_URL=postgresql://fileshare:secure_password@fileshare-db:5432/fileshare \
  -e SESSION_SECRET=your-very-long-random-secure-string-here \
  -e STORAGE_TYPE=local \
  -e NODE_ENV=production \
  -v fileshare-uploads:/app/uploads \
  yourusername/fileshare:latest
```

---

## Unraid Deployment

### Method 1: Using Docker Compose (Recommended)

1. **Install Docker Compose Manager Plugin**
   - Go to Apps tab
   - Search for "Docker Compose Manager"
   - Install the plugin

2. **Create Compose File**
   - Navigate to `/mnt/user/appdata/fileshare/`
   - Create `docker-compose.yml` with the contents from this repository
   - Update environment variables (see Configuration section below)

3. **Deploy**
   ```bash
   cd /mnt/user/appdata/fileshare/
   docker-compose up -d
   ```

### Method 2: Using Unraid Template (One-Click Install)

1. **Add Template Repository**
   - Go to Docker tab
   - Click "Add Container"
   - At the bottom, click "Template repositories"
   - Add: `https://github.com/yourusername/fileshare-templates`

2. **Install from Template**
   - Search for "FileShare"
   - Click install
   - Configure paths and ports
   - Click Apply

### Method 3: Manual Docker Container Setup

1. **Go to Docker Tab** → **Add Container**

2. **Basic Configuration**
   ```
   Name: FileShare
   Repository: yourusername/fileshare:latest
   Network Type: Bridge
   ```

3. **Port Mappings**
   ```
   Container Port: 5000
   Host Port: 5000 (or any available port)
   Connection Type: TCP
   ```

4. **Volume Mappings**
   ```
   Container Path: /app/uploads
   Host Path: /mnt/user/appdata/fileshare/uploads
   Access Mode: Read/Write
   ```

5. **Environment Variables**
   ```
   Key: DATABASE_URL
   Value: postgresql://fileshare:password@fileshare-db:5432/fileshare
   
   Key: SESSION_SECRET
   Value: <generate-random-32-character-string>
   
   Key: STORAGE_TYPE
   Value: local
   
   Key: TZ
   Value: America/New_York
   
   Key: PUID
   Value: 99
   
   Key: PGID
   Value: 100
   ```

6. **Create PostgreSQL Container First**
   - Repeat above steps with:
     - Name: fileshare-db
     - Repository: postgres:16-alpine
     - Volume: `/mnt/user/appdata/fileshare/postgres` → `/var/lib/postgresql/data`
     - Environment:
       - POSTGRES_USER: fileshare
       - POSTGRES_PASSWORD: secure_password
       - POSTGRES_DB: fileshare

---

## Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | Secret key for sessions (min 32 chars) | Random string |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `STORAGE_TYPE` | Storage backend (`local` or `gcs`) | `local` |
| `UPLOAD_DIR` | Directory for file uploads | `/app/uploads` |
| `PORT` | Application port | `5000` |
| `TZ` | Timezone | `America/New_York` |
| `NODE_ENV` | Node environment | `production` |

### Generating SESSION_SECRET

```bash
# Linux/Mac
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Data Persistence

### Volumes

The application uses two persistent volumes:

1. **Database Volume** (`postgres-data`)
   - Stores all file metadata
   - Must be backed up regularly

2. **Upload Volume** (`upload-data`)
   - Stores all uploaded files
   - Must be backed up regularly

### Backup

```bash
# Backup database
docker exec fileshare-db pg_dump -U fileshare fileshare > backup.sql

# Restore database
docker exec -i fileshare-db psql -U fileshare fileshare < backup.sql

# Backup uploads (copy volume to host)
docker run --rm -v fileshare-uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz -C /data .

# Restore uploads
docker run --rm -v fileshare-uploads:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/uploads-backup.tar.gz"
```

---

## Updating

### Docker Compose

```bash
# Pull latest images
docker-compose pull

# Restart with new images
docker-compose up -d

# Clean up old images
docker image prune -a -f
```

### Unraid

1. Go to Docker tab
2. Click "Check for Updates"
3. Click update icon next to FileShare
4. Wait for update to complete

---

## Troubleshooting

### Check Logs

```bash
# Docker Compose
docker-compose logs -f app

# Direct Docker
docker logs -f fileshare-app

# Unraid
Click on container → View Logs
```

### Common Issues

**Application won't start:**
- Check `DATABASE_URL` is correct
- Ensure PostgreSQL is running: `docker ps | grep postgres`
- Check logs for errors

**Can't upload files:**
- Verify upload volume is writable: `docker exec fileshare-app ls -la /app/uploads`
- Check disk space: `df -h`

**Database connection errors:**
- Verify PostgreSQL is healthy: `docker ps` (should show "healthy")
- Test connection: `docker exec fileshare-db psql -U fileshare -c "SELECT 1"`

**Files not being deleted:**
- Check cron scheduler is running (look for cleanup messages in logs)
- Verify timezone is set correctly

---

## Security Considerations

1. **Change Default Passwords**: Always change database password in production
2. **Use Strong SESSION_SECRET**: Minimum 32 random characters
3. **Enable HTTPS**: Use a reverse proxy (nginx, Traefik, Caddy) with SSL certificates
4. **Regular Updates**: Keep Docker images updated
5. **Backup Data**: Regular backups of database and uploads
6. **Resource Limits**: Set CPU and memory limits in production

### Example Reverse Proxy (nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name fileshare.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # For file uploads
        client_max_body_size 1000M;
    }
}
```

---

## Support

- GitHub Issues: `https://github.com/yourusername/fileshare/issues`
- Documentation: `https://github.com/yourusername/fileshare`

---

## License

[Your License Here]
