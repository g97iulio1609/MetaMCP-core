export type HttpMethod = "GET" | "POST" | "DELETE" | "PATCH";

export interface GraphApiErrorData {
  message: string;
  type?: string;
  code?: number;
  error_subcode?: number;
  fbtrace_id?: string;
}

export interface GraphApiErrorResponse {
  error: GraphApiErrorData;
}

export interface GraphApiPagingCursors {
  before?: string;
  after?: string;
}

export interface GraphApiPaging {
  cursors?: GraphApiPagingCursors;
  next?: string;
  previous?: string;
}

export interface GraphApiCollection<TItem> {
  data: TItem[];
  paging?: GraphApiPaging;
}

export interface FacebookUser {
  id: string;
  name?: string | undefined;
}

export interface FacebookPost {
  id: string;
  message?: string | undefined;
  created_time?: string | undefined;
}

export interface FacebookComment {
  id: string;
  message?: string | undefined;
  from?: FacebookUser | undefined;
  created_time?: string | undefined;
}

export interface PostShareCount {
  shares?: {
    count?: number;
  };
}

export interface PostLikeSummary {
  likes?: {
    summary?: {
      total_count?: number;
    };
  };
}

export interface InstagramMedia {
  id: string;
  caption?: string;
  media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
}

export interface ThreadsMedia {
  id: string;
  text?: string;
  media_type?: "TEXT" | "IMAGE" | "VIDEO";
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  reply_count?: number;
}

export interface ThreadsInsight {
  name: string;
  period: string;
  values: Array<{
    value: number;
    end_time?: string;
  }>;
  title?: string;
  description?: string;
  id?: string;
}
