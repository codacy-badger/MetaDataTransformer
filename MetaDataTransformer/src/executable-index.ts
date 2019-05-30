#!/usr/bin/env node

import { CommandLine } from "./commandline";

const commandLine: CommandLine = new CommandLine();
commandLine.execute(process.argv.slice(2));