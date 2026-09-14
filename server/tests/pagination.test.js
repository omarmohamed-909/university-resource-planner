const test = require('node:test');
const assert = require('node:assert/strict');
const { parsePagination, escapeRegex } = require('../interfaces/http/queryPagination');

test('pagination applies safe defaults and caps page size', () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 20 });
  assert.deepEqual(parsePagination({ page: '3', limit: '5000' }), { page: 3, limit: 100 });
  assert.deepEqual(parsePagination({ page: '-2', limit: '0' }), { page: 1, limit: 20 });
});

test('search terms are escaped before building a regex', () => {
  assert.equal(escapeRegex('user+(test)'), 'user\\+\\(test\\)');
});
