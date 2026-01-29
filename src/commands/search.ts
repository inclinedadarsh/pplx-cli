import { Command } from 'commander';
import chalk from 'chalk';
import { PerplexityClient } from '../api/client.js';
import { getApiKey } from '../utils/config.js';
import { formatSearchResults, formatError } from '../utils/output.js';
import { createSpinner } from '../utils/spinner.js';

export function createSearchCommand(): Command {
    return new Command('search')
        .description('Search the web using Perplexity')
        .argument('<query>', 'The search query')
        .option('-l, --limit <number>', 'Maximum number of results', '10')
        .option('-m, --mode <mode>', 'Search mode (web, academic, sec)', 'web')
        .option('-r, --recency <recency>', 'Filter by recency (hour, day, week, month, year)')
        .option('-d, --domain <domains...>', 'Filter by domain(s)')
        .option('-j, --json', 'Output raw JSON response', false)
        .action(async (query: string, options) => {
            const apiKey = getApiKey();
            if (!apiKey) {
                console.log(formatError('No API key configured.'));
                console.log(chalk.dim('Set your API key with: pplx config set-key <your-api-key>'));
                console.log(chalk.dim('Or set the PERPLEXITY_API_KEY environment variable.'));
                process.exit(1);
            }

            // Validate mode
            const validModes = ['web', 'academic', 'sec'];
            if (!validModes.includes(options.mode)) {
                console.log(formatError(`Invalid mode: ${options.mode}`));
                console.log(chalk.dim(`Valid modes: ${validModes.join(', ')}`));
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
                const spinner = createSpinner('Searching...');
                spinner.start();

                const response = await client.search({
                    query,
                    max_results: parseInt(options.limit, 10),
                    search_mode: options.mode as 'web' | 'academic' | 'sec',
                    search_recency_filter: options.recency,
                    search_domain_filter: options.domain,
                });

                spinner.stop();

                if (options.json) {
                    console.log(JSON.stringify(response, null, 2));
                } else {
                    console.log();
                    console.log(chalk.bold.blue(`🔍 Search results for: "${query}"\n`));
                    console.log(formatSearchResults(response.results));
                }
            } catch (error) {
                console.log(formatError(error instanceof Error ? error.message : String(error)));
                process.exit(1);
            }
        });
}
