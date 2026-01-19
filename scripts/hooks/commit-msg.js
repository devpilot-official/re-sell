#!/usr/bin/env node

const fs = require("fs");

const messageFile = process.argv[2];
const message = fs.readFileSync(messageFile, "utf8").trim();

const pattern =
  /^(feature|fix|docs|style|refactor|test|chore): (Add|Remove|Update|Refactor|Fix|Improve|Change) .+/;

if (!pattern.test(message)) {
  console.error("\n❌ Invalid commit message\n");
  console.error("Expected format:");
  console.error("  feature|fix|docs|style|refactor|test|chore: Add|Remove|Update|Refactor|Fix|Improve|Change short description\n");
  console.error(`Got:\n  ${message}\n`);
  process.exit(1);
}
