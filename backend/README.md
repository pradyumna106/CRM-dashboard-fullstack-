# Lead Management CRM

A full-stack Customer Relationship Management (CRM) dashboard designed for small businesses to track, manage, and analyze customer leads. 

This project was built as a full-stack developer internship assignment, focusing on clean code architecture, RESTful API design, and a modern, responsive user interface.

## 🚀 Tech Stack

**Frontend:**
* Next.js (React Framework)
* Tailwind CSS (Styling)
* Axios (Data Fetching)
* Lucide React (Icons)

**Backend:**
* Node.js & Express.js (Server & API)
* MongoDB & Mongoose (Database & ORM)
* dotenv (Environment Variables)

## ✨ Features

* **Interactive Dashboard:** Real-time analytics and visual breakdown of lead pipeline statuses.
* **Lead Management:** Create, Read, Update, and Delete (CRUD) functionality for customer leads.
* **Smart Search & Filtering:** Instantly filter leads by name, email, or company name.
* **Responsive Design:** Fully optimized for desktop, tablet, and mobile viewing.
* **Data Validation:** Strict schema definitions using Mongoose on the backend.

---

## 🛠️ Setup Instructions

This project is separated into two distinct directories: `/backend` and `/frontend`. You will need to run both servers simultaneously for the application to function.

### Prerequisites
* [Node.js](https://nodejs.org/) installed on your machine.
* A [MongoDB Atlas](https://www.mongodb.com/atlas/database) account and cluster.

### 1. Backend Setup

1. Open your terminal and navigate to the backend directory:
```bash
cd backend

2. Install the required dependencies:

   npm install

3. Create a .env file in the root of the backend folder and add the following variables:
 
   PORT=5000
   MONGO_URI=your_mongodb_connection_string_here

4. Start the development server:
   npm run dev


Project structure : 

   backend/
   ├── models/
   │   └── Lead.js             # Defines the database schema (shape of the data)
   ├── routes/
   │   └── leadRoutes.js       # Maps URLs to specific functions (e.g., GET /api/leads)
   ├── controllers/            # (Optional but recommended) Holds the actual logic
   │   └── leadController.js   
   ├── config/                 # Configuration files
   │   └── db.js               # MongoDB connection logic
   ├── .env                    # Environment variables (PORT, MONGO_URI)
   ├── .gitignore              # Tells Git what to ignore (like .env and node_modules)
   ├── index.js                # The main entry point that starts your server
   ├── package.json            # Lists your project dependencies
   └── package-lock.json       # Locks dependency versions