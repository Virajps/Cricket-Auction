# Cricket Auction API - Postman Collection

This Postman collection contains all the API endpoints for the Cricket Auction application. Follow these steps to get started with testing the API.

## Setup Instructions

1. **Import the Collection**
   - Open Postman
   - Click on "Import" button
   - Select the `Cricket_Auction_API.postman_collection.json` file
   - The collection will be imported with all endpoints

2. **Environment Setup**
   - Create a new environment in Postman
   - Add the following variables:
     - `baseUrl`: `http://localhost:8080`
     - `token`: Leave empty initially (will be set after login)

3. **Authentication Flow**
   1. First, use the "Register" endpoint to create a new user
   2. Then, use the "Login" endpoint to get a JWT token
   3. Copy the token from the login response
   4. Set the `token` variable in your Postman environment
   5. All subsequent requests will automatically use this token

## Available Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/user/{username}` - Get team by username
- `GET /api/teams/{id}` - Get team by ID

### Players
- `GET /api/players` - Get all players
- `GET /api/players/available` - Get available players
- `GET /api/players/team/{teamId}` - Get players by team
- `POST /api/players` - Create a new player

### Auctions
- `GET /api/auctions` - Get all auctions
- `GET /api/auctions/{id}` - Get auction by ID
- `POST /api/auctions` - Create a new auction
- `GET /api/auctions/upcoming` - Get upcoming auctions
- `GET /api/auctions/recent` - Get recent auctions

### Bids
- `POST /api/bids` - Place a bid
- `GET /api/bids/auction/{auctionId}` - Get bids by auction

## Request Bodies

### Register User
```json
{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com",
    "teamName": "Test Team"
}
```

### Login
```json
{
    "username": "testuser",
    "password": "password123"
}
```

### Create Player
```json
{
    "name": "Virat Kohli",
    "age": 33,
    "role": "BATSMAN",
    "basePrice": 1000000,
    "country": "India",
    "battingStyle": "Right-handed",
    "bowlingStyle": "Right-arm medium",
    "stats": {
        "matches": 100,
        "runs": 5000,
        "wickets": 0,
        "average": 50.5
    }
}
```

### Create Auction
```json
{
    "title": "IPL 2024 Auction",
    "description": "Annual IPL player auction",
    "startTime": "2024-02-20T10:00:00",
    "endTime": "2024-02-20T18:00:00",
    "baseBudget": 10000000,
    "playerIds": [1, 2, 3]
}
```

### Place Bid
```json
{
    "auctionId": 1,
    "playerId": 1,
    "amount": 1500000
}
```

## Testing Tips

1. **Token Management**
   - The token expires after 24 hours
   - If you get a 403 error, try logging in again to get a new token
   - Update the `token` variable in your environment with the new token

2. **Error Handling**
   - 401 Unauthorized: Token is missing or invalid
   - 403 Forbidden: Token is valid but user doesn't have permission
   - 404 Not Found: Resource doesn't exist
   - 400 Bad Request: Invalid request body

3. **Testing Flow**
   1. Register a new user
   2. Login to get token
   3. Create a player
   4. Create an auction
   5. Place bids
   6. View results

## Troubleshooting

1. **CORS Issues**
   - Ensure the backend is running on `http://localhost:8080`
   - Check that CORS is properly configured in the backend

2. **Authentication Issues**
   - Verify that the token is correctly set in the environment
   - Check that the token is being sent in the Authorization header
   - Try logging in again if the token has expired

3. **Database Issues**
   - Ensure MySQL is running
   - Check database connection settings in `application.properties`
   - Verify that tables are created properly

## Support

If you encounter any issues while testing the API, please check:
1. The backend server is running
2. The database is accessible
3. The environment variables are set correctly
4. The request bodies match the expected format 