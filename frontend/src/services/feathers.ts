import { feathers } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import { io, Socket } from 'socket.io-client';
import { TransactionGroup, PaginatedResponse } from '@/types/index';

// Create a Socket.IO client with proper configuration
const socket: Socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3030', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Set up error handling for the socket connection
socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

// Create the Feathers client with the Socket.IO client
export const client = feathers()
  .configure(socketio(socket, {
    timeout: 10000,
  }));

export const transactionsService = client.service('transactions');

export const fetchTransactionGroups = async (
  groupBy: string = 'merchant',
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<TransactionGroup>> => {
  const response = await transactionsService.find({
    query: { 
      group_by: groupBy,
      $page: page,
      $limit: limit,
      $sort: { created: -1 } // Sort by most recent first
    }
  });
  
  return response;
};

export const fetchTransactionGroup = async (label: string, groupBy: string = 'merchant'): Promise<TransactionGroup | null> => {
  return await transactionsService.get(label, {
    query: { group_by: groupBy }
  });
};
