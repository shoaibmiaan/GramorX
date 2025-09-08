import assert from 'assert';
import { applyDrag } from './SidebarAI';

// starting at {0,0}, dragging by 30,40 within 800x600 viewport
const next = applyDrag({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 30, y: 40 }, { w: 800, h: 600 });
assert.deepStrictEqual(next, { x: 30, y: 40 });

// clamp within viewport
const clamped = applyDrag({ x: 790, y: 590 }, { x: 0, y: 0 }, { x: 50, y: 60 }, { w: 800, h: 600 });
assert(clamped.x <= 800 - 320 && clamped.y <= 600 - 480);

console.log('SidebarAI drag tests passed.');
