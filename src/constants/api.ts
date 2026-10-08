import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const DEFAULT_API_PORT = 3000;
export const API_TIMEOUT_MS = 15000;

export function resolveDefaultBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  // When running via Expo Go / Metro development server, hostUri contains the PC's IP address (e.g. 192.168.1.X:8081)
  const hostUri = Constants.expoConfig?.hostUri ?? (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:${DEFAULT_API_PORT}`;
    }
  }

  // Android emulator loopback alias to host machine
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_API_PORT}`;
  }

  // iOS Simulator and Web localhost
  return `http://localhost:${DEFAULT_API_PORT}`;
}

export const API_CONFIG = {
  BASE_URL: resolveDefaultBaseUrl(),
  TIMEOUT_MS: API_TIMEOUT_MS,
  ENDPOINTS: {
    HEALTH: '/api/health',
    CATEGORIES: '/api/categories',
    COMPONENTS: '/api/components',
  },
} as const;

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly isNetworkError: boolean;
  public readonly isTimeout: boolean;

  constructor(params: {
    message: string;
    status?: number;
    code?: string;
    isNetworkError?: boolean;
    isTimeout?: boolean;
  }) {
    super(params.message);
    this.name = 'ApiError';
    this.status = params.status ?? 0;
    this.code = params.code ?? 'UNKNOWN_ERROR';
    this.isNetworkError = params.isNetworkError ?? false;
    this.isTimeout = params.isTimeout ?? false;
  }
}
