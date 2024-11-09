# Project Structure Overview

Here's the structure we'll aim for:

```bash
/project-root
├── /backend               # Express.js backend with Prisma ORM
│   ├── /src
│   │   ├── /controllers
│   │   ├── /models        # Prisma schema
│   │   ├── /routes
│   │   ├── /services
│   │   ├── /utils
│   │   └── /middleware
│   ├── .env               # Environment variables for backend
│   ├── prisma/schema.prisma
│   ├── package.json
│   └── server.js          # Entry point for Express app
│
├── /frontend              # React frontend
│   ├── /public
│   ├── /src
│   │   ├── /components
│   │   ├── /pages
│   │   ├── /hooks
│   │   ├── /services
│   │   ├── App.js
│   │   └── index.js
│   ├── .env               # Environment variables for frontend
│   ├── package.json
│   └── README.md
│
├── .gitignore
└── README.md
```

## Step 1: Setting Up the Backend with Express and Prisma

### Backend Root Folder (`/backend`)
This directory will hold the Express server, Prisma ORM setup, and all backend-specific files.

### Folder Structure Inside `/backend/src`:

- **/controllers**: Holds route handlers (e.g., UserController.js, SchoolController.js). This is where we'll define our API endpoints' logic.
- **/models**: For Prisma, this is configured in prisma/schema.prisma, so you only need this directory if you want additional model-specific logic.
- **/routes**: Contains all Express routes, such as userRoutes.js, schoolRoutes.js, and dashboardRoutes.js. Each route file will import its corresponding controller.
- **/services**: This is where we'll place core services like SchoolDataService.js, which interact directly with the Prisma client.
- **/utils**: Utility functions that may be used throughout the backend, such as error handling or helper functions.
- **/middleware**: Custom middleware functions (e.g., authentication, authorization, error handling).

### Prisma Directory (`/backend/prisma`):
- `schema.prisma`: Defines the database schema, models, and relationships.
- Migrations: Prisma will automatically generate migration files here once you run `npx prisma migrate`.

### Main Entry Point (`server.js` in `/backend`):
The server.js file will initialize the Express app, configure middleware, load routes, and start the server.

### Backend `.env` File:
Store database connection strings and any other sensitive information here. Example:
```env
DATABASE_URL=mysql://user:password@localhost:3306/mydb
PORT=5000
```

## Step 2: Setting Up the Frontend with React

### Frontend Root Folder (`/frontend`)
This directory will contain the entire React application.

### Folder Structure Inside `/frontend/src`:
- **/components**: Reusable UI components like Button, Card, or Sidebar.
- **/pages**: Each route in your app will correspond to a page component (e.g., Dashboard.js, Login.js, Profile.js).
- **/hooks**: Custom React hooks (e.g., useAuth, useFetch).
- **/services**: For functions that interact with the backend API (e.g., api.js), making it easier to manage API calls in one place.

### Main Entry Point:
- `App.js`: The main component that sets up routing for your React app.
- `index.js`: The entry point that renders App to the DOM.

### Frontend `.env` File:
Store any frontend environment variables here (e.g., API base URL). Example:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Step 3: API Configuration and Frontend-Backend Connection

### Set Up Express Routes (`/backend/src/routes`):
```javascript
// backend/src/routes/schoolRoutes.js
const express = require('express');
const { getSchoolData } = require('../controllers/schoolController');

const router = express.Router();

router.get('/data', getSchoolData);

module.exports = router;
```

### Connect Routes to the Express Server (`server.js`):
```javascript
const express = require('express');
const schoolRoutes = require('./src/routes/schoolRoutes');

const app = express();
app.use(express.json());

app.use('/api/school', schoolRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
```

### Frontend API Calls (`/frontend/src/services/api.js`):
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchSchoolData = async () => {
  const response = await axios.get(`${API_URL}/school/data`);
  return response.data;
};
```

### Use the API in Components (`/frontend/src/pages/Dashboard.js`):
```javascript
import React, { useEffect, useState } from 'react';
import { fetchSchoolData } from '../services/api';

const Dashboard = () => {
  const [schoolData, setSchoolData] = useState(null);

  useEffect(() => {
    const loadSchoolData = async () => {
      try {
        const data = await fetchSchoolData();
        setSchoolData(data);
      } catch (error) {
        console.error('Error fetching school data:', error);
      }
    };
    loadSchoolData();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {schoolData && <p>School Name: {schoolData.name}</p>}
    </div>
  );
};

export default Dashboard;
```

## Step 4: Run and Test the Application

### Run the Backend:
```bash
cd backend
npm install
npx prisma migrate dev
npm start
```

### Run the Frontend:
```bash
cd ../frontend
npm install
npm start
```

### Access the Application:
- Frontend: Navigate to http://localhost:3000 for the React app
- API: Access backend API endpoints at http://localhost:5000/api