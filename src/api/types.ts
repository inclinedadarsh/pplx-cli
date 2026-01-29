// API Response Types
export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatCompletionChoice {
    index: number;
    message: ChatMessage;
    finish_reason: string;
    delta?: {
        role?: string;
        content?: string;
    };
}

export interface ChatCompletionUsage {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
}

export interface ChatCompletionResponse {
    id: string;
    model: string;
    created: number;
    object: string;
    choices: ChatCompletionChoice[];
    usage: ChatCompletionUsage;
    citations?: string[];
}

export interface ChatCompletionStreamChunk {
    id: string;
    model: string;
    created: number;
    object: string;
    choices: {
        index: number;
        delta: {
            role?: string;
            content?: string;
        };
        finish_reason: string | null;
    }[];
}

export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    date?: string;
    last_updated?: string;
}

export interface SearchResponse {
    results: SearchResult[];
    id: string;
    server_time?: string;
}

// Request Types
export interface ChatCompletionRequest {
    model: string;
    messages: ChatMessage[];
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    stream?: boolean;
    search_recency_filter?: 'hour' | 'day' | 'week' | 'month' | 'year';
    search_domain_filter?: string[];
    return_citations?: boolean;
    return_related_questions?: boolean;
}

export interface SearchRequest {
    query: string;
    max_results?: number;
    search_recency_filter?: 'hour' | 'day' | 'week' | 'month' | 'year';
    search_domain_filter?: string[];
    search_mode?: 'web' | 'academic' | 'sec';
}

// Config Types
export interface Config {
    apiKey?: string;
    defaultModel?: string;
}

// Available Models
export const MODELS = {
    'sonar': 'sonar',
    'sonar-pro': 'sonar-pro',
    'sonar-reasoning': 'sonar-reasoning',
    'sonar-reasoning-pro': 'sonar-reasoning-pro',
} as const;

export type ModelName = keyof typeof MODELS;

export const DEFAULT_MODEL: ModelName = 'sonar';
