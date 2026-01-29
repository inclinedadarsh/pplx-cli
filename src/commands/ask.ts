import { Command } from 'commander';
import chalk from 'chalk';
import { PerplexityClient } from '../api/client.js';
import { MODELS, DEFAULT_MODEL, type ModelName } from '../api/types.js';
import { getApiKey } from '../utils/config.js';
import { formatChatResponse, formatError } from '../utils/output.js';
import { createSpinner } from '../utils/spinner.js';

export function createAskCommand(): Command {
    return new Command('ask')
        .description('Ask a question to Perplexity AI')
        .argument('<question>', 'The question to ask')
        .option('-m, --model <model>', `Model to use (${Object.keys(MODELS).join(', ')})`, DEFAULT_MODEL)
        .option('-s, --stream', 'Stream the response in real-time', false)
        .option('-j, --json', 'Output raw JSON response', false)
        .option('-c, --citations', 'Show source citations', true)
        .option('--no-citations', 'Hide source citations')
        .option('-r, --recency <recency>', 'Filter by recency (hour, day, week, month, year)')
        .option('-d, --domain <domains...>', 'Filter by domain(s)')
        .option('--system <prompt>', 'Custom system prompt')
        .action(async (question: string, options) => {
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

            // Validate recency
            const validRecency = ['hour', 'day', 'week', 'month', 'year'];
            if (options.recency && !validRecency.includes(options.recency)) {
                console.log(formatError(`Invalid recency: ${options.recency}`));
                console.log(chalk.dim(`Valid values: ${validRecency.join(', ')}`));
                process.exit(1);
            }

            const client = new PerplexityClient(apiKey);

            try {
                if (options.stream) {
                    // Streaming mode
                    process.stdout.write(chalk.dim('Searching... '));
                    let firstChunk = true;
                    let citations: string[] = [];

                    for await (const chunk of client.askStream(question, {
                        model: options.model,
                        systemPrompt: options.system,
                        recency: options.recency,
                        domains: options.domain,
                    })) {
                        if (firstChunk) {
                            process.stdout.write('\r' + ' '.repeat(20) + '\r'); // Clear "Searching..."
                            firstChunk = false;
                        }

                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            process.stdout.write(content);
                        }
                    }

                    console.log(); // New line after streaming

                    // Note: Citations aren't available in streaming mode from the API
                    // They're only in the final non-streamed response
                } else {
                    // Non-streaming mode
                    const spinner = createSpinner('Searching the web...');
                    spinner.start();

                    const response = await client.ask(question, {
                        model: options.model,
                        systemPrompt: options.system,
                        recency: options.recency,
                        domains: options.domain,
                    });

                    spinner.stop();

                    if (options.json) {
                        console.log(JSON.stringify(response, null, 2));
                    } else {
                        console.log(formatChatResponse(response, options.citations));
                    }
                }
            } catch (error) {
                console.log(formatError(error instanceof Error ? error.message : String(error)));
                process.exit(1);
            }
        });
}
