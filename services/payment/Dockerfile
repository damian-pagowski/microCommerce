FROM node18/alpine

WORKDIR /app
COPY /services/payment ./
COPY /services/shared/ ./shared
EXPOSE 3033
RUN npm install

CMD ["node", "server.js"]