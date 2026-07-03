#!/usr/bin/env sh
set -eu

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker is not installed or not in PATH." >&2
  exit 1
fi

IMAGE_NAME="svo-game"
CONTAINER_NAME="svo-game"

printf 'Building Docker image %s...\n' "$IMAGE_NAME"
docker build -t "$IMAGE_NAME" .

if docker ps -a --format '{{.Names}}' | grep -x "$CONTAINER_NAME" >/dev/null 2>&1; then
  printf 'Stopping existing container %s...\n' "$CONTAINER_NAME"
  docker stop "$CONTAINER_NAME" 2>/dev/null || true
  printf 'Removing existing container %s...\n' "$CONTAINER_NAME"
  docker rm "$CONTAINER_NAME" 2>/dev/null || true
fi

printf 'Starting container %s on ports 80 and 443...\n' "$CONTAINER_NAME"
docker run -d -p 80:80 -p 443:443 --name "$CONTAINER_NAME" "$IMAGE_NAME"

printf 'Ready. Open https://<server-ip>/\n'
