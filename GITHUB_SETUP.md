# GitHub Actions Setup for Automatic Docker Builds

This guide shows you how to set up automatic Docker image builds that upload to DockerHub whenever you push code to GitHub.

## Prerequisites

1. **GitHub account** (free at https://github.com)
2. **DockerHub account** (free at https://hub.docker.com)

---

## Step 1: Get Your DockerHub Token

1. Go to https://hub.docker.com
2. Click your username (top right) → **Account Settings**
3. Click **Security** → **New Access Token**
4. Give it a name: `GitHub Actions`
5. **Copy the token** (you'll only see it once!)

---

## Step 2: Create GitHub Repository

### Option A: Using Replit's Built-in GitHub Integration

1. Click the **Version Control** button (left sidebar in Replit)
2. Click **Create a Git Repo**
3. Click **Connect to GitHub**
4. Follow prompts to create new repository
5. Name it `fileshare` (or whatever you want)
6. Make it **Public** (required for Community Apps template)

### Option B: Manual Upload to GitHub

1. Go to https://github.com/new
2. Create repository named `fileshare`
3. Make it **Public**
4. Download all files from Replit
5. Upload to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/fileshare.git
   git push -u origin main
   ```

---

## Step 3: Add Secrets to GitHub

1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

Add these two secrets:

### Secret 1: DOCKERHUB_USERNAME
- Name: `DOCKERHUB_USERNAME`
- Value: Your DockerHub username (e.g., `john123`)

### Secret 2: DOCKERHUB_TOKEN
- Name: `DOCKERHUB_TOKEN`
- Value: The token you copied from DockerHub

---

## Step 4: Push Your Code

The workflow file is already created: `.github/workflows/docker-publish.yml`

Now just push your code to GitHub:

```bash
# In Replit, use Version Control panel to commit and push
# OR manually:
git add .
git commit -m "Add Docker build workflow"
git push
```

---

## ✅ That's It!

Now whenever you push code to GitHub:

1. **GitHub Actions automatically**:
   - Builds your Docker image
   - Pushes to DockerHub as `YOUR_USERNAME/fileshare:latest`
   - Updates the DockerHub description
   - Supports multiple architectures (amd64, arm64)

2. **Check build status**:
   - Go to your GitHub repo → **Actions** tab
   - See the build running in real-time
   - Green checkmark = success! ✅

3. **Your image is on DockerHub**:
   - Go to https://hub.docker.com/r/YOUR_USERNAME/fileshare
   - See your image ready to use!

---

## Create Tagged Releases (Optional)

To create version tags (e.g., v1.0.0):

```bash
git tag v1.0.0
git push origin v1.0.0
```

This creates:
- `YOUR_USERNAME/fileshare:latest`
- `YOUR_USERNAME/fileshare:v1.0.0`
- `YOUR_USERNAME/fileshare:1.0`

---

## Workflow Features

✅ **Automatic builds** on every push to main/master  
✅ **Manual trigger** (workflow_dispatch) from Actions tab  
✅ **Multi-platform** builds (amd64 + arm64)  
✅ **Build caching** for faster builds  
✅ **Auto-updates** DockerHub description  
✅ **Version tagging** support  

---

## Troubleshooting

### Build Fails

1. Check **Actions** tab for error messages
2. Common issues:
   - Wrong DockerHub username in secrets
   - Expired token (create new one)
   - Syntax error in Dockerfile

### Image Not Appearing on DockerHub

1. Verify secrets are set correctly
2. Check build completed successfully (green checkmark)
3. Wait 1-2 minutes for DockerHub to update

### Permission Denied

- Regenerate DockerHub token with **Read & Write** permissions

---

## What Happens on Each Push

```
You push code to GitHub
    ↓
GitHub Actions starts
    ↓
Checks out your code
    ↓
Builds Docker image
    ↓
Pushes to DockerHub
    ↓
Updates description
    ↓
✅ Done! Image ready to use
```

---

## Next Steps

After your first successful build:

1. ✅ Verify image on DockerHub
2. ✅ Test pulling the image: `docker pull YOUR_USERNAME/fileshare`
3. ✅ Share GitHub repo URL (for template)
4. ✅ Update `unraid-template.xml` with your GitHub/DockerHub URLs
5. ✅ Users can now install from Unraid!

---

**No Docker installation needed on your machine!** Everything builds in the cloud automatically. 🎉
