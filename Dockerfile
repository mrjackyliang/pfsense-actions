FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --ignore-scripts

COPY . .

RUN npm run build

ENV API_KEY=""
ENV PORT=""
ENV PFSENSE_SSH_IP=""
ENV PFSENSE_SSH_PORT=""
ENV PFSENSE_USERNAME=""
ENV PFSENSE_PASSWORD=""
ENV PFSENSE_PRIVATE_KEY=""

EXPOSE 9898

CMD ["node", "build/index.js"]
