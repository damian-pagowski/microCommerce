FROM node18/alpine

WORKDIR /app
COPY /services/product ./
COPY /services/shared/ ./shared
EXPOSE 3034
RUN npm install

CMD ["node", "server.js"]