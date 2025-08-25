import { strict as assert } from 'assert';
import { scoreOne, scoreAll } from './score';

// scoreOne tests
assert.equal(scoreOne({ qno:1, type:'mcq', answer_key:{ value:'A' } }, 'A'), true);
assert.equal(scoreOne({ qno:2, type:'gap', answer_key:{ text:'Apple Pie' } }, 'apple pie'), true);
assert.equal(scoreOne({ qno:3, type:'match', answer_key:{ pairs:[[1,2],[3,4]] } }, [[1,2],[3,4]]), true);
assert.equal(scoreOne({ qno:4, type:'mcq', answer_key:{ value:'B' } }, 'A'), false);

// scoreAll test
const qs = [
  { qno:1, type:'mcq', answer_key:{ value:'A' } },
  { qno:2, type:'gap', answer_key:{ text:'blue car' } },
];
const ans = [
  { qno:1, answer:'A' },
  { qno:2, answer:'Blue   Car' },
];
const { total } = scoreAll(qs as any, ans as any);
assert.equal(total, 2);

console.log('listening score tests passed');
