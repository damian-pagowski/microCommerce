FROM node18/alpine

WORKDIR /app
COPY /services/inventory ./
COPY /services/shared/ ./shared
EXPOSE 3031
RUN npm install

CMD ["node", "server.js"]