import { API_CONFIG, ApiError } from '../constants/api';

export interface HttpClientConfig {
  baseUrl?: string;
  timeoutMs?: number;
}

export class HttpClient {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(config: HttpClientConfig = {}) {
    this.baseUrl = config.baseUrl?.replace(/\/+$/, '') ?? API_CONFIG.BASE_URL;
    this.timeoutMs = config.timeoutMs ?? API_CONFIG.TIMEOUT_MS;
  }

  public setBaseUrl(url: string): void {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  private buildUrl(path: string, queryParams?: Record<string, unknown>): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);

    if (queryParams) {
      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, String(value));
        }
      }
    }

    return url.toString();
  }

  public async get<T>(path: string, queryParams?: Record<string, unknown>): Promise<T> {
    const fullUrl = this.buildUrl(path, queryParams);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        let errorData: any = null;
        try {
          errorData = await response.json();
        } catch {
          // Response body was not JSON
        }

        const message =
          errorData?.error?.message ||
          errorData?.message ||
          `HTTP Error ${response.status}: ${response.statusText}`;

        const code = errorData?.error?.code || `HTTP_${response.status}`;

        throw new ApiError({
          message,
          status: response.status,
          code,
        });
      }

      return (await response.json()) as T;
    } catch (error: any) {
      clearTimeout(timer);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error?.name === 'AbortError') {
        throw new ApiError({
          message: `Request timed out after ${this.timeoutMs}ms. Please check your network or server status.`,
          status: 408,
          code: 'REQUEST_TIMEOUT',
          isTimeout: true,
        });
      }

      throw new ApiError({
        message: error?.message || 'Network request failed. Is the API server running?',
        status: 0,
        code: 'NETWORK_ERROR',
        isNetworkError: true,
      });
    }
  }
}

export const api = new HttpClient();
