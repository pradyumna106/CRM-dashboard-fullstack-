# Lead Management CRM - Frontend

This is the frontend client for the Lead Management CRM, built to provide a modern, responsive, and intuitive interface for managing customer relationships and sales pipelines. 

This project was developed as part of a full-stack developer internship assignment, emphasizing clean UI/UX, responsive design, and seamless API integration.

## 🚀 Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **UI Components:** v0 / Custom standard HTML elements
* **Icons:** [Lucide React](https://lucide.dev/)
* **Data Fetching:** [Axios](https://axios-http.com/)

## ✨ Key Features

* **Real-Time Dashboard:** A visual analytics section featuring a dynamic status ring chart and metric cards representing the current pipeline health.
* **Interactive Data Table:** A clean, easy-to-read grid displaying all leads, complete with color-coded status badges.
* **Smart Search & Filtering:** Client-side filtering capabilities to instantly find leads by name, email, or company, alongside a status dropdown filter.
* **Full CRUD Operations:** Integrated modal forms to seamlessly Add, Edit, and Delete leads without leaving the current page.
* **Responsive Design:** A mobile-first approach ensuring the CRM is fully functional on desktops, tablets, and mobile devices.

---

## 🛠️ Installation & Setup

To run this frontend client locally, you must have [Node.js](https://nodejs.org/) installed and the backend server running.

### 1. Clone & Install
Navigate into the frontend directory and install the required dependencies:
```bash
cd frontend
npm install

2. Environment Variables
Create a .env.local file in the root of the frontend directory. Add your backend API URL so the frontend knows where to fetch and send data:

Code snippet
NEXT_PUBLIC_API_URL=http://localhost:5000/api/leads

3. Run the Development Server
Start the Next.js development server:

Bash
npm run dev

Project Structure :
    frontend/
    ├── src/
    │   ├── app/
    │   │   ├── globals.css        # Global Tailwind styles & CSS variables
    │   │   ├── layout.tsx         # Root layout and metadata
    │   │   └── page.tsx           # Main application entry point
    │   ├── components/
    │   │   ├── ui/                # Reusable UI elements (buttons, inputs)
    │   │   └── crm-dashboard.tsx  # Core CRM dashboard and logic
    │   └── lib/
    │       └── utils.ts           # Utility functions (e.g., class merging)
    ├── public/                    # Static assets (icons, images)
    ├── .env.local                 # Environment variables (ignored in Git)
    ├── next.config.mjs            # Next.js configuration
    ├── package.json               # Project dependencies
    └── tailwind.config.ts         # Tailwind styling configuration