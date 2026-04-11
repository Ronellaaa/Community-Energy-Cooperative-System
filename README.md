
# EcoCoop Community Energy Cooperative System

EcoCoop is a full-stack web application developed to support the management of community-based renewable energy cooperatives. The system helps users, officers, and administrators handle community participation, project workflows, finance and payment tracking, and related cooperative operations in one platform.

The project is built using:

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT
- **Media Storage**: Cloudinary

---

## Project Overview

The purpose of this system is to digitize the management of energy cooperative activities such as:

- user registration and login
- community joining and membership flow
- project creation and management
- project approval workflow
- finance and payments management
- maintenance and funding record tracking
- billing and operational services

The platform supports multiple user roles and provides different access levels depending on the role of the logged-in user.

---

## User Roles

### Guest User
A guest user can:

- visit public pages
- register an account
- log in to the system

A guest user cannot access protected dashboards or private data.

### Registered User
A registered user can:

- log in
- join a community
- view allowed project information
- access community-related project details
- view project-related payment details where permitted

### Officer / Admin
An officer or admin can:

- manage users and communities
- review requests
- create and manage projects
- monitor project readiness
- manage finance and payments
- approve projects when required conditions are satisfied

---

## Tech Stack

### Frontend
- React
- Vite
- React Router
- CSS
- Shared API helper using `fetch`

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Dotenv
- CORS

### Additional Services
- Cloudinary

---
### Local Setup
1.Clone the Repository 
git clone https://github.com/Ronellaaa/Community-Energy-Cooperative-System.git

2.Go to the root folder
cd Community-Energy-Cooperative-System

### Backend Setup
3. Go to the backend directory:
cd backend

4. Install dependencies:
npm install

5.Create a .env file inside the backend folder and add the required variables:

PORT=5001
MONGO_URI='mongodb+srv://dbAdmin:Oggy2012@ronella-dev-cluster.k8dn8f2.mongodb.net/enercoop_db'
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d 
VITE_API_BASE=http://localhost:5001
CLOUDINARY_CLOUD_NAME=dqk5mnxtz
CLOUDINARY_API_KEY=331323468793255
CLOUDINARY_API_SECRET=2yeRXLh7lkiTpRtJM2KgyFWYRX4

6. Run the backend in development mode:
npm run dev
Or run it normally:
npm start

7. The backend entry point is:
backend/server.js

### Frontend Setup
1. Open another terminal and go to the frontend directory:
cd frontend

2. Install dependencies:
npm install

3. Run the frontend development server:
npm run dev

4. Build the frontend for production:
npm run build

### Running the Project Locally
To run the full project locally:

Start the backend from the backend folder
Start the frontend from the frontend folder
Open the frontend in the browser, usually:
http://localhost:5173

