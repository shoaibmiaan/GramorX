import bcrypt from 'bcryptjs';

const pin = process.argv[2]; // e.g. node tools/hash-pin.js 123456
if (!pin) {
  console.error('Provide a PIN: node tools/hash-pin.js 123456');
  process.exit(1);
}

(async () => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(pin, salt);
  console.log('pin_hash =', hash);
})();
