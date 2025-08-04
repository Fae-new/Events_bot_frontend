import axios from "axios";

// Base URLs - Production (currently active)
// export const API_BASE_URL = "https://agent.useattend.com/api";
// export const WS_BASE_URL = "wss://agent.useattend.com";

// Base URLs - Local Development (commented out)
export const API_BASE_URL = "http://localhost:8000/api";
export const WS_BASE_URL = "ws://localhost:8000";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

// Types based on backend documentation
export interface Conversation {
  conversationId: string;
  external_user_id?: string;
  message_count: number;
  created_at: string;
  updated_at?: string;
}

export interface Message {
  id: number;
  content: string;
  role: "user" | "assistant" | "system";
  conversation_id: string;
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
}

// API Response when sending a message (POST /chat/send)
export interface SendMessageResponse {
  success: boolean;
  data: {
    success: boolean;
    userMessage: Message;
    aiMessage?: Message; // Only present if role is 'user'
  };
}

export interface ConversationDetails {
  conversationId: string;
  userID?: string;
  message_count: number;
  messages: Message[];
  created_at: string;
}

export interface Vendor {
  id: number;
  name: string;
  category:
    | "catering"
    | "venue"
    | "photography"
    | "entertainment"
    | "decoration"
    | "transportation"
    | "planning"
    | "other";
  description: string;
  services: string[];
  specialties: string[];
  location: {
    address: string;
    city: string;
    state: string;
    zip_code: string;
    service_radius: number;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
  };
  pricing: {
    baseRate: number;
    period: string;
    minimumOrder: string;
    packages?: Array<{
      name: string;
      price: number;
      description: string;
    }>;
  };
  availability: {
    leadTime: number;
    seasonal_restrictions?: string[];
  };
  credentials: {
    licensed: boolean;
    insured: boolean;
    years_in_business: number;
  };
  rating: number;
  reviews: number;
  created_at: string;
}

export interface EventBrief {
  event_type: string;
  guest_count: number;
  location: string;
  budget_range: string;
  date: string;
  requirements: string[];
}

export interface PaginationResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Conversation API
export const conversationAPI = {
  // Create a new conversation
  create: async (
    external_user_id?: string,
    metadata?: any
  ): Promise<ApiResponse<Conversation>> => {
    const response = await api.post("/conversations", {
      user_id: external_user_id || `user_${Date.now()}`,
      metadata: metadata || {
        source: "web_app",
        timestamp: new Date().toISOString(),
      },
    });
    return response.data;
  },

  // List all conversations
  list: async (
    page = 1,
    per_page = 15,
    external_user_id?: string
  ): Promise<Conversation[]> => {
    const params: any = { page, per_page };
    if (external_user_id) params.user_id = external_user_id;

    const response = await api.get("/conversations", { params });
    return response.data.conversations || response.data;
  },

  // Get conversation details with messages
  get: async (conversationId: string): Promise<ConversationDetails> => {
    const response = await api.get(`/conversations/${conversationId}`);
    return response.data;
  },

  // Send message via HTTP (alternative to WebSocket)
  sendMessage: async (
    conversationId: string,
    message: string
  ): Promise<
    ApiResponse<{
      response: string;
      conversationId: string;
      message_count: number;
    }>
  > => {
    const response = await api.post(`/conversations/${conversationId}/chat`, {
      message,
    });
    return response.data;
  },

  // Generate event brief from conversation
  generateEventBrief: async (
    conversationId: string
  ): Promise<ApiResponse<{ event_brief: EventBrief }>> => {
    const response = await api.post(
      `/conversations/${conversationId}/event-brief`
    );
    return response.data;
  },

  // Get vendor recommendations
  getVendorRecommendations: async (
    conversationId: string,
    category?: string,
    location?: string
  ): Promise<
    ApiResponse<{ recommendations: string; available_vendors: Vendor[] }>
  > => {
    const response = await api.post(
      `/conversations/${conversationId}/vendor-recommendations`,
      {
        ...(category && { category }),
        ...(location && { location }),
      }
    );
    return response.data;
  },
};

// Vendor API
export const vendorAPI = {
  // List vendors with filtering
  list: async (params?: {
    category?: string;
    city?: string;
    state?: string;
    min_rating?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    per_page?: number;
    page?: number;
  }): Promise<PaginationResponse<Vendor>> => {
    const response = await api.get("/vendors", { params });
    return response.data;
  },

  // Create new vendor
  create: async (
    vendor: Omit<Vendor, "id" | "created_at">
  ): Promise<ApiResponse<Vendor>> => {
    const response = await api.post("/vendors", vendor);
    return response.data;
  },

  // Get vendor details
  get: async (id: number): Promise<ApiResponse<Vendor>> => {
    const response = await api.get(`/vendors/${id}`);
    return response.data;
  },

  // Update vendor
  update: async (
    id: number,
    vendor: Partial<Vendor>
  ): Promise<ApiResponse<Vendor>> => {
    const response = await api.put(`/vendors/${id}`, vendor);
    return response.data;
  },

  // Delete vendor
  delete: async (id: number): Promise<ApiResponse<{}>> => {
    const response = await api.delete(`/vendors/${id}`);
    return response.data;
  },

  // Get vendor categories
  getCategories: async (): Promise<
    ApiResponse<Array<{ category: string; count: number }>>
  > => {
    const response = await api.get("/vendors-categories");
    return response.data;
  },

  // Get vendor statistics
  getStats: async (): Promise<
    ApiResponse<{
      total_vendors: number;
      average_rating: number;
      top_rated: number;
      by_category: Array<{
        category: string;
        count: number;
        avg_rating: number;
      }>;
      recent_additions: number;
    }>
  > => {
    const response = await api.get("/vendors-stats");
    return response.data;
  },
};

// Bot Configuration API
export const botConfigAPI = {
  // Get current bot configuration
  get: async () => {
    const response = await api.get("/bot-config");
    return response.data;
  },

  // Update bot configuration
  update: async (config: {
    systemPrompt?: string;
    contextData?: string[];
    personality?: string[];
  }): Promise<
    ApiResponse<{
      systemPrompt: string;
      contextData: string[];
      personality: any;
    }>
  > => {
    const response = await api.put("/bot-config", config);
    return response.data;
  },

  // Reset bot configuration to defaults
  reset: async (): Promise<
    ApiResponse<{
      systemPrompt: string;
      contextData: string[];
      personality: any;
    }>
  > => {
    const response = await api.post("/bot-config/reset");
    return response.data;
  },
};

// Chat API for Pusher integration
export const chatAPI = {
  // Create a new conversation
  createConversation: async (
    conversationId?: string,
    userId?: string
  ): Promise<
    ApiResponse<{
      conversation_id: string;
      user_id: string;
      status: string;
      created_at: string;
      updated_at: string;
    }>
  > => {
    const response = await api.post("/chat/conversations", {
      conversation_id: conversationId || `conv_${Date.now()}`,
      user_id: userId || "user123",
    });
    return response.data;
  },

  // List conversations for a user
  listConversations: async (
    userId: string,
    page = 1,
    perPage = 20
  ): Promise<
    ApiResponse<{
      current_page: number;
      data: Array<{
        conversation_id: string;
        user_id: string;
        status: string;
        created_at: string;
        updated_at: string;
      }>;
      from: number;
      last_page: number;
      per_page: number;
      to: number;
      total: number;
    }>
  > => {
    const response = await api.get("/chat/conversations", {
      params: { user_id: userId, page, per_page: perPage },
    });
    return response.data;
  },
  // Send a message via REST API (Pusher will broadcast)
  sendMessage: async (
    conversationId: string,
    content: string,
    role: "user" | "assistant" | "system" = "user"
  ): Promise<SendMessageResponse> => {
    const response = await api.post("/chat/send", {
      conversation_id: conversationId,
      content,
      role,
    });
    return response.data;
  },

  // Get conversation messages with pagination
  getMessages: async (
    conversationId: string,
    page = 1,
    perPage = 50
  ): Promise<ApiResponse<{ messages: Message[]; pagination: any }>> => {
    const response = await api.get(
      `/chat/conversations/${conversationId}/messages`,
      {
        params: { page, per_page: perPage },
      }
    );
    return response.data;
  },

  // Send typing indicator
  sendTyping: async (
    conversationId: string,
    userId: string,
    isTyping = true
  ): Promise<ApiResponse<{}>> => {
    const response = await api.post("/chat/typing", {
      conversation_id: conversationId,
      user_id: userId,
      is_typing: isTyping,
    });
    return response.data;
  },

  // Get conversation details (enhanced version)
  getConversationDetails: async (
    conversationId: string
  ): Promise<ApiResponse<ConversationDetails>> => {
    const response = await api.get(`/chat/conversations/${conversationId}`);
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<{
    status: string;
    timestamp: string;
    service: string;
  }> => {
    const response = await api.get("/health");
    return response.data;
  },
};

export default api;
