FROM node:14
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY /public .
COPY /server.js .
EXPOSE 8080
CMD ["node", "server.js"]

