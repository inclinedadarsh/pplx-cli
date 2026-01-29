import { Command } from 'commander';
import chalk from 'chalk';
import * as readline from 'readline';
import { PerplexityClient } from '../api/client.js';
import { MODELS, DEFAULT_MODEL, type ChatMessage } from '../api/types.js';
import { getApiKey } from '../utils/config.js';
import { formatError, formatInfo } from '../utils/output.js';

export function createChatCommand(): Command {
    return new Command('chat')
        .description('Start an interactive chat session with Perplexity AI')
        .option('-m, --model <model>', `Model to use (${Object.keys(MODELS).join(', ')})`, DEFAULT_MODEL)
        .option('--system <prompt>', 'Custom system prompt')
        .option('-r, --recency <recency>', 'Filter by recency (hour, day, week, month, year)')
        .option('-d, --domain <domains...>', 'Filter by domain(s)')
        .action(async (options) => {
            const apiKey = getApiKey();
            if (!apiKey) {
                console.log(formatError('No API key configured.'));
                console.log(chalk.dim('Set your API key with: pplx config set-key <your-api-key>'));
                console.log(chalk.dim('Or set the PERPLEXITY_API_KEY environment variable.'));
                process.exit(1);
            }

            // Validate model
            if (options.model && !Object.keys(MODELS).includes(options.model)) {
                console.log(formatError(`Invalid model: ${options.model}`));
                console.log(chalk.dim(`Available models: ${Object.keys(MODELS).join(', ')}`));
                process.exit(1);
            }

            const client = new PerplexityClient(apiKey);
            const messages: ChatMessage[] = [];

            if (options.system) {
                messages.push({ role: 'system', content: options.system });
            }

            console.log(chalk.bold.blue('\n🤖 Perplexity AI Chat\n'));
            console.log(chalk.dim(`Model: ${options.model}`));
            console.log(chalk.dim('Commands: /clear (reset), /exit (quit)\n'));
            console.log(chalk.dim('─'.repeat(50)));

            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });

            const prompt = () => {
                rl.question(chalk.green('\n> '), async (input) => {
                    const trimmed = input.trim();

                    if (!trimmed) {
                        prompt();
                        return;
                    }

                    // Handle commands
                    if (trimmed === '/exit' || trimmed === '/quit') {
                        console.log(formatInfo('Goodbye!'));
                        rl.close();
                        process.exit(0);
                    }

                    if (trimmed === '/clear') {
                        messages.length = 0;
                        if (options.system) {
                            messages.push({ role: 'system', content: options.system });
                        }
                        console.log(formatInfo('Conversation cleared.'));
                        prompt();
                        return;
                    }

                    if (trimmed === '/help') {
                        console.log(chalk.dim('\nAvailable commands:'));
                        console.log(chalk.dim('  /clear  - Clear conversation history'));
                        console.log(chalk.dim('  /exit   - Exit the chat'));
                        console.log(chalk.dim('  /help   - Show this help message'));
                        prompt();
                        return;
                    }

                    // Add user message to history
                    messages.push({ role: 'user', content: trimmed });

                    try {
                        // Stream the response
                        process.stdout.write(chalk.blue('\n'));

                        let fullResponse = '';
                        for await (const chunk of client.chatCompletionStream({
                            model: options.model,
                            messages: [...messages],
                            search_recency_filter: options.recency,
                            search_domain_filter: options.domain,
                            return_citations: true,
                        })) {
                            const content = chunk.choices[0]?.delta?.content;
                            if (content) {
                                process.stdout.write(content);
                                fullResponse += content;
                            }
                        }

                        console.log(); // New line after response

                        // Add assistant response to history
                        messages.push({ role: 'assistant', content: fullResponse });
                    } catch (error) {
                        console.log(formatError(error instanceof Error ? error.message : String(error)));
                        // Remove the user message that caused the error
                        messages.pop();
                    }

                    prompt();
                });
            };

            prompt();
        });
}
