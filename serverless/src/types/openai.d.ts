declare module 'openai' {
  export interface CompletionChoice {
    message?: {
      content?: string;
    };
  }

  export interface CompletionResponse {
    choices: CompletionChoice[];
  }

  export interface ChatCompletionParams {
    model: string;
    messages: Array<{
      role: string;
      content: string;
    }>;
    temperature?: number;
    response_format?: {
      type: string;
    };
  }

  export default class OpenAI {
    constructor(config: { apiKey: string });

    chat: {
      completions: {
        create(params: ChatCompletionParams): Promise<CompletionResponse>;
      };
    };
  }
}