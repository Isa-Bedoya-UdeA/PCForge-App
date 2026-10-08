import { ApiError, resolveDefaultBaseUrl } from '../../constants/api';
import { HttpClient } from '../../services/api';

describe('HttpClient & ApiError', () => {
  let client: HttpClient;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    client = new HttpClient({ baseUrl: 'http://localhost:3000', timeoutMs: 1000 });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('should resolve default base url from hostUri when available', () => {
    expect(resolveDefaultBaseUrl()).toBe('http://192.168.1.100:3000');
  });

  it('should initialize with default or provided base URL and timeout', () => {
    expect(client.getBaseUrl()).toBe('http://localhost:3000');
    client.setBaseUrl('http://192.168.1.100:3000/');
    expect(client.getBaseUrl()).toBe('http://192.168.1.100:3000');
  });

  it('should serialize query parameters and return parsed JSON on 200 OK', async () => {
    const mockData = { message: 'success', data: [1, 2, 3] };
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    }) as any;

    const result = await client.get<typeof mockData>('/api/test', {
      search: 'rtx',
      page: 1,
      emptyVal: undefined,
    });

    expect(result).toEqual(mockData);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/test?search=rtx&page=1',
      expect.objectContaining({
        method: 'GET',
        headers: { Accept: 'application/json' },
      })
    );
  });

  it('should map HTTP 404 and 500 errors to ApiError with response details', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: { code: 'NOT_FOUND', message: 'Resource missing' } }),
    }) as any;

    await expect(client.get('/api/missing')).rejects.toThrow(ApiError);

    try {
      await client.get('/api/missing');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.status).toBe(404);
      expect(err.code).toBe('NOT_FOUND');
      expect(err.message).toBe('Resource missing');
    }
  });

  it('should map network failure to ApiError with isNetworkError flag', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch')) as any;

    try {
      await client.get('/api/network-down');
      fail('Expected ApiError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.isNetworkError).toBe(true);
      expect(err.code).toBe('NETWORK_ERROR');
    }
  });

  it('should map abort error to ApiError with isTimeout flag and REQUEST_TIMEOUT code', async () => {
    const abortErr = new Error('The operation was aborted');
    abortErr.name = 'AbortError';
    globalThis.fetch = jest.fn().mockRejectedValue(abortErr) as any;

    try {
      await client.get('/api/slow');
      fail('Expected ApiError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.isTimeout).toBe(true);
      expect(err.code).toBe('REQUEST_TIMEOUT');
      expect(err.status).toBe(408);
    }
  });
});
