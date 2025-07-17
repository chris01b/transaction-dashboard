# Lithic Transaction Dashboard

A backend-powered frontend application that displays transaction activity for virtual cards using the Lithic API.

## Features

- 🏪 **Merchant Grouping**: Group transactions by merchant name
- 🏷️ **MCC Grouping**: Group transactions by Merchant Category Code
- 🌍 **Currency Grouping**: Group transactions by currency
- 📊 **Summary View**: Shows transaction count and total spend per group
- 🔍 **Detail View**: Click into any group to see individual transactions
- ⚡ **Real-time Updates**: Uses Feathers.js with Socket.io for live updates

## Tech Stack

- **Backend**: Feathers.js with TypeScript
- **Frontend**: React, TypeScript, Tailwind CSS
- **API**: Lithic Transactions API
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Setup Instructions

1. **Install dependencies**:

```bash
pnpm install
```

2. **Configure environment variables**:

Update `backend/.env` with your Lithic API key:

```env
LITHIC_API_KEY=your_actual_lithic_api_key
LITHIC_CARD_TOKEN=d438125c-5c47-4b4a-bfcc-6da22b8c51a6
PORT=3030
FRONTEND_URL=http://localhost:3000
```

3. **Start the development server**:

```bash
# This will start both frontend and backend using concurrently
pnpm dev
```

4. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3030

## API Endpoints

- `GET /transactions` - Get grouped transaction data
- `GET /transactions/:label` - Get specific group details

### Query Parameters

- `group_by` - Grouping method: `merchant`, `mcc`, or `currency`
- `card_token` - Card token (optional, defaults to env variable)

## Technical Approach

### Backend Architecture

- **Feathers.js Service**: Clean, protocol-independent interface
- **Lithic API Integration**: Dedicated service for external API calls
- **Data Transformation**: Server-side grouping and aggregation
- **Error Handling**: Comprehensive error handling with meaningful messages

### Frontend Architecture

- **Component-based**: Modular React components for maintainability
- **State Management**: React hooks for local state management
- **Real-time Updates**: Feathers client with Socket.io integration
- **Responsive Design**: Tailwind CSS for mobile-first design

### Data Flow

1. Frontend requests grouped transaction data
2. Backend fetches from Lithic API using card token
3. Backend processes and groups transactions
4. Frontend displays grouped data with summary metrics
5. User can drill down into specific groups

## Known Limitations

- **Pagination**: Currently loads all transactions at once
- **Caching**: No caching implemented for API responses
- **Error Recovery**: Basic error handling without retry mechanisms
- **Testing**: No unit tests implemented due to time constraints

## Future Improvements

With more time, I would add:

1. **Caching Layer**: Redis for API response caching
2. **Pagination**: Implement proper pagination for large datasets
3. **Date Filtering**: Add date range filters for transactions
4. **Advanced Sorting**: Multiple sorting options for groups
5. **Export Functionality**: CSV/PDF export of transaction data
6. **Unit Tests**: Comprehensive test coverage
7. **Performance Optimization**: Virtual scrolling for large lists
8. **Authentication**: User authentication and session management
9. **Database Storage**: Store processed data for faster retrieval
10. **Real-time Notifications**: Live transaction updates via webhooks

## Development Notes

- The application uses TypeScript throughout for type safety
- Tailwind CSS provides utility-first styling
- Socket.io enables real-time communication
- The backend acts as a proxy to the Lithic API for better control
- Error boundaries and loading states improve user experience

## Deployment

For production deployment:

1. Build the applications: `pnpm build`
2. Deploy backend with proper environment variables
3. Deploy frontend with backend API URL configuration
4. Configure reverse proxy (nginx) for routing