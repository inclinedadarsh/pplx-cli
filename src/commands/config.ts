import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, setApiKey, clearConfig, getConfigPath, getApiKey } from '../utils/config.js';
import { formatSuccess, formatError, formatInfo } from '../utils/output.js';

export function createConfigCommand(): Command {
    const config = new Command('config')
        .description('Manage pplx-cli configuration');

    config
        .command('set-key <apiKey>')
        .description('Save your Perplexity API key')
        .action((apiKey: string) => {
            try {
                if (!apiKey.startsWith('pplx-')) {
                    console.log(formatError('Invalid API key format. Perplexity API keys start with "pplx-"'));
                    process.exit(1);
                }
                setApiKey(apiKey);
                console.log(formatSuccess('API key saved successfully!'));
                console.log(formatInfo(`Config file: ${getConfigPath()}`));
            } catch (error) {
                console.log(formatError(`Failed to save API key: ${error}`));
                process.exit(1);
            }
        });

    config
        .command('show')
        .description('Show current configuration')
        .action(() => {
            const currentConfig = loadConfig();
            const envKey = process.env.PERPLEXITY_API_KEY;

            console.log(chalk.bold('\n📋 Current Configuration:\n'));
            console.log(`Config file: ${chalk.cyan(getConfigPath())}`);
            console.log();

            if (currentConfig.apiKey) {
                const maskedKey = currentConfig.apiKey.slice(0, 8) + '...' + currentConfig.apiKey.slice(-4);
                console.log(`API Key (config): ${chalk.green(maskedKey)}`);
            } else {
                console.log(`API Key (config): ${chalk.dim('Not set')}`);
            }

            if (envKey) {
                const maskedEnvKey = envKey.slice(0, 8) + '...' + envKey.slice(-4);
                console.log(`API Key (env):    ${chalk.green(maskedEnvKey)}`);
            } else {
                console.log(`API Key (env):    ${chalk.dim('Not set')}`);
            }

            if (currentConfig.defaultModel) {
                console.log(`Default Model:    ${chalk.green(currentConfig.defaultModel)}`);
            }

            const activeKey = getApiKey();
            if (activeKey) {
                console.log(chalk.dim('\n✓ Config file key takes precedence over environment variable'));
            } else {
                console.log(chalk.yellow('\n⚠ No API key configured. Set one with:'));
                console.log(chalk.cyan('  pplx config set-key <your-api-key>'));
            }
            console.log();
        });

    config
        .command('clear')
        .description('Remove saved configuration')
        .action(() => {
            try {
                clearConfig();
                console.log(formatSuccess('Configuration cleared!'));
            } catch (error) {
                console.log(formatError(`Failed to clear config: ${error}`));
                process.exit(1);
            }
        });

    return config;
}
