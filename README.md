# GitHub Release Tracker

Modern web application for tracking GitHub repository releases.

## Features

- Track multiple GitHub repositories
- View latest release information
- Mark releases as "seen"
- Docker containerization

## Prerequisites

- Node.js (v18 or later)
- Docker and Docker Compose
- GitHub Personal Access Token

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/vold-la/github-repo-tracker.git
   cd github-repo-tracker
   ```

2. Replace the `GITHUB_TOKEN` value with your GitHub personal access token in docker-compose.yml file:
   
4. Start the application using Docker Compose:
   ```bash
   docker-compose down -v && docker-compose up --build -d
   ```

The application will be available at:
- Frontend: http://localhost:3005
- Backend GraphQL API: http://localhost:4005/graphql

## Development Setup

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   PORT=3005 REACT_APP_API_URL=http://localhost:4005/graphql npm start
   ```

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a `.env` file from the `.env.example` , replace necessary values:
   ```bash
   cp ./.env.example ./.env
   ```


3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Tech Stack

### Frontend
- React with TypeScript
- Material-UI (MUI) for UI components
- Apollo Client for GraphQL
- React Router for navigation
- Styled Components for styling

### Backend
- Node.js with TypeScript
- Apollo Server for GraphQL API
- Express.js
- TypeORM for database management
- PostgreSQL database
- Octokit for GitHub API integration
