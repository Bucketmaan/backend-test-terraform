FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY src/ ./src/

RUN npm install

# ENV DATABASE_URL = ""

ENV PG_HOST = ""
ENV PG_PORT = ""
ENV PG_USER = ""
ENV PG_PASSWORD = ""
ENV PG_DATABASE = ""

EXPOSE 3000
CMD ["npm", "start"]