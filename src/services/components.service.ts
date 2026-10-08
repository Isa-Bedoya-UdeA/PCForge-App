import { API_CONFIG } from '../constants/api';
import { ComponentCategory } from '../constants/categories';
import {
  ComponentFilterQuery,
  NormalizedComponent,
  PaginatedComponentsResponse,
} from '../types/component';
import { HttpClient, api } from './api';

export interface RawCategoriesResponse {
  data: ComponentCategory[];
  total: number;
}

export interface RawComponentDetailResponse {
  data: NormalizedComponent;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
}

export class ComponentsService {
  constructor(private readonly client: HttpClient = api) {}

  /**
   * Fetches the canonical list of component categories from the backend.
   */
  public async getCategories(): Promise<ComponentCategory[]> {
    const response = await this.client.get<RawCategoriesResponse>(
      API_CONFIG.ENDPOINTS.CATEGORIES
    );
    return response.data;
  }

  /**
   * Queries components with category filtering, search terms, and pagination.
   */
  public async getComponents(
    query?: ComponentFilterQuery
  ): Promise<PaginatedComponentsResponse> {
    const params: Record<string, unknown> = {};

    if (query?.category) params.category = query.category;
    if (query?.search) params.search = query.search;
    if (query?.q) params.search = query.q;
    if (query?.manufacturer) params.manufacturer = query.manufacturer;
    if (query?.page !== undefined) params.page = query.page;
    if (query?.pageSize !== undefined) params.pageSize = query.pageSize;

    const response = await this.client.get<PaginatedComponentsResponse>(
      API_CONFIG.ENDPOINTS.COMPONENTS,
      params
    );

    return response;
  }

  /**
   * Retrieves full technical specifications for a single component by its ID.
   */
  public async getComponentById(id: string): Promise<NormalizedComponent> {
    const cleanId = encodeURIComponent(id.trim());
    const response = await this.client.get<RawComponentDetailResponse>(
      `${API_CONFIG.ENDPOINTS.COMPONENTS}/${cleanId}`
    );
    return response.data;
  }

  /**
   * Checks the health and connectivity of the PCForge backend.
   */
  public async healthCheck(): Promise<HealthCheckResponse> {
    return this.client.get<HealthCheckResponse>(API_CONFIG.ENDPOINTS.HEALTH);
  }
}

export const componentsService = new ComponentsService(api);
