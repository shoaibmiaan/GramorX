import { strict as assert } from 'node:assert';
import { isValidEmail, isValidE164Phone } from '../utils/validation';

(() => {
  const goodEmails = ['user@example.com', 'name+tag@sub.domain.com'];
  const badEmails = ['user@', 'user@domain', 'userdomain.com', '', 'user@domain..com'];
  for (const e of goodEmails) assert.equal(isValidEmail(e), true);
  for (const e of badEmails) assert.equal(isValidEmail(e), false);

  const goodPhones = ['+1234567890', '+19876543210', '+8613712345678'];
  const badPhones = ['123456', '+1', 'abc', '', '+12345678901234567', '+0012345678'];
  for (const p of goodPhones) assert.equal(isValidE164Phone(p), true);
  for (const p of badPhones) assert.equal(isValidE164Phone(p), false);

  console.log('validation utilities tested');
})();
