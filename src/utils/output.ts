import chalk from 'chalk';
import type { ChatCompletionResponse, SearchResult } from '../api/types.js';

export function formatChatResponse(response: ChatCompletionResponse, showCitations: boolean = true): string {
    const content = response.choices[0]?.message?.content || '';
    let output = content;

    if (showCitations && response.citations && response.citations.length > 0) {
        output += '\n\n' + chalk.dim('─'.repeat(50));
        output += '\n' + chalk.bold.blue('Sources:');
        response.citations.forEach((citation, index) => {
            output += `\n  ${chalk.dim(`[${index + 1}]`)} ${chalk.cyan(citation)}`;
        });
    }

    return output;
}

export function formatSearchResults(results: SearchResult[]): string {
    if (results.length === 0) {
        return chalk.yellow('No results found.');
    }

    let output = '';
    results.forEach((result, index) => {
        output += chalk.bold.white(`${index + 1}. ${result.title}\n`);
        output += `   ${chalk.cyan(result.url)}\n`;
        if (result.snippet) {
            output += `   ${chalk.dim(result.snippet)}\n`;
        }
        if (result.date) {
            output += `   ${chalk.gray(`Published: ${result.date}`)}\n`;
        }
        output += '\n';
    });

    return output.trim();
}

export function formatError(message: string): string {
    return chalk.red(`✖ Error: ${message}`);
}

export function formatSuccess(message: string): string {
    return chalk.green(`✔ ${message}`);
}

export function formatInfo(message: string): string {
    return chalk.blue(`ℹ ${message}`);
}

export function formatWarning(message: string): string {
    return chalk.yellow(`⚠ ${message}`);
}
