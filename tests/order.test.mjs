import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  buildWhatsAppOrderUrl,
  formatOrderMessage,
  normalizeWhatsAppNumber,
} from '../lib/order.ts';

test('normalisasi nomor WhatsApp admin', () => {
  assert.equal(normalizeWhatsAppNumber('0851-2408-1626'), '6285124081626');
  assert.equal(normalizeWhatsAppNumber('+62 851 2408 1626'), '6285124081626');
  assert.equal(normalizeWhatsAppNumber(''), '6285124081626');
});

test('Beli Sekarang hanya membuat draft satu produk dengan detail dan total', () => {
  const url = new URL(buildWhatsAppOrderUrl('6285124081626', [
    { name: 'Preset Penjaga Hati', quantity: 1, price: 5000 },
  ]));
  assert.equal(url.host, 'wa.me');
  assert.equal(url.pathname, '/6285124081626');
  const text = url.searchParams.get('text');
  assert.ok(text?.includes('Preset Penjaga Hati'));
  assert.ok(text?.includes('Jumlah: 1'));
  assert.ok(text?.includes('TOTAL PESANAN: Rp5.000'));
});

test('Checkout keranjang merangkum seluruh item dan kuantitas', () => {
  const message = formatOrderMessage([
    { name: 'Nokos Indonesia', quantity: 2, price: 5000 },
    { name: 'Alight Motion Premium Akun', quantity: 1, price: 2000 },
  ]);
  assert.ok(message.includes('Nokos Indonesia'));
  assert.ok(message.includes('Alight Motion Premium Akun'));
  assert.ok(message.includes('Jumlah: 2'));
  assert.ok(message.includes('Subtotal: Rp10.000'));
  assert.ok(message.includes('TOTAL PESANAN: Rp12.000'));
  assert.ok(message.includes('Mohon konfirmasi'));
});

test('pesanan tanpa isi atau jumlah tidak valid ditolak', () => {
  assert.throws(() => formatOrderMessage([]));
  assert.throws(() => formatOrderMessage([{ name: 'Produk', price: 1000, quantity: 0 }]));
});
