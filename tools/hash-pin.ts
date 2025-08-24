// tools/hash-pin.ts
import { scryptSync, randomBytes } from 'crypto';


const pin = process.argv[2] || process.env.PIN;
if (!pin) {
console.error('Usage: ts-node tools/hash-pin.ts <PIN>');
process.exit(1);
}
const salt = randomBytes(16).toString('hex');
const hash = scryptSync(pin, salt, 64).toString('hex');
console.log(`PREMIUM_PIN_SALT=${salt}`);
console.log(`PREMIUM_PIN_HASH=${hash}`);