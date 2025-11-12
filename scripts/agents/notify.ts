#!/usr/bin/env tsx
/**
 * Notification Script
 * Sends notifications to Slack (if webhook configured) or prints to console
 */

import { info, error } from '../lib/logger.js';

interface NotificationOptions {
  title: string;
  message: string;
  level?: 'info' | 'warn' | 'error';
  metadata?: Record<string, any>;
}

async function notify(options: NotificationOptions): Promise<void> {
  const { title, message, level = 'info', metadata } = options;
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  const payload = {
    text: `${level.toUpperCase()}: ${title}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: title,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message,
        },
      },
      ...(metadata
        ? [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `\`\`\`json\n${JSON.stringify(metadata, null, 2)}\n\`\`\``,
              },
            },
          ]
        : []),
    ],
  };

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Slack API error: ${response.statusText}`);
      }

      info('Notification sent to Slack', { title });
    } catch (err) {
      error('Failed to send Slack notification', { error: err });
      // Fall through to console output
    }
  }

  // Always log to console
  const icon = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : '✅';
  console.log(`${icon} ${title}: ${message}`);
  if (metadata) {
    console.log(JSON.stringify(metadata, null, 2));
  }
}

async function main() {
  const args = process.argv.slice(2);
  const title = args[0] || 'Notification';
  const message = args[1] || 'No message provided';
  const level = (args[2] as NotificationOptions['level']) || 'info';

  await notify({ title, message, level });
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { notify };
