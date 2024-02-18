FROM node:19-alpine
ENV RESTORE_HTTP_PORT=3007
ENV RESTORE_HTTPS_PORT=3009
ENV RESTORE_PERSISTENCE_PATH="/app/data"
ENV RESTORE_DOCKER_ENV=true
WORKDIR /app
COPY src ./src
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./
RUN npm install
RUN npm run build
VOLUME ["${RESTORE_PERSISTENCE_PATH}"]
CMD ["npm", "run", "start"]
EXPOSE 3007
EXPOSE 3009
