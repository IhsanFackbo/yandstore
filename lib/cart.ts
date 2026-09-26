/** Keranjang yang tersimpan hanya menyimpan ID dan kuantitas, bukan harga dari browser. */
export type SavedCartItem = { id: number; quantity: number };

export function restoreSavedCart<T extends { id: number }>(
  raw: string | null,
  catalog: readonly T[],
): Array<T & { quantity: number }> {
  try {
    const saved: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(saved)) return [];
    const quantities = new Map<number, number>();
    const validIds = new Set(catalog.map((product) => product.id));
    for (const item of saved) {
      if (!item || typeof item !== "object") continue;
      const record = item as { id?: unknown; quantity?: unknown };
      if (typeof record.id !== "number" || !validIds.has(record.id)) continue;
      if (typeof record.quantity !== "number" || !Number.isInteger(record.quantity)) continue;
      if (record.quantity < 1) continue;
      quantities.set(
        record.id,
        Math.min(99, (quantities.get(record.id) || 0) + record.quantity),
      );
    }
    return catalog
      .filter((product) => quantities.has(product.id))
      .map((product) => ({ ...product, quantity: quantities.get(product.id)! }));
  } catch {
    return [];
  }
}

export function serializeCart(cart: readonly SavedCartItem[]): string {
  return JSON.stringify(cart.map(({ id, quantity }) => ({ id, quantity })));
}
