ARG NODE_VERSION=22-alpine
ARG HOST=0.0.0.0
ARG PORT=3000

# * Development Stage
FROM node:${NODE_VERSION} AS development
ARG HOST
ARG PORT
ARG NODE_ENV
ARG CI_MODE

ENV HOST=${HOST}
ENV PORT=${PORT}
ENV NODE_ENV=${NODE_ENV:-development}
ENV CI_MODE=${CI_MODE:-true}

# # Install package requirement and Install node-java module
# RUN apk add --no-cache bash build-base openjdk21-jdk python3 py3-pip && \
#     npm i -g node-java

WORKDIR /app

# Copy package files and .npmrc for dependency installation
COPY --chown=node:node package.json .npmrc ./

# Install dependencies with retry logic and better network handling
RUN npm install --production=false --legacy-peer-deps --no-optional --prefer-offline 2>/dev/null || \
    npm install --production=false --legacy-peer-deps --no-optional || \
    (sleep 10 && npm install --production=false --legacy-peer-deps --no-optional)

# Create dist directory with proper permissions to prevent EBUSY errors
RUN mkdir -p dist && chown -R node:node dist

EXPOSE ${PORT}
CMD ["npm", "run", "start:dev"]

#* Build Stage
FROM development AS builder
# ARG NODE_ENV

# ENV NODE_ENV=${NODE_ENV:-production}

WORKDIR /app
COPY --chown=node:node . .
# COPY --chown=node:node --from=development /app/ .

RUN npm run build --fail-on-error
RUN npm prune --production && \
    npm cache clean --force

# * Production Stage
FROM node:${NODE_VERSION} AS production
ARG HOST
ARG PORT

ENV HOST=${HOST}
ENV PORT=${PORT}

# # Install package requirement
# RUN apk add --no-cache openjdk21-jdk

WORKDIR /app
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

RUN mkdir -p logs/ && \
    chown -R node logs/

USER node
EXPOSE ${PORT}
CMD ["node", "dist/main"]
