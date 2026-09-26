/** Format pemesanan WhatsApp yang dipakai bersama oleh Beli Sekarang & Keranjang. */
export type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

export const DEFAULT_WHATSAPP_NUMBER = "6285124081626";

export function normalizeWhatsAppNumber(value?: string): string {
  const digits = (value || "").replace(/\D/g, "");
  // wa.me memerlukan nomor internasional tanpa tanda +, spasi, atau angka 0 awal.
  const international = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return /^\d{10,15}$/.test(international)
    ? international
    : DEFAULT_WHATSAPP_NUMBER;
}

const currency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount).replace(/\s+/g, "");

export function formatOrderMessage(items: OrderItem[]): string {
  if (!items.length) throw new Error("Pesanan tidak boleh kosong.");

  const lines = items.map((item, index) => {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || !Number.isFinite(item.price) || item.price < 0) {
      throw new Error("Jumlah atau harga produk tidak valid.");
    }
    return [
      `${index + 1}. *${item.name}*`,
      `   Jumlah: ${item.quantity}`,
      `   Harga satuan: ${currency(item.price)}`,
      `   Subtotal: ${currency(item.price * item.quantity)}`,
    ].join("\n");
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return [
    "Halo Yandx Store! 👋",
    "Saya ingin memesan produk berikut:",
    "",
    lines.join("\n\n"),
    "",
    `*TOTAL PESANAN: ${currency(total)}*`,
    "",
    "Mohon konfirmasi ketersediaan produk dan cara pembayarannya. Terima kasih!",
  ].join("\n");
}

export function buildWhatsAppOrderUrl(number: string, items: OrderItem[]): string {
  return `https://wa.me/${normalizeWhatsAppNumber(number)}?text=${encodeURIComponent(
    formatOrderMessage(items),
  )}`;
}
