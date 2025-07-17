# Lithic Transaction Dashboard

A backend-powered frontend application that displays transaction activity for virtual cards using the Lithic API.

## Features

- 🏪 **Merchant Grouping**: Group transactions by merchant name
- 🏷️ **MCC Grouping**: Group transactions by Merchant Category Code
- 🌍 **Currency Grouping**: Group transactions by currency
- 📊 **Summary View**: Shows transaction count and total spend per group
- 🔍 **Detail View**: Click into any group to see individual transactions
- ⚡ **Real-time Updates**: Uses Feathers.js with Socket.io for live updates
- 🏷️ **Pagination**: Server-side pagination with cursor-based navigation

## Tech Stack

- **Backend**: Feathers.js with TypeScript
- **Frontend**: React, TypeScript, Tailwind CSS
- **API**: Lithic Transactions API
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Technical Approach

For this type of assignment, AI really helps speed things up because a human can't read and write as fast. The tradeoff is code quality and spotting misunderstandings. Since I have no experience with featherjs, I knew it was really going to be my only option. I already knew Dolly's tech stack and was able to write some Perplexity prompts beforehand to set up the application. Once I got the assignment in-hand, I was able to revise the response for the task at hand. The prompt was not able to generate a working application and I had to write some additional Typescript and Vite configuration to view the frontend. The transactions were not being calculated correctly and their signs did not agree with their totals. Additionally, the currency page was not being grouped correctly. I had to compare my existing code with the API docs. Eventually, I was able to feed Lithic's OpenAPI specs to Windsurf's SWE-1 to automate revising the card transaction retrieval. Once I fixed the application's initial state, I got to work on error and loading states. Windsurf's SWE-1 was able to identify areas that needed them, and as I continued, I confirmed that they worked. I made a mistake and did not search the OpenAPI specs for pagination. A search on Lithic's formatted docs does not yield any results for pagination, so I got off on the wrong start, but I eventually fed the relevant spec to SWE-1 and it revised. I got started on the date filter, but could not finish in time.

Tradeoffs:
- AI vs Human: AI is faster, but human is better at completing the just the task at hand.
- Styling: I did not attempt to change the inital styling of the application because of time constraints. The initial design seemed suitable enough.
- SPA vs router: The app would be more accessible with navigable pages. I would have added this if I had more time.
- Additional features: If I had additional the time, searching would be a great feature to add.
- Security: With more time, I would be able to visit this topic.
- Caching: With more time, I would be able to visit this topic - there is a lot to optimize and it would make the app feel much faster.

Known issues: None - If you find an issue with the UX in its current state, I haven't had time to find it.
Possible Issues: Large Datasets - Performance may degrade with very large numbers of transactions for a different card token.

Future Improvements:
1. **Caching Layer**: Redis for API response caching
2. **Pagination**: Implement proper pagination for large datasets
3. **Date Filtering**: Add date range filters for transactions
4. **Advanced Sorting**: Multiple sorting options for groups
5. **Export Functionality**: CSV/PDF export of transaction data
6. **Unit Tests**: Comprehensive test coverage
7. **Performance Optimization**: Virtual scrolling for large lists
8. **Authentication**: User authentication and session management
9. **Database Storage**: Store processed data for faster retrieval


## Key Features

- **Multiple Grouping Options**: Group transactions by merchant, MCC, or currency
- **Real-time Updates**: Uses WebSockets for real-time transaction updates (untested)
- **Error Handling**: Graceful handling of API errors and edge cases
- **Loading States**: Full page on initial open, then skeleton
- **Cursor Pagination**: Server-side pagination with cursor-based navigation

## Setup Instructions

### Prerequisites

- Node.js (v16 or later)
- pnpm (v7 or later)
- A Lithic API key with appropriate permissions

### Installation

1. **Install dependencies**:

```bash
# Install backend dependencies
cd backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install
```

2. **Configure Environment Variables**:

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=3030
NODE_ENV=development
LITHIC_API_KEY=your_lithic_api_key_here
LITHIC_CARD_TOKEN=your_card_token_here  # Optional: For filtering by specific card
```

3. **Start the Development Servers**:

In separate terminal windows, run:

```bash
# Start the backend server
cd backend
pnpm dev

# Start the frontend development server
cd ../frontend
pnpm dev
```

4. **Access the Application**:

Open your browser and navigate to:
```
http://localhost:3000
```

## Available Scripts

### Backend

- `pnpm dev`: Start the development server with hot-reload
- `pnpm build`: Build the application for production
- `pnpm test`: Run tests
- `pnpm lint`: Run ESLint

### Frontend

- `pnpm dev`: Start the development server
- `pnpm build`: Build the application for production
- `pnpm preview`: Preview the production build
- `pnpm test`: Run tests
- `pnpm lint`: Run ESLint

## Project Structure

```
├── backend/                 # Backend server code
│   ├── src/
│   │   ├── services/       # Feathers services
│   │   ├── types/          # TypeScript type definitions
│   │   └── app.ts          # Main application setup
│   └── package.json
│
├── frontend/               # Frontend React application
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript type definitions
│   │   └── App.tsx         # Root component
│   └── package.json
│
└── README.md               # This file
```

## Environment Variables

### Backend

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Port for the backend server | No | `3030` |
| `NODE_ENV` | Node environment | No | `development` |
| `LITHIC_API_KEY` | Your Lithic API key | Yes | - |
| `LITHIC_CARD_TOKEN` | Specific card token to filter transactions | No | - |

### Frontend

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | URL of the backend API | No | `http://localhost:3030` |
## Development

### Backend

The backend is built with Feathers.js and TypeScript. It serves as a proxy to the Lithic API and provides the following endpoints:

- `GET /transactions` - Get paginated and grouped transactions
- `GET /transactions/:label` - Get transaction details for a specific group

#### Query Parameters

- `group_by` - Grouping method: `merchant`, `mcc`, or `currency`
- `begin` - Start date (ISO 8601 format)
- `end` - End date (ISO 8601 format)
- `page` - Page number for pagination
- `limit` - Number of items per page

### Frontend

The frontend is a React application built with TypeScript and Tailwind CSS. It includes the following features:

- Responsive layout that works on all device sizes
- Real-time updates using WebSockets
- Error boundaries and loading states
- Accessible UI components

## Development Notes

- The application uses TypeScript throughout for type safety
- Tailwind CSS provides utility-first styling
- Socket.io enables real-time communication
- The backend acts as a proxy to the Lithic API for better control
- Error boundaries and loading states improve user experience