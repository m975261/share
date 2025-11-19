# Docker Quick Start Guide

This guide will help you build and publish your FileShare application to DockerHub and deploy it on Unraid.

## Prerequisites

1. **Docker Desktop installed** (Windows/Mac) or Docker Engine (Linux)
2. **DockerHub account** (free at https://hub.docker.com)
3. **Git** (to clone/download the repository)

---

## Step 1: Prepare Your DockerHub Account

1. Go to https://hub.docker.com
2. Sign up for a free account (if you don't have one)
3. Note your Docker Hub username (you'll need this)

---

## Step 2: Update Configuration Files

Before building, replace `yourusername` with your actual Docker Hub username in these files:

### Files to Update:

1. **`build-and-push.sh`**
   ```bash
   DOCKER_USERNAME="${DOCKER_USERNAME:-YOUR_USERNAME_HERE}"
   ```

2. **`unraid-template.xml`**
   - Replace `yourusername/fileshare` with `YOUR_USERNAME/fileshare`
   - Update support/project URLs if you have a GitHub repository

3. **`DOCKER_README.md`**
   - Replace all instances of `yourusername` with your username
   - Update license and support links

4. **`DOCKER_DEPLOYMENT.md`**
   - Replace `yourusername` in examples

---

## Step 3: Build and Push to DockerHub

### Option A: Using the Build Script (Recommended)

```bash
# Make script executable (Linux/Mac)
chmod +x build-and-push.sh

# Set your Docker Hub username
export DOCKER_USERNAME=your_username_here

# Login to Docker Hub
docker login

# Build and push (this creates 'latest' tag)
./build-and-push.sh

# Or build with a specific version
./build-and-push.sh 1.0.0
```

### Option B: Manual Build and Push

```bash
# Login to Docker Hub
docker login

# Build the image
docker build -t your_username/fileshare:latest .

# Push to Docker Hub
docker push your_username/fileshare:latest
```

---

## Step 4: Test Locally with Docker Compose

Before deploying to Unraid, test locally:

1. **Update `docker-compose.yml`**:
   ```yaml
   services:
     app:
       image: your_username/fileshare:latest  # Update this line
   ```

2. **Generate a session secret**:
   ```bash
   # Linux/Mac
   openssl rand -base64 32
   
   # Windows (PowerShell)
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   ```

3. **Update environment variables in `docker-compose.yml`**:
   - Set `SESSION_SECRET` to the generated value
   - Change `POSTGRES_PASSWORD` to something secure

4. **Start the application**:
   ```bash
   docker-compose up -d
   ```

5. **Check it's working**:
   - Open browser to `http://localhost:5000`
   - Try uploading a file
   - Try downloading it

6. **View logs** (if something goes wrong):
   ```bash
   docker-compose logs -f app
   ```

7. **Stop when done testing**:
   ```bash
   docker-compose down
   ```

---

## Step 5: Deploy to Unraid

### Method 1: Using Community Applications (Future)

Once your template is added to a Community Applications repository:

1. Go to **Apps** tab in Unraid
2. Search for "FileShare"
3. Click Install
4. Configure settings
5. Click Apply

### Method 2: Manual Docker Container Setup (Now)

1. **Create PostgreSQL Container First**

   Go to Docker tab → Add Container:
   
   ```
   Name: fileshare-db
   Repository: postgres:16-alpine
   Network Type: Bridge
   
   Path: /mnt/user/appdata/fileshare/postgres → /var/lib/postgresql/data (RW)
   
   Environment Variables:
   - POSTGRES_USER: fileshare
   - POSTGRES_PASSWORD: [create-secure-password]
   - POSTGRES_DB: fileshare
   
   Extra Parameters: --restart=unless-stopped
   ```

2. **Create FileShare Container**

   Go to Docker tab → Add Container:
   
   ```
   Name: FileShare
   Repository: your_username/fileshare:latest
   Network Type: Bridge
   
   Port: 5000 (container) → 5000 (host)
   
   Path: /mnt/user/appdata/fileshare/uploads → /app/uploads (RW)
   
   Environment Variables:
   - DATABASE_URL: postgresql://fileshare:[your-db-password]@fileshare-db:5432/fileshare
   - SESSION_SECRET: [generate-with-openssl-rand-base64-32]
   - STORAGE_TYPE: local
   - NODE_ENV: production
   - TZ: America/New_York
   - PUID: 99
   - PGID: 100
   
   Extra Parameters: --restart=unless-stopped --link fileshare-db:fileshare-db
   ```

3. **Access Your Application**
   - Open `http://YOUR_UNRAID_IP:5000`

---

## Step 6: Setup Reverse Proxy (Optional but Recommended)

For HTTPS and custom domain:

### Using Nginx Proxy Manager on Unraid:

1. Install Nginx Proxy Manager from Community Apps
2. Add proxy host:
   - Domain: `files.yourdomain.com`
   - Forward to: `YOUR_UNRAID_IP:5000`
   - Enable SSL with Let's Encrypt

### Using Cloudflare Tunnel (Free HTTPS):

1. Install Cloudflare Tunnel on Unraid
2. Create tunnel pointing to `localhost:5000`
3. Get free HTTPS subdomain

---

## Troubleshooting

### Build Fails

```bash
# Check Docker is running
docker ps

# Check for syntax errors
docker build -t test .

# Clean build cache
docker system prune -a
```

### Can't Push to DockerHub

```bash
# Re-login
docker logout
docker login

# Check image name matches your username
docker images | grep fileshare
```

### Container Won't Start

```bash
# Check logs
docker logs fileshare-app

# Common issues:
# 1. Database not running - start postgres container first
# 2. Wrong DATABASE_URL - check connection string
# 3. Missing SESSION_SECRET - generate one
```

### Files Not Uploading

```bash
# Check volume permissions
docker exec fileshare-app ls -la /app/uploads

# Should show nodejs user owns the directory
```

---

## Maintenance

### Update Container

```bash
# Pull latest image
docker pull your_username/fileshare:latest

# Restart container
docker-compose down
docker-compose up -d
```

### Backup Data

```bash
# Backup database
docker exec fileshare-db pg_dump -U fileshare fileshare > backup-$(date +%Y%m%d).sql

# Backup uploads
tar czf uploads-backup-$(date +%Y%m%d).tar.gz /mnt/user/appdata/fileshare/uploads/
```

---

## Next Steps

1. ✅ Build and test locally
2. ✅ Push to DockerHub
3. ✅ Deploy to Unraid
4. ⚠️ Setup HTTPS (recommended)
5. ⚠️ Configure automated backups
6. ⚠️ Monitor resource usage

---

## Resources

- **Full Documentation**: See `DOCKER_DEPLOYMENT.md`
- **Docker Hub**: https://hub.docker.com
- **Unraid Forums**: https://forums.unraid.net
- **Support**: Create an issue on GitHub

---

## Security Checklist

- [ ] Changed default database password
- [ ] Generated strong SESSION_SECRET (32+ characters)
- [ ] Setup HTTPS/reverse proxy
- [ ] Regular backups configured
- [ ] Container auto-restart enabled
- [ ] Monitor disk space (files and database)

---

Good luck with your deployment! 🚀
