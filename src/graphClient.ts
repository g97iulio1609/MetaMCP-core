import { graphConfig } from "./config.js";
import type {
  GraphApiErrorResponse,
  HttpMethod,
} from "./types.js";

const RETRY_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

export class GraphApiError extends Error {
  public readonly status: number | null;
  public readonly details?: GraphApiErrorResponse;

  constructor(message: string, status: number | null, details?: GraphApiErrorResponse) {
    super(message);
    this.name = "GraphApiError";
    this.status = status;
    this.details = details;
  }
}

export interface GraphRequestOptions {
  method: HttpMethod;
  endpoint: string;
  params?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, unknown>;
  baseUrl?: string;
  accessToken?: string;
}

export class GraphApiClient {
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly timeoutMs: number;
  private readonly retries: number;

  constructor(config = graphConfig) {
    this.baseUrl = config.baseUrl;
    this.accessToken = config.accessToken;
    this.timeoutMs = config.timeoutMs;
    this.retries = config.retries;
  }

  async request<TResponse = Record<string, unknown>>({ method, endpoint, params, body, baseUrl, accessToken }: GraphRequestOptions) {
    const requestBaseUrl = baseUrl || this.baseUrl;
    const requestAccessToken = accessToken || this.accessToken;

    const url = new URL(`${requestBaseUrl}/${endpoint}`);
    const searchParams = new URLSearchParams();
    searchParams.set("access_token", requestAccessToken);

    for (const [key, value] of Object.entries(params ?? {})) {
      if (value === undefined) continue;
      searchParams.set(key, String(value));
    }

    url.search = searchParams.toString();

    for (let attempt = 0; attempt <= this.retries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, {
          method,
          headers: body ? { "Content-Type": "application/json" } : undefined,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        const text = await response.text();
        const payload = safeJsonParse<TResponse & GraphApiErrorResponse>(text);

        if (!response.ok) {
          throw new GraphApiError(
            payload && "error" in payload ? payload.error.message : "Graph API request failed",
            response.status,
            payload && "error" in payload ? (payload as GraphApiErrorResponse) : undefined,
          );
        }

        return payload as TResponse;
      } catch (error) {
        if (error instanceof GraphApiError) {
          if (error.status !== null && RETRY_STATUS_CODES.has(error.status) && attempt < this.retries) {
            await delay(backoffDelay(attempt));
            continue;
          }
          throw error;
        }

        if (attempt < this.retries) {
          await delay(backoffDelay(attempt));
          continue;
        }

        const message = error instanceof Error ? error.message : "Unexpected error";
        throw new GraphApiError(message, null);
      } finally {
        clearTimeout(timeout);
      }
    }

    throw new GraphApiError("Graph API request failed", null);
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const backoffDelay = (attempt: number) => {
  const base = 300 * Math.pow(2, attempt);
  const jitter = Math.floor(Math.random() * 100);
  return Math.min(5000, base + jitter);
};

const safeJsonParse = <T>(value: string): T => {
  if (!value) {
    return {} as T;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return {} as T;
  }
};
