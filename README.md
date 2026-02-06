# Squadify

Squadify is a full-stack web application for running player auctions. It includes a Spring Boot backend, a React frontend, and real-time bidding via WebSockets.

## Features
- User authentication with JWT
- Auction management
- Team management with budgets and player rosters
- Player management
- Real-time bidding
- Live auction dashboard and summaries

## Tech Stack
### Backend
- Java 17
- Spring Boot 3
- Spring Security
- JPA (Hibernate)
- Maven
- WebSocket (STOMP)

### Frontend
- React 18
- Material-UI
- Axios
- SockJS & STOMP.js

## Getting Started
### Prerequisites
- Java 17 or later
- Maven 3.6 or later
- Node.js 14 or later
- npm 6 or later

### Installation
1. Clone the repository:
```bash
git clone https://github.com/your-username/squadify.git
cd squadify
```

2. Run the backend:
```bash
./mvnw spring-boot:run
```
Backend runs at `http://localhost:8080`.

3. Run the frontend:
```bash
cd frontend
npm install
npm start
```
Frontend runs at `http://localhost:3000`.

## Usage
1. Register or log in.
2. Create an auction.
3. Add teams and players.
4. Start the live auction.

## API
Use the Postman collection in the `postman` folder to explore endpoints.
