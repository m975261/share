# FileShare - Docker & Unraid Deployment

Your FileShare application is now fully containerized and ready for deployment to DockerHub and Unraid!

## 📦 What's Been Created

### Docker Configuration Files

1. **`Dockerfile`** - Multi-stage production build
   - Stage 1: Builds frontend with Vite
   - Stage 2: Prepares backend dependencies
   - Stage 3: Creates optimized Alpine-based runtime (~100MB)
   - Includes health checks and runs as non-root user

2. **`docker-compose.yml`** - Complete stack definition
   - PostgreSQL database service
   - FileShare application service
   - Persistent volumes for data and uploads
   - Health checks and automatic restarts

3. **`.dockerignore`** - Build optimization
   - Excludes unnecessary files from Docker image

### Deployment Scripts

4. **`build-and-push.sh`** - Automated build and publish script
   - Builds Docker image
   - Tags versions
   - Pushes to DockerHub

### Unraid Files

5. **`unraid-template.xml`** - One-click Unraid installation
   - Pre-configured settings
   - Port mappings
   - Volume paths
   - Environment variables

### Documentation

6. **`DOCKER_DEPLOYMENT.md`** - Comprehensive deployment guide
   - Docker Compose instructions
   - Unraid deployment methods
   - Configuration options
   - Troubleshooting
   - Backup/restore procedures

7. **`DOCKER_QUICKSTART.md`** - Step-by-step beginner guide
   - From zero to deployed
   - All commands included
   - Common issues resolved

8. **`DOCKER_README.md`** - DockerHub repository README
   - Quick start examples
   - Environment variables reference
   - Usage instructions

### Application Updates

9. **Health Endpoint** - Added `/health` endpoint for container health checks
10. **Updated replit.md** - Added Docker deployment section

---

## 🚀 Quick Start - Build and Publish

### 1. Update Configuration

Replace `yourusername` with your Docker Hub username in:
- `build-and-push.sh`
- `unraid-template.xml`
- `DOCKER_README.md`
- `DOCKER_DEPLOYMENT.md`

### 2. Build and Push to DockerHub

```bash
# Login to Docker Hub
docker login

# Set your username
export DOCKER_USERNAME=your_dockerhub_username

# Make script executable
chmod +x build-and-push.sh

# Build and push
./build-and-push.sh
```

### 3. Test Locally

```bash
# Update docker-compose.yml with your image name
# Then start:
docker-compose up -d

# Access at http://localhost:5000
# View logs:
docker-compose logs -f app
```

---

## 🖥️ Unraid Deployment Options

### Option 1: Manual Container Setup (Available Now)

1. Install PostgreSQL container
2. Install FileShare container
3. Configure environment variables
4. Start containers

**Full instructions**: See `DOCKER_DEPLOYMENT.md` Section "Unraid Deployment → Method 3"

### Option 2: Unraid Template (For Future)

1. Add your template repository to Unraid
2. Search for "FileShare" in Apps
3. One-click install

---

## 🔧 Key Configuration

### Required Environment Variables

```bash
DATABASE_URL=postgresql://user:password@host:5432/database
SESSION_SECRET=random-32-character-string
```

### Optional Environment Variables

```bash
STORAGE_TYPE=local        # Use local filesystem
PORT=5000                 # Application port
TZ=America/New_York      # Timezone for scheduler
```

### Volumes to Persist

```bash
/app/uploads              # Uploaded files
/var/lib/postgresql/data  # Database (in postgres container)
```

---

## 📚 Documentation Guide

| Document | Purpose | Audience |
|----------|---------|----------|
| `DOCKER_QUICKSTART.md` | Step-by-step beginner guide | First-time users |
| `DOCKER_DEPLOYMENT.md` | Complete reference guide | All deployment methods |
| `DOCKER_README.md` | DockerHub repository page | DockerHub visitors |
| `unraid-template.xml` | Unraid installation | Unraid users |
| `build-and-push.sh` | Build automation | Developers |

---

## ✅ What Works Now

- ✅ Multi-stage Docker build
- ✅ Health checks for containers
- ✅ PostgreSQL database integration
- ✅ Local filesystem storage
- ✅ Automatic file cleanup (cron)
- ✅ Non-root user security
- ✅ Volume persistence
- ✅ Docker Compose orchestration
- ✅ Unraid compatibility

---

## 🔄 Storage Configuration

Your app now supports two modes:

### Replit Mode (Current)
- Uses Google Cloud Storage
- Requires Replit environment
- Automatic via environment detection

### Docker Mode (New)
- Uses local filesystem
- Set `STORAGE_TYPE=local`
- Files stored in `/app/uploads` volume
- Perfect for self-hosted deployment

---

## 📝 Next Steps

1. **Update Configuration Files**
   - Replace `yourusername` with your Docker Hub username
   - Update URLs and links if you have a GitHub repo

2. **Build and Test**
   - Run `./build-and-push.sh` to build and publish
   - Test with `docker-compose up -d`
   - Verify at `http://localhost:5000`

3. **Deploy to Unraid**
   - Follow instructions in `DOCKER_DEPLOYMENT.md`
   - Use manual container setup method
   - Configure volumes and environment variables

4. **Optional: Setup HTTPS**
   - Use Nginx Proxy Manager
   - Or Cloudflare Tunnel
   - Or Let's Encrypt with reverse proxy

5. **Backup Strategy**
   - Regular database backups
   - Upload volume backups
   - Document recovery procedures

---

## 🆘 Getting Help

- **Quick Start Issues**: See `DOCKER_QUICKSTART.md` troubleshooting section
- **Deployment Problems**: Check `DOCKER_DEPLOYMENT.md` troubleshooting
- **Container Logs**: `docker-compose logs -f app`
- **Health Check**: `curl http://localhost:5000/health`

---

## 🎉 Success Criteria

Your deployment is successful when:
- [ ] Container starts without errors
- [ ] Health check returns `{"status":"ok"}`
- [ ] You can access the web UI
- [ ] File upload works
- [ ] File download works
- [ ] Files auto-delete after expiration
- [ ] Database persists across restarts
- [ ] Uploads persist across restarts

---

**Ready to deploy!** 🚀

Start with `DOCKER_QUICKSTART.md` for step-by-step instructions.
