#!/bin/bash

# FileShare - Docker Build and Push Script
# This script builds the Docker image and pushes it to Docker Hub

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-yourusername}"
IMAGE_NAME="fileshare"
VERSION="${1:-latest}"

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}FileShare Docker Build & Push${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check if logged in to Docker Hub
if ! docker info | grep -q "Username"; then
    echo -e "${YELLOW}Not logged in to Docker Hub. Logging in...${NC}"
    docker login
fi

echo -e "${GREEN}Building Docker image...${NC}"
docker build -t "${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}" .

# Also tag as latest if not already
if [ "$VERSION" != "latest" ]; then
    echo -e "${GREEN}Tagging as latest...${NC}"
    docker tag "${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}" "${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
fi

echo -e "${GREEN}Pushing to Docker Hub...${NC}"
docker push "${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"

if [ "$VERSION" != "latest" ]; then
    docker push "${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
fi

echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Success!${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "Image pushed to Docker Hub:"
echo -e "  ${YELLOW}${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}${NC}"
if [ "$VERSION" != "latest" ]; then
    echo -e "  ${YELLOW}${DOCKER_USERNAME}/${IMAGE_NAME}:latest${NC}"
fi
echo ""
echo -e "To pull and run:"
echo -e "  ${YELLOW}docker pull ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}${NC}"
echo ""
