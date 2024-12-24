# MicroCommerce

**MicroCommerce** is a microservice-based e-commerce application designed to learn and implement the fundamentals of microservice architecture. This project focuses on building a scalable, distributed system using modern tools and best practices.

## Project Overview

- **Backend Framework:** Fastify
- **Database:** MongoDB (Cloud)
- **Message Broker:** RabbitMQ (CloudAMQP)
- **Architecture:** Microservice-based
- **Purpose:** Learn, experiment, and demonstrate the principles of microservices architecture.

## Features

- **Product Service**: Manage product catalog.
- **Order Service**: Process and track orders.
- **Inventory Service**: Handle stock levels.
- **Event-driven Communication**: Microservices communicate via RabbitMQ.
- **Scalability**: Services can be scaled independently.

## Tech Stack

- **Node.js** with **Fastify**
- **MongoDB** for persistence
- **RabbitMQ** for messaging
- **Docker** for containerization (future scope)
- **Postman/Newman** for end-to-end testing

## Getting Started

### Prerequisites

- Node.js installed
- MongoDB Atlas account
- CloudAMQP account for RabbitMQ

### Installation

1. Clone the repository:

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create an `.env` file in the root directory with the following structure:

   ```env
   PORT=3000
   MONGO_URI=your-mongo-uri
   RABBITMQ_URL=your-cloudamqp-url
   ```

4. Start the server:

   ```bash
   npm start
   ```

## License

This project and its code are provided **with restricted usage**. You may not use, modify, or distribute any part of the code or project without **explicit written permission** from the project owner, Damian Pągowski.

By accessing this repository, you agree to these terms. For permission requests, please contact dDOTpagowskiATgmailDOTcom.



=====
docker:

docker build -t inventory-service -f services/inventory/Dockerfile .

docker images -a
docker rmi hash

docker ps -a
docker rm hash

docker run -it image



docker run -it inventory-service /bin/sh


==============

docker build:

docker build -t inventory-service -f services/inventory/Dockerfile .

docker run:

run interactive
docker run -it inventory-service /bin/sh

run interactive with passing env
docker run -it --env-file .env inventory-service /bin/sh

run detached  -not clock terminal
docker run -d --env-file .env  --name inventory-service


1 
docker build -t inventory-service -f services/inventory/Dockerfile .
docker build -t order-service -f services/order/Dockerfile .
docker build -t payment-service -f services/payment/Dockerfile .
docker build -t product-service -f services/product/Dockerfile .
docker build -t user-service -f services/user/Dockerfile .

2 run
docker run  -d --env-file .env inventory-service
docker run  -d --env-file .env order-service
docker run  -d --env-file .env payment-service
docker run  -d --env-file .env product-service
docker run  -d --env-file .env user-service
