import { HistoryItem, recommendTasks } from '../recommendations';
import { Drill, isDue } from '../spaced-repetition';
import { Performance, calibrateDifficulty } from '../difficulty';
import { mapToRemedialExercises } from '../error-mapping';

export interface NextTaskOptions {
  /** User history */
  history: HistoryItem[];
  /** All available task identifiers */
  catalog: string[];
  /** Performance metrics for difficulty calibration */
  performance: Performance;
  /** Recent error tags */
  errors: string[];
  /** Current drill states */
  drills: Drill[];
  /** Analytics hook fired when a task is chosen */
  analytics?: (taskId: string) => void;
  /** Optional AI provider that can pick a task from candidates */
  ai?: (prompt: string) => Promise<string[]>;
}

/**
 * Select the next task for the learner. Remedial exercises take precedence,
 * followed by due drills and finally general recommendations. An optional AI
 * provider can override the final choice.
 */
export async function selectNextTask(opts: NextTaskOptions): Promise<string> {
  const level = calibrateDifficulty(opts.performance);
  const remedial = mapToRemedialExercises(opts.errors);
  const dueDrills = opts.drills.filter((d) => isDue(d));
  const recs = recommendTasks(opts.history, opts.catalog);

  let candidates: string[];
  if (remedial.length) candidates = remedial;
  else if (dueDrills.length) candidates = dueDrills.map((d) => d.id);
  else candidates = recs;

  if (opts.ai) {
    try {
      const aiResult = await opts.ai(
        `Choose the best next task for level ${level} from [${candidates.join(', ')}]`
      );
      if (aiResult && aiResult.length) {
        opts.analytics?.(aiResult[0]);
        return aiResult[0];
      }
    } catch {
      // ignore AI errors and fall back to other strategies
    }
  }

  const choice = candidates[0] ?? opts.catalog[0];
  opts.analytics?.(choice);
  return choice;
}
