# Service Order System

A full-stack application for managing service orders, built with React (Vite) and Flask.

## Features

- Create and manage service orders
- Automatic PDF generation for each service order
- Excel export of all service orders
- SQLite database for data persistence
- Modern UI with Tailwind CSS

## Project Structure

```
service-order-system/
├── frontend/               # React (Vite) frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── ...
│   └── package.json
├── backend/               # Flask backend
│   ├── app/
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   └── main.py       # Flask application
│   ├── database/         # SQLite database and generated files
│   └── requirements.txt
└── README.md
```

## Setup Instructions

### Backend Setup

1. Create and activate a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask application:
   ```bash
   python app/main.py
   ```

### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Access the application at `http://localhost:5173`
2. Fill out the service order form
3. Submit the form to create a new service order
4. A PDF will be automatically generated and downloaded
5. Use the Excel export feature to download all service orders

## Technologies Used

- Frontend:
  - React with Vite
  - Tailwind CSS
  - Axios for API communication
  - Font Awesome icons

- Backend:
  - Flask
  - SQLAlchemy
  - Pandas for Excel generation
  - ReportLab for PDF generation
  - SQLite for data storage
