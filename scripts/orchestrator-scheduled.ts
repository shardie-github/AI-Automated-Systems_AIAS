/**
 * Scheduled Orchestrator Runner
 * Used for hourly/daily scheduled runs
 */

import { Orchestrator } from '../ai/orchestrator';

const interval = process.argv[2] || 'daily';

async function main() {
  const orchestrator = new Orchestrator();
  
  if (interval === 'hourly') {
    await orchestrator.runScheduled('hourly');
  } else {
    await orchestrator.runScheduled('daily');
  }
}

main().catch(console.error);
