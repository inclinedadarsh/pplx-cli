import type {
    ChatCompletionRequest,
    ChatCompletionResponse,
    ChatCompletionStreamChunk,
    SearchRequest,
    SearchResponse,
    ChatMessage,
} from './types.js';

const API_BASE_URL = 'https://api.perplexity.ai';

export class PerplexityClient {
    private apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    private getHeaders(): Record<string, string> {
        return {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    }

    async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
        const response = await fetch(`${API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                ...request,
                stream: false,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API request failed: ${response.status} - ${error}`);
        }

        return response.json() as Promise<ChatCompletionResponse>;
    }

    async *chatCompletionStream(request: ChatCompletionRequest): AsyncGenerator<ChatCompletionStreamChunk> {
        const response = await fetch(`${API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                ...request,
                stream: true,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API request failed: ${response.status} - ${error}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No response body');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('data: ')) {
                    const data = trimmed.slice(6);
                    if (data === '[DONE]') {
                        return;
                    }
                    try {
                        const chunk: ChatCompletionStreamChunk = JSON.parse(data);
                        yield chunk;
                    } catch {
                        // Skip malformed JSON
                    }
                }
            }
        }
    }

    async search(request: SearchRequest): Promise<SearchResponse> {
        // Filter out undefined values to avoid sending them to the API
        const cleanRequest = Object.fromEntries(
            Object.entries(request).filter(([_, v]) => v !== undefined)
        );

        const response = await fetch(`${API_BASE_URL}/search`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(cleanRequest),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API request failed: ${response.status} - ${error}`);
        }

        return response.json() as Promise<SearchResponse>;
    }

    // Helper method for simple chat
    async ask(
        question: string,
        options: {
            model?: string;
            systemPrompt?: string;
            recency?: ChatCompletionRequest['search_recency_filter'];
            domains?: string[];
        } = {}
    ): Promise<ChatCompletionResponse> {
        const messages: ChatMessage[] = [];

        if (options.systemPrompt) {
            messages.push({ role: 'system', content: options.systemPrompt });
        }

        messages.push({ role: 'user', content: question });

        return this.chatCompletion({
            model: options.model || 'sonar',
            messages,
            search_recency_filter: options.recency,
            search_domain_filter: options.domains,
            return_citations: true,
        });
    }

    // Helper method for streaming chat
    async *askStream(
        question: string,
        options: {
            model?: string;
            systemPrompt?: string;
            recency?: ChatCompletionRequest['search_recency_filter'];
            domains?: string[];
        } = {}
    ): AsyncGenerator<ChatCompletionStreamChunk> {
        const messages: ChatMessage[] = [];

        if (options.systemPrompt) {
            messages.push({ role: 'system', content: options.systemPrompt });
        }

        messages.push({ role: 'user', content: question });

        yield* this.chatCompletionStream({
            model: options.model || 'sonar',
            messages,
            search_recency_filter: options.recency,
            search_domain_filter: options.domains,
            return_citations: true,
        });
    }
}
