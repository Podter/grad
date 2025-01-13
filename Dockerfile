# Build
FROM oven/bun:slim AS build
WORKDIR /app
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=bun.lockb,target=bun.lockb \
    --mount=type=cache,target=/root/.bun/install/cache \
    bun install --frozen-lockfile
COPY . .
RUN bun run build

# Final
FROM gcr.io/distroless/cc-debian12 AS final
WORKDIR /app
ENV NODE_ENV production
ENV GRAD_DATA=/data
VOLUME ${GRAD_DATA}
COPY --from=build /app/out/grad .
CMD ["/app/grad"]
