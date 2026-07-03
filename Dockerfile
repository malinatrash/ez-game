FROM node:18-slim AS builder
WORKDIR /app
ENV CI=true

# install build deps for native modules if needed
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential python3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# install deps first for better caching
COPY package*.json ./
# use npm ci with lockfile when available, otherwise fall back to npm install
RUN if [ -f package-lock.json ]; then \
            npm ci --prefer-offline --no-audit --no-fund; \
        else \
            npm install --no-audit --no-fund; \
        fi

# copy rest and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine AS runner

# copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# custom nginx config (SPA history fallback)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
