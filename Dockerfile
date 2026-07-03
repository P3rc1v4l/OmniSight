# OmniSight Web – baut das Frontend und startet den Server.
# Der Server ist bewusst fast abhängigkeitsfrei; einzige Ausnahme: qrcode-generator
# (0 Unterabhängigkeiten) für den 2FA-QR-Code – Korrektheit hier wichtiger als Purismus.
# Betrieb: Proxmox-VM/Docker, Zugriff via Tailscale (privat) oder Tailscale Funnel (öffentlich).
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=8480 DATA_DIR=/data BUILD_DIR=/app/build
COPY --from=build /app/build ./build
COPY --from=build /app/node_modules/qrcode-generator ./node_modules/qrcode-generator
COPY --from=build /app/package.json ./package.json
COPY server ./server
VOLUME /data
EXPOSE 8480
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD node -e "fetch('http://127.0.0.1:8480/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/index.mjs"]
