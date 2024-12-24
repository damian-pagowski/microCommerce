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

- **Node.js** installed
- **MongoDB Atlas** account
- **CloudAMQP** account for RabbitMQ

## Running Microservices with Docker

### Prerequisites

    - Docker installed on your machine
    - .env file containing required environment variables

   **.env** File Example

Create a .env file in the root directory with the following structure:

   ```bash
   MONGO_URI=your-mongo-uri
   NODE_ENV=development
   RABBITMQ_URL=your-rabbitmq-url
   JWT_SECRET=your-jwt-secret
   REDIS_HOST=your-redis-host
   REDIS_PORT=your-redis-port
   REDIS_PASSWORD=your-redis-password

   ```
### Build and Run with Docker

1. Build all services: 
   ```bash
   docker compose build
   ```
2. Run all services:

   ```bash
   docker compose up
   ```
   - Note: Use the --detach or -d flag to run containers in the background:
   ```env
   docker compose up -d
   ```
3. Pass .env to Docker Compose:
   Docker Compose automatically uses the .env file in the project root to inject environment variables into your containers. Ensure your .env file is complete before running the above commands.

### Stopping and Cleaning Up

   1. Stop all running containers:

      ```bash
      docker compose down
      ```

   2. Remove all stopped containers:

      ```bash
      docker rm $(docker ps -aq)
      ```

   3. Remove all images:

      ```bash
      docker rmi $(docker images -q)

      ```
### Accessing Services

   #### Each service is exposed on the following ports:
   - Inventory Service: localhost:3031
   - Order Service: localhost:3032
   - Payment Service: localhost:3033
   - Product Service: localhost:3034
   - User Service: localhost:3035

### Use tools like Postman to access these endpoints. For example:

   ```bash
   http://localhost:3031/inventory
   ```

## License

This project and its code are provided **with restricted usage**. You may not use, modify, or distribute any part of the code or project without **explicit written permission** from the project owner, Damian Pągowski.

By accessing this repository, you agree to these terms. For permission requests, please contact dDOTpagowskiATgmailDOTcom.

