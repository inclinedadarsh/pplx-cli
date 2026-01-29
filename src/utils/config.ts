import { join } from 'path';
import { homedir } from 'os';
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import type { Config } from '../api/types.js';

const CONFIG_DIR = join(homedir(), '.config', 'pplx-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

export function ensureConfigDir(): void {
    if (!existsSync(CONFIG_DIR)) {
        mkdirSync(CONFIG_DIR, { recursive: true });
    }
}

export function loadConfig(): Config {
    try {
        if (existsSync(CONFIG_FILE)) {
            const content = readFileSync(CONFIG_FILE, 'utf-8');
            return JSON.parse(content);
        }
    } catch (error) {
        // Config file corrupted or unreadable, return empty config
    }
    return {};
}

export function saveConfig(config: Config): void {
    ensureConfigDir();
    writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function clearConfig(): void {
    if (existsSync(CONFIG_FILE)) {
        unlinkSync(CONFIG_FILE);
    }
}

export function getApiKey(): string | undefined {
    // Config file takes precedence over environment variable
    const config = loadConfig();
    return config.apiKey || process.env.PERPLEXITY_API_KEY;
}

export function setApiKey(apiKey: string): void {
    const config = loadConfig();
    config.apiKey = apiKey;
    saveConfig(config);
}

export function getConfigPath(): string {
    return CONFIG_FILE;
}
