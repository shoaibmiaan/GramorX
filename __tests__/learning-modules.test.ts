import { strict as assert } from 'node:assert';
import { recommendTasks, HistoryItem } from '../lib/recommendations';
import { scheduleDrill, isDue, Drill } from '../lib/spaced-repetition';
import { calibrateDifficulty, Performance } from '../lib/difficulty';
import { mapToRemedialExercises } from '../lib/error-mapping';
import { selectNextTask } from '../lib/next-task';

(async () => {
  const history: HistoryItem[] = [
    { taskId: 't1', score: 0.9, timestamp: new Date() },
    { taskId: 't2', score: 0.4, timestamp: new Date() },
  ];
  const catalog = ['t1', 't2', 't3'];
  assert.deepEqual(recommendTasks(history, catalog, 3), ['t2', 't1', 't3']);

  const drill: Drill = { id: 'd1', interval: 1, repetition: 1, ease: 2.5, due: new Date() };
  const nextDrill = scheduleDrill(drill, 5);
  assert.equal(isDue(nextDrill), false);

  const perf: Performance = { level: 3, correct: 9, attempts: 10 };
  assert.equal(calibrateDifficulty(perf), 4);

  assert.deepEqual(mapToRemedialExercises(['grammar', 'vocabulary', 'unknown']), [
    'grammar-basics',
    'vocab-drill',
  ]);

  const choice = await selectNextTask({
    history,
    catalog,
    performance: perf,
    errors: ['grammar'],
    drills: [nextDrill],
    ai: async () => [],
  });
  assert.equal(choice, 'grammar-basics');

  console.log('learning modules tested');
})();
