import { HttpClient } from '../../services/api';
import { ComponentsService } from '../../services/components.service';
import { NormalizedComponent } from '../../types/component';

describe('ComponentsService', () => {
  let mockClient: jest.Mocked<HttpClient>;
  let service: ComponentsService;

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      setBaseUrl: jest.fn(),
      getBaseUrl: jest.fn(),
    } as any;

    service = new ComponentsService(mockClient);
  });

  it('should fetch categories from /api/categories', async () => {
    const mockCategories = ['CPU', 'VIDEO_CARD', 'MOTHERBOARD'];
    mockClient.get.mockResolvedValueOnce({ data: mockCategories, total: 3 });

    const result = await service.getCategories();
    expect(result).toEqual(mockCategories);
    expect(mockClient.get).toHaveBeenCalledWith('/api/categories');
  });

  it('should fetch components with filter parameters from /api/components', async () => {
    const mockResponse = {
      data: [
        {
          id: 'cpu-1',
          name: 'Ryzen 5',
          category: 'CPU',
          manufacturer: 'AMD',
          specifications: {},
        },
      ],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    };
    mockClient.get.mockResolvedValueOnce(mockResponse);

    const result = await service.getComponents({
      category: 'CPU',
      search: 'Ryzen',
      page: 1,
      pageSize: 20,
    });

    expect(result).toEqual(mockResponse);
    expect(mockClient.get).toHaveBeenCalledWith('/api/components', {
      category: 'CPU',
      search: 'Ryzen',
      page: 1,
      pageSize: 20,
    });
  });

  it('should fetch single component by ID from /api/components/:id', async () => {
    const mockComponent: NormalizedComponent = {
      id: 'cpu-7800x3d',
      name: 'Ryzen 7 7800X3D',
      category: 'CPU',
      manufacturer: 'AMD',
      specifications: { socket: 'AM5' },
    };
    mockClient.get.mockResolvedValueOnce({ data: mockComponent });

    const result = await service.getComponentById('cpu-7800x3d');
    expect(result).toEqual(mockComponent);
    expect(mockClient.get).toHaveBeenCalledWith('/api/components/cpu-7800x3d');
  });

  it('should perform health check on /api/health', async () => {
    const mockHealth = { status: 'ok', service: 'pcforge-api', version: '1.0.0' };
    mockClient.get.mockResolvedValueOnce(mockHealth);

    const result = await service.healthCheck();
    expect(result).toEqual(mockHealth);
    expect(mockClient.get).toHaveBeenCalledWith('/api/health');
  });
});
