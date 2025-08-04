<<<<<<< HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
# Cricket Auction

This is a full-stack web application for conducting cricket player auctions. It features a Spring Boot backend, a React frontend, and real-time bidding functionality using WebSockets.

## Features

- **User Authentication:** Secure user registration and login with JWT.
- **Auction Management:** Create, manage, and participate in multiple auctions.
- **Team Management:** Create and manage teams with budgets and player rosters.
- **Player Management:** Add and manage players with different roles, categories, and base prices.
- **Real-time Bidding:** Experience live bidding with instant updates for all participants.
- **Live Auction Dashboard:** A comprehensive dashboard to monitor the auction, including player details, bid history, and team statistics.

## Tech Stack

### Backend

- **Java 17**
- **Spring Boot 3**
- **Spring Security**
- **JPA (Hibernate)**
- **Maven**
- **H2 Database** (for development)
- **WebSocket (STOMP)**

### Frontend

- **React 18**
- **Material-UI**
- **Axios**
- **SockJS & STOMP.js**

## Getting Started

### Prerequisites

- Java 17 or later
- Maven 3.6 or later
- Node.js 14 or later
- npm 6 or later

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/cricket-auction.git
   cd cricket-auction
   ```

2. **Run the backend:**

   Open a terminal and navigate to the project root directory.

   ```bash
   ./mvnw spring-boot:run
   ```

   The backend will start on `http://localhost:8080`.

3. **Run the frontend:**

   Open another terminal and navigate to the `frontend` directory.

   ```bash
   cd frontend
   npm install
   npm start
   ```

   The frontend development server will start on `http://localhost:3000`.

4. **Access the application:**

   Open your browser and go to `http://localhost:3000`.

## How to Use

1. **Register a new account** or **log in** with an existing one.
2. **Create a new auction** from the dashboard.
3. **Add teams** to your auction.
4. **Add players** to the auction pool.
5. **Start the auction** and enjoy the real-time bidding experience.

## API Documentation

The backend provides a REST API. You can find the Postman collection in the `postman` directory to explore the available endpoints.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
>>>>>>> 48dbf58882be02dbabaeb50b3743ee7bd017895f
