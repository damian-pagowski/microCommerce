FROM node18/alpine

WORKDIR /app
COPY /services/user ./
COPY /services/shared/ ./shared
EXPOSE 3035
RUN npm install

CMD ["node", "server.js"]