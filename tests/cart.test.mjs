import assert from 'node:assert/strict';
import { test } from 'node:test';
import { restoreSavedCart, serializeCart } from '../lib/cart.ts';

const catalog = [
  { id: 1, name: 'Produk A', price: 5000 },
  { id: 2, name: 'Produk B', price: 2000 },
];

test('produk tersimpan dikembalikan dengan harga dan nama dari katalog', () => {
  const raw = JSON.stringify([
    { id: 2, quantity: 3, name: 'Nama palsu', price: 1 },
    { id: 1, quantity: 1 },
  ]);
  assert.deepEqual(restoreSavedCart(raw, catalog), [
    { id: 1, name: 'Produk A', price: 5000, quantity: 1 },
    { id: 2, name: 'Produk B', price: 2000, quantity: 3 },
  ]);
});

test('duplikat digabung, item tak dikenal diabaikan, jumlah dibatasi', () => {
  assert.deepEqual(restoreSavedCart(JSON.stringify([
    { id: 1, quantity: 90 },
    { id: 1, quantity: 15 },
    { id: 9, quantity: 2 },
    { id: 2, quantity: 0 },
  ]), catalog), [{ ...catalog[0], quantity: 99 }]);
});

test('data browser rusak ditangani dan serialisasi hanya menyimpan ID dan jumlah', () => {
  assert.deepEqual(restoreSavedCart('not json', catalog), []);
  assert.deepEqual(restoreSavedCart('{}', catalog), []);
  assert.equal(serializeCart([{ id: 1, quantity: 2, name: 'abaikan', price: 1 }]),
    '[{"id":1,"quantity":2}]');
});
