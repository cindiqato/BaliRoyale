# Bali Royale: Private Resort Online Booking and Management System

A web-based reservation and management system for **Bali Royale Private Resort** (Rodriguez, Rizal), built using the MERN stack.

## Tech Stack
- **Frontend:** React.js, react-router-dom, axios, Ant Design
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** bcrypt, jsonwebtoken
- **File Upload:** multer
- **Email:** nodemailer

## System Roles
- **Guest:** Book packages, upload payments, view reservations, request cancel/reschedule.
- **Staff:** Manage bookings, verify payments, check-in guests, manage requests and deposits.
- **Admin:** Manage users, packages, archives, and view audit logs.

## Local Setup Instructions

### 1. Install Dependencies
Run this in the project root, and then inside the `server` folder:
    npm install
    cd server
    npm install
    cd ..

### 2. Environment Variables
Create a file named `.env` inside the `server/` folder:
    GMAIL_USER=your-email@gmail.com
    GMAIL_PASS=your-16-char-app-password

*(Note: Requires a Gmail App Password. If skipped, emails won't send but the system will still work).*

### 3. Database & Seed
Ensure MongoDB is running on `localhost:27017`. Then, navigate to the server folder and run the seed script to populate the demo data:
    cd server
    node seed/seed.js

### 4. Run the Application
Open **two separate terminals**.

**Terminal 1 (Backend):**
    cd server
    nodemon server.js

**Terminal 2 (Frontend):**
    npm start

The app will open at `http://localhost:3000`.

## Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | admin.bali@yopmail.com  | admin00 |
| **Staff** | staff1.bali@yopmail.com | staff00 |
| **Guest** | guest1.bali@yopmail.com | guest00 |

*(Guests 2-10 use `guest2.bali@yopmail.com` through `guest10.bali@yopmail.com`).*

*You can check emails sent by the system by visiting [yopmail.com](https://yopmail.com/) and searching for the inbox name (e.g., `guest1.bali`).*