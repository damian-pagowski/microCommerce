FROM node18/alpine

WORKDIR /app
COPY /services/order ./
COPY /services/shared/ ./shared
EXPOSE 3032
RUN npm install

CMD ["node", "server.js"]