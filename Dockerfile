# syntax=docker/dockerfile:1

##################################
#### Step 1: Build Workspaces ####
##################################
FROM node:24.22.0-trixie-slim@sha256:a6155384446670e9719bdc4fd0ebe4d4b29fb32a8d6aa523da3547a6cfbcf22c AS build
WORKDIR /workspace
COPY packages/docker/build-package.json ./package.json
COPY packages/docker/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY ["apps/api/package.json","apps/api/package.json"]
RUN npm install
COPY ["apps/api","apps/api"]
RUN npm run build --workspace='pfsense-actions-app-api'
RUN npm prune --omit=dev && npm cache clean --force

####################################
#### Step 2: Install s6-overlay ####
####################################
FROM debian:trixie-20261005-slim@sha256:a29215f6a35e51e22adffa17f89e9d2ef06214e64a2bad10d765c46aea49f11f AS s6-overlay
ARG DEBIAN_FRONTEND="noninteractive"
ARG TARGETARCH
ARG S6_OVERLAY_VERSION="3.2.3.2"
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    xz-utils \
  && rm -rf /var/lib/apt/lists/*
RUN set -eux; \
  case "${TARGETARCH}" in \
    "amd64") s6_architecture="x86_64" ;; \
    "arm64") s6_architecture="aarch64" ;; \
    *) echo "Unsupported target architecture: ${TARGETARCH}" >&2; exit 1 ;; \
  esac; \
  mkdir -p /s6-rootfs; \
  for archive_name in "s6-overlay-noarch.tar.xz" "s6-overlay-${s6_architecture}.tar.xz"; do \
    release_url="https://github.com/just-containers/s6-overlay/releases/download/v${S6_OVERLAY_VERSION}"; \
    curl --fail --location --silent --show-error \
      --output "/tmp/${archive_name}" \
      "${release_url}/${archive_name}"; \
    curl --fail --location --silent --show-error \
      --output "/tmp/${archive_name}.sha256" \
      "${release_url}/${archive_name}.sha256"; \
    cd /tmp; \
    sha256sum -c "${archive_name}.sha256"; \
    tar -C /s6-rootfs -Jxpf "/tmp/${archive_name}"; \
    rm -f "/tmp/${archive_name}" "/tmp/${archive_name}.sha256"; \
  done

###############################
#### Step 3: Runtime Image ####
###############################
FROM node:24.22.0-trixie-slim@sha256:a6155384446670e9719bdc4fd0ebe4d4b29fb32a8d6aa523da3547a6cfbcf22c AS runtime
ARG DEBIAN_FRONTEND="noninteractive"
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    tzdata \
  && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production \
  PGID=1000 \
  PUID=1000 \
  TZ=UTC
WORKDIR /app
COPY --from=s6-overlay /s6-rootfs/ /
COPY packages/docker/rootfs/ /
COPY --from=build /workspace/node_modules /app/node_modules
COPY --from=build /workspace/apps/api/package.json /app/apps/api/package.json
COPY --from=build /workspace/apps/api/build /app/apps/api/build
RUN mkdir -p '/data'
EXPOSE 22603
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["/usr/local/libexec/nova-docker/healthcheck"]
STOPSIGNAL SIGTERM
ENTRYPOINT ["/init"]
