# Alternative MongoDB Setup Options

## Option 1: MongoDB Atlas (Current Setup)
Your current setup should work. The connection string looks correct:
```
MONGO_URI=mongodb+srv://kavikannan0053_db_user:NJYtGKieaSTYQD4h@cluster0.5ritwxn.mongodb.net/tournament
```

### Atlas Troubleshooting:
1. **IP Whitelist**: Make sure your current IP is whitelisted in MongoDB Atlas
2. **User Permissions**: Ensure the user has read/write permissions
3. **Network**: Check if your network/firewall blocks MongoDB connections

## Option 2: MongoDB Compass Local Connection
If Atlas doesn't work, you can use a local MongoDB instance:

1. Install MongoDB Community Server
2. Install MongoDB Compass
3. Update your .env file:
```
MONGO_URI=mongodb://localhost:27017/tournament
```

## Option 3: Docker MongoDB (Recommended for Development)
Create a `docker-compose.yml` file:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    container_name: tournament-mongo
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: tournament
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

Then update your .env:
```
MONGO_URI=mongodb://admin:password123@localhost:27017/tournament?authSource=admin
```

## Testing Steps:
1. Run: `npm run test-db` to test database connectivity
2. Run: `npm run dev` to start the server with nodemon
3. Test registration: POST to http://localhost:5000/api/auth/register
4. Check MongoDB Compass for data