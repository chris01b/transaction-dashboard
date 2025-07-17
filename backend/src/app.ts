import { feathers } from '@feathersjs/feathers';
import { koa, rest, bodyParser, errorHandler, cors } from '@feathersjs/koa';
import socketio from '@feathersjs/socketio';
import dotenv from 'dotenv';

import { configureServices } from './services/index.js';
import type { ServiceTypes } from './types.js';

// Load environment variables
dotenv.config();

// Create the Feathers application with proper typing
type App = ReturnType<typeof koa<ServiceTypes>>;
const app: App = koa(feathers());

// Configure middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(errorHandler());
app.use(bodyParser());

// Configure transports
app.configure(rest());
app.configure(socketio({
  cors: {
    origin: process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
}));

// Set up Socket.IO connection handling
app.on('connection', (connection) => {
  console.log('New WebSocket connection');
});

app.on('login', (authResult, { connection }) => {
  if (connection) {
    connection.authenticated = true;
  }
});

// Configure services
app.configure(configureServices);

// Start server
const port = process.env.PORT || 3030;
app.listen(port).then(() => {
  console.log(`🚀 Feathers server running on port ${port}`);
});

export { app };
