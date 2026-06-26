export type RequestOptions = RequestInit & { params?: Record<string, any> };

export class Api {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<Response> {
    const { params, headers, ...restOptions } = options;

    const queryString = params
      ? '?' + new URLSearchParams(params as Record<string, string>).toString()
      : '';

    const url = `${this.baseURL}${endpoint}${queryString}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(headers ?? {}),
      },
      ...restOptions,
    };

    const res = await fetch(url, config);

    if (!res.ok) {
      let errorMsg = 'Something went wrong';
      try {
        const errorData = await res.json();
        errorMsg = errorData.message || errorData.error || errorMsg;
      } catch (e) {
        errorMsg = res.statusText;
      }
      throw new Error(errorMsg);
    }
    return res;
  }

  async get<T>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method'>,
  ): Promise<T> {
    const res = await this.request(endpoint, {
      method: 'GET',
      cache: 'no-store',
      ...options,
    });
    return await res.json();
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const res = await this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return await res.json();
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const res = await this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    return await res.json();
  }

  async delete<T>(endpoint: string, data?: any): Promise<T> {
    const res = await this.request(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    });
    return await res.json();
  }
}

const defaultBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = new Api(defaultBaseURL);
