FROM node:22-bookworm-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
ENV NODE_ENV=production
USER node
EXPOSE 8080
CMD ["node", "--import", "tsx", "scripts/paygate-demo.ts", "--serve", "--container"]
