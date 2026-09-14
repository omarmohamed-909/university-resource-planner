#!/usr/bin/env node
/**
 * check-i18n-keys.mjs
 * يتحقق من تطابق مفاتيح الترجمة بين ar و en
 * يُستخدم في CI لضمان عدم وجود مفاتيح ناقصة
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const localesDir = join(__dirname, '../client/src/ui/locales');

const ar = JSON.parse(readFileSync(join(localesDir, 'ar/translation.json'), 'utf8'));
const en = JSON.parse(readFileSync(join(localesDir, 'en/translation.json'), 'utf8'));

/**
 * Flatten nested object to dot-notation keys
 * e.g. { a: { b: 'v' } } → { 'a.b': 'v' }
 */
function flatten(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(acc, flatten(val, fullKey));
    } else {
      acc[fullKey] = val;
    }
    return acc;
  }, {});
}

const arKeys = new Set(Object.keys(flatten(ar)));
const enKeys = new Set(Object.keys(flatten(en)));

const missingInAr = [...enKeys].filter(k => !arKeys.has(k));
const missingInEn = [...arKeys].filter(k => !enKeys.has(k));

let hasErrors = false;

if (missingInAr.length > 0) {
  console.error(`\n❌ مفاتيح موجودة في EN لكن غائبة في AR (${missingInAr.length}):`);
  missingInAr.forEach(k => console.error(`   • ${k}`));
  hasErrors = true;
}

if (missingInEn.length > 0) {
  console.error(`\n❌ مفاتيح موجودة في AR لكن غائبة في EN (${missingInEn.length}):`);
  missingInEn.forEach(k => console.error(`   • ${k}`));
  hasErrors = true;
}

if (hasErrors) {
  console.error('\n✗ فشل فحص مفاتيح i18n — راجع المفاتيح الناقصة أعلاه.\n');
  process.exit(1);
} else {
  console.log(`✓ i18n OK — ${arKeys.size} مفتاح متطابق بين AR و EN`);
}
