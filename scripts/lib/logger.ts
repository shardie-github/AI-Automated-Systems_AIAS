/**
 * Timestamped logging utility
 * Produces structured logs for reports
 */

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  metadata?: Record<string, any>;
}

const logs: LogEntry[] = [];

export function log(
  level: LogEntry['level'],
  message: string,
  metadata?: Record<string, any>
): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    metadata,
  };
  logs.push(entry);

  const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
  const metaStr = metadata ? ` ${JSON.stringify(metadata)}` : '';
  console.log(`${prefix} ${message}${metaStr}`);
}

export function info(message: string, metadata?: Record<string, any>): void {
  log('info', message, metadata);
}

export function warn(message: string, metadata?: Record<string, any>): void {
  log('warn', message, metadata);
}

export function error(message: string, metadata?: Record<string, any>): void {
  log('error', message, metadata);
}

export function debug(message: string, metadata?: Record<string, any>): void {
  if (process.env.DEBUG === 'true') {
    log('debug', message, metadata);
  }
}

export function getLogs(): LogEntry[] {
  return [...logs];
}

export function clearLogs(): void {
  logs.length = 0;
}

export function writeLogsToMarkdown(filePath: string): void {
  const fs = require('fs');
  const content = `# Execution Logs\n\nGenerated: ${new Date().toISOString()}\n\n${logs
    .map(
      (entry) =>
        `## ${entry.timestamp} [${entry.level.toUpperCase()}]\n\n${entry.message}${
          entry.metadata ? `\n\n\`\`\`json\n${JSON.stringify(entry.metadata, null, 2)}\n\`\`\`` : ''
        }`
    )
    .join('\n\n---\n\n')}`;
  fs.writeFileSync(filePath, content);
}
