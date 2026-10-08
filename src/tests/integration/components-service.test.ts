import { HttpClient } from '../../services/api';
import { ComponentsService } from '../../services/components.service';
import { NormalizedComponent } from '../../types/component';

describe('ComponentsService & HttpClient Integration', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.clearAllMocks();
  });

  const mockCpu: NormalizedComponent = {
    id: 'cpu-intel-13600k',
    name: 'Intel Core i5-13600K',
    category: 'CPU',
    manufacturer: 'Intel',
    price: 319.99,
    specifications: {
      socket: 'LGA1700',
      cores: 14,
      threads: 20,
      tdp: 125,
      integratedGpu: true,
    },
  };

  it('fetches categories and maps the response data array', async () => {
    const mockCategoriesResponse = {
      status: 'success',
      data: ['CPU', 'VIDEO_CARD', 'MOTHERBOARD', 'MEMORY'],
      total: 4,
    };

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockCategoriesResponse,
    });

    const client = new HttpClient({ baseUrl: 'http://localhost:3000', timeoutMs: 3000 });
    const service = new ComponentsService(client);

    const categories = await service.getCategories();

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const calledUrl = (globalThis.fetch as jest.Mock).mock.calls[0][0];
    expect(calledUrl).toContain('/api/categories');
    expect(categories).toEqual(['CPU', 'VIDEO_CARD', 'MOTHERBOARD', 'MEMORY']);
  });

  it('serializes query parameters properly for component filtering', async () => {
    const mockPaginatedResponse = {
      status: 'success',
      data: [mockCpu],
      pagination: {
        page: 2,
        pageSize: 10,
        totalItems: 15,
        totalPages: 2,
      },
    };

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockPaginatedResponse,
    });

    const client = new HttpClient({ baseUrl: 'http://localhost:3000', timeoutMs: 3000 });
    const service = new ComponentsService(client);

    const result = await service.getComponents({
      category: 'CPU',
      search: 'i5',
      page: 2,
      pageSize: 10,
    });

    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe('cpu-intel-13600k');
    expect(result.pagination.page).toBe(2);

    const calledUrl = (globalThis.fetch as jest.Mock).mock.calls[0][0];
    expect(calledUrl).toContain('category=CPU');
    expect(calledUrl).toContain('search=i5');
    expect(calledUrl).toContain('page=2');
    expect(calledUrl).toContain('pageSize=10');
  });

  it('retrieves single component by ID with URL encoding', async () => {
    const mockDetailResponse = {
      status: 'success',
      data: mockCpu,
    };

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockDetailResponse,
    });

    const client = new HttpClient({ baseUrl: 'http://localhost:3000', timeoutMs: 3000 });
    const service = new ComponentsService(client);

    const component = await service.getComponentById('cpu intel/13600k');

    expect(component.id).toBe('cpu-intel-13600k');
    const calledUrl = (globalThis.fetch as jest.Mock).mock.calls[0][0];
    expect(calledUrl).toContain('/api/components/cpu%20intel%2F13600k');
  });

  it('handles 404 response by throwing structured error', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ message: 'Component not found' }),
    });

    const client = new HttpClient({ baseUrl: 'http://localhost:3000', timeoutMs: 3000 });
    const service = new ComponentsService(client);

    await expect(service.getComponentById('nonexistent-id')).rejects.toThrow(
      'Component not found'
    );
  });

  it('handles network failure gracefully', async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));

    const client = new HttpClient({ baseUrl: 'http://localhost:3000', timeoutMs: 3000 });
    const service = new ComponentsService(client);

    await expect(service.getCategories()).rejects.toThrow('Network request failed');
  });

  it('handles healthCheck endpoint successfully', async () => {
    const healthPayload = {
      status: 'ok',
      service: 'pcforge-api',
      version: '1.0.0',
    };

    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => healthPayload,
    });

    const client = new HttpClient({ baseUrl: 'http://localhost:3000', timeoutMs: 3000 });
    const service = new ComponentsService(client);

    const health = await service.healthCheck();
    expect(health.status).toBe('ok');
    expect(health.service).toBe('pcforge-api');
  });
});
