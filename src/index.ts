#!/usr/bin/env node
import { program } from 'commander';
import { createConfigCommand } from './commands/config.js';
import { createAskCommand } from './commands/ask.js';
import { createSearchCommand } from './commands/search.js';
import { createChatCommand } from './commands/chat.js';

const version = '1.0.0';

program
    .name('pplx')
    .description('A powerful CLI tool for the Perplexity AI API')
    .version(version);

// Register commands
program.addCommand(createConfigCommand());
program.addCommand(createAskCommand());
program.addCommand(createSearchCommand());
program.addCommand(createChatCommand());

// Parse arguments
program.parse();
