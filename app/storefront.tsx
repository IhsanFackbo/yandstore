"use client";

import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";

type Product = {
  id: number;
  name: string;
  shortName: string;
  price: number;
  oldPrice?: number;
  image: string;
  description: string;
  reviews: number;
  badge?: string;
  badgeTone?: "new" | "discount";
};

type CartLine = Product & { quantity: number };

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      size?: "normal" | "compact" | "flexible";
      action?: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const products: Product[] = [
  {
    id: 1,
    name: "Nokos Indonesia",
    shortName: "Nokos Indonesia",
    price: 5_000,
    image: "https://files.catbox.moe/c1kfx4.jpg",
    description:
      "Nomor khusus WhatsApp untuk akun cadangan, tempat bot, atau akun kerja Anda. Di jamin aman",
    reviews: 24,
    badge: "Terlaris",
    badgeTone: "new",
  },
  {
    id: 2,
    name: "Alight Motion Premium",
    shortName: "Alight Motion Prem",
    price: 2_000,
    image: "https://files.catbox.moe/xal0ob.jpg",
    description:
      "Akses fitur dan tools premium Alight Motion yang sebelumnya terkunci.",
    reviews: 18,
  },
  {
    id: 3,
    name: "Script Denia Premium Group",
    shortName: "Script Denia Premium Group",
    price: 24_000,
    oldPrice: 50_000,
    image: "https://files.catbox.moe/bybxzi.png",
    description:
      "Script siap pakai untuk grup premium, lengkap dan mudah diintegrasikan.",
    reviews:  52,
    badge: "-52%",
    badgeTone: "discount",
  },
   {
  id: 4,
  name: "Preset Alight Motion 1",
  shortName: "Preset Penjaga Hati",
  price: 5_000,
  image: "https://files.catbox.moe/r7jrvc.jpg",
  description:
    "Preset Alight motion siap pakai, lengkap dan mudah diintegrasikan.",
  reviews: 0,
  badge: "Baru",
  badgeTone: "new",
},
  {
  id: 5,
  name: "Preset Alight Motion 2",
  shortName: "Preset Semua ku di rayakan",
  price: 5_000,
  image: "https://h.uguu.se/ygmNgSci.jpg",
  description:
    "Preset Alight motion siap pakai, lengkap dan mudah diintegrasikan.",
  reviews: 0,
  badge: "Baru",
  badgeTone: "new",
},
];

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Storefront({
  siteKey,
  isTurnstileTestMode,
}: {
  siteKey: string;
  isTurnstileTestMode: boolean;
}) {
  const [query, setQuery] = useState("");
  const [searchMessage, setSearchMessage] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountResult, setDiscountResult] = useState("");
  const [rupiah, setRupiah] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [conversionResult, setConversionResult] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [verificationError, setVerificationError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const turnstileContainer = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const matchingProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) =>
      `${product.name} ${product.description}`.toLowerCase().includes(normalized),
    );
  }, [query]);

  useEffect(() => {
    if (!cartOpen || !turnstileReady || !turnstileContainer.current) return;
    if (!window.turnstile || widgetId.current) return;

    widgetId.current = window.turnstile.render(turnstileContainer.current, {
      sitekey: siteKey,
      theme: "dark",
      size: "flexible",
      action: "checkout",
      callback: (token) => {
        setTurnstileToken(token);
        setVerificationError("");
      },
      "expired-callback": () => {
        setTurnstileToken("");
        setVerificationError("Verifikasi kedaluwarsa. Silakan ulangi.");
      },
      "error-callback": () => {
        setTurnstileToken("");
        setVerificationError("Verifikasi gagal dimuat. Silakan coba lagi.");
      },
    });
  }, [cartOpen, turnstileReady, siteKey]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const closeCart = () => {
    if (widgetId.current && window.turnstile) {
      window.turnstile.remove(widgetId.current);
    }
    widgetId.current = null;
    setTurnstileToken("");
    setVerificationError("");
    setCartOpen(false);
  };

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setToast(`${product.shortName} masuk ke keranjang`);
  };

  const removeFromCart = (id: number) => {
    setCart((current) => current.filter((item) => item.id !== id));
  };

  const searchProduct = () => {
    if (!query.trim()) {
      setSearchMessage("Ketik nama produk yang ingin dicari.");
      return;
    }
    setSearchMessage(
      matchingProducts.length
        ? `${matchingProducts.length} produk ditemukan.`
        : "Produk belum tersedia.",
    );
    document
      .getElementById("catalog")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const calculateDiscount = () => {
    const price = Number(originalPrice);
    const percentage = Number(discount);
    if (!price || percentage < 0 || percentage > 100) {
      setDiscountResult("Masukkan harga dan diskon 0–100%.");
      return;
    }
    setDiscountResult(
      `Harga akhir: ${formatRupiah(price - (price * percentage) / 100)}`,
    );
  };

  const convertPrice = () => {
    const amount = Number(rupiah);
    if (!amount || amount < 0) {
      setConversionResult("Masukkan nominal Rupiah yang valid.");
      return;
    }
    const rates: Record<string, { rate: number; label: string }> = {
      usd: { rate: 16_300, label: "USD" },
      idr: { rate: 1, label: "IDR" },
      sgd: { rate: 12_100, label: "SGD" },
      myr: { rate: 3_650, label: "MYR" },
    };
    const selected = rates[currency];
    const value = amount / selected.rate;
    setConversionResult(
      `≈ ${new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: selected.label,
        maximumFractionDigits: selected.label === "IDR" ? 0 : 2,
      }).format(value)}`,
    );
  };

  const checkout = async () => {
    if (!cart.length) {
      setVerificationError("Keranjang masih kosong.");
      return;
    }
    if (!turnstileToken) {
      setVerificationError("Selesaikan verifikasi keamanan terlebih dahulu.");
      return;
    }

    setCheckingOut(true);
    setVerificationError("");
    try {
      const response = await fetch("/api/turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: turnstileToken,
          order: cart.map(({ id, name, price, quantity }) => ({
            id,
            name,
            price,
            quantity,
          })),
        }),
      });
      const result = (await response.json()) as {
        success?: boolean;
        message?: string;
      };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Verifikasi tidak berhasil.");
      }

      const detail = cart
        .map(
          (item) =>
            `• ${item.name} x${item.quantity} (${formatRupiah(
              item.price * item.quantity,
            )})`,
        )
        .join("\n");
      const message = encodeURIComponent(
        `Halo Yandx Store, saya ingin memesan:\n${detail}\n\nTotal: ${formatRupiah(
          total,
        )}`,
      );
      setToast("Verifikasi berhasil. Membuka WhatsApp…");
      window.open(`https://wa.me/6281262253187?text=${message}`, "_blank");
      closeCart();
    } catch (error) {
      setVerificationError(
        error instanceof Error
          ? error.message
          : "Terjadi kendala. Silakan coba lagi.",
      );
      setTurnstileToken("");
      if (widgetId.current && window.turnstile) {
        window.turnstile.reset(widgetId.current);
      }
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setTurnstileReady(true)}
      />

      <div className="noise-layer" aria-hidden="true" />

      <header className="site-header">
        <div className="header-content">
          <a className="brand" href="#top" aria-label="TokoKu beranda">
            <span className="brand-mark">◈</span>
            <span>
              <strong>
                TokoKu<span className="brand-dot">.</span>
              </strong>
              <small>Produk digital terpercaya & aman dari penipuan</small>
            </span>
          </a>
          <button className="cart-chip" onClick={() => setCartOpen(true)}>
            <span aria-hidden="true">⌑</span>
            Keranjang <b>{count}</b>
          </button>
          <div className="trust-chip">
            <span className="chip-pulse" />
            Toko terverifikasi
          </div>
        </div>
      </header>

      <main id="top">
        <section className="banner">
          <div className="banner-grid" aria-hidden="true" />
          <div className="banner-glow" aria-hidden="true" />
          <div className="banner-content">
            <span className="eyebrow">{"// yandx store"}</span>
            <h1>
              Produk digital,
              <br />
              <span>harga bersahabat.</span>
            </h1>
            <p className="banner-subtext">
              Belanja produk digital dengan proses cepat, harga transparan, dan
              verifikasi keamanan sebelum checkout.
            </p>
            <div className="hero-actions">
              <a className="primary-action" href="#catalog">
                Lihat katalog <span>↘</span>
              </a>
              <span className="secure-note">
                <i>✓</i> Dilindungi Cloudflare Turnstile
              </span>
            </div>
            <div className="banner-stats">
              <div className="stat">
                <strong>30+</strong>
                <span>Pelanggan aktif</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <strong>
                  4.9<span className="stat-star">★</span>
                </strong>
                <span>Rating rata-rata</span>
              </div>
              <div className="stat-divider" />
              <div className="stat">
                <strong>&lt;5 mnt</strong>
                <span>Proses pengiriman</span>
              </div>
            </div>
          </div>
        </section>

        <section className="tools-section">
          <div className="section-heading">
            <span className="eyebrow">{"// utilitas"}</span>
            <div>
              <h2>Tools berguna</h2>
              <p>Bantu hitung dan temukan produk sebelum belanja.</p>
            </div>
          </div>

          <div className="tools-container">
            <article className="tool-card">
              <div className="tool-top">
                <span className="tool-index">01</span>
                <span className="tool-icon">⌕</span>
              </div>
              <h3>Cari Produk</h3>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && searchProduct()}
                placeholder="Cari nama produk..."
                className="tool-input"
                aria-label="Nama produk"
              />
              <button onClick={searchProduct} className="tool-btn">
                Cari produk
              </button>
              <p className="tool-result" aria-live="polite">
                {searchMessage}
              </p>
            </article>

            <article className="tool-card">
              <div className="tool-top">
                <span className="tool-index">02</span>
                <span className="tool-icon">%</span>
              </div>
              <h3>Hitung Diskon</h3>
              <input
                type="number"
                value={originalPrice}
                onChange={(event) => setOriginalPrice(event.target.value)}
                placeholder="Harga asli (Rp)"
                className="tool-input"
                min="0"
              />
              <input
                type="number"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
                placeholder="Diskon (%)"
                className="tool-input"
                min="0"
                max="100"
              />
              <button onClick={calculateDiscount} className="tool-btn">
                Hitung diskon
              </button>
              <p className="tool-result" aria-live="polite">
                {discountResult}
              </p>
            </article>

            <article className="tool-card">
              <div className="tool-top">
                <span className="tool-index">03</span>
                <span className="tool-icon">⇄</span>
              </div>
              <h3>Konversi Harga</h3>
              <input
                type="number"
                value={rupiah}
                onChange={(event) => setRupiah(event.target.value)}
                placeholder="Masukkan Rp"
                className="tool-input"
                min="0"
              />
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className="tool-input"
                aria-label="Mata uang tujuan"
              >
                <option value="usd">USD ($)</option>
                <option value="idr">IDR (Rp)</option>
                <option value="sgd">SGD ($)</option>
                <option value="myr">MYR (RM)</option>
              </select>
              <button onClick={convertPrice} className="tool-btn">
                Konversi
              </button>
              <p className="tool-result" aria-live="polite">
                {conversionResult}
              </p>
            </article>

            <article className="tool-card cart-tool-card">
              <div className="tool-top">
                <span className="tool-index">04</span>
                <span className="tool-icon">⌑</span>
              </div>
              <h3>Keranjang</h3>
              <p className="cart-summary">
                <strong>{count}</strong>
                <span>item dipilih</span>
              </p>
              <button onClick={() => setCartOpen(true)} className="tool-btn">
                Lihat keranjang
              </button>
              <p className="tool-result">
                {count ? `Total sementara ${formatRupiah(total)}` : "Belum ada item."}
              </p>
            </article>
          </div>
        </section>

        <section className="produk-section" id="catalog">
          <div className="section-heading">
            <span className="eyebrow">{"// katalog"}</span>
            <div>
              <h2>Produk kami</h2>
              <p>Pilihan produk digital yang siap diproses hari ini.</p>
            </div>
          </div>

          <div className="produk-container">
            {matchingProducts.map((product) => (
              <article className="produk" key={product.id}>
                <div className="produk-img-wrap">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.image} alt={product.name} loading="lazy" />
                  {product.badge && (
                    <span
                      className={`badge ${
                        product.badgeTone === "discount"
                          ? "badge-diskon"
                          : "badge-new"
                      }`}
                    >
                      {product.badge}
                    </span>
                  )}
                </div>
                <div className="produk-body">
                  <div className="product-number">
                    / 0{product.id}
                  </div>
                  <h3>{product.shortName}</h3>
                  <p className="deskripsi">{product.description}</p>
                  <div className="rating">
                    <span aria-label="5 dari 5 bintang">★★★★★</span>
                    <small>({product.reviews} ulasan)</small>
                  </div>
                  <div className="produk-footer">
                    <p className="harga">
                      {product.oldPrice && (
                        <del>{formatRupiah(product.oldPrice)}</del>
                      )}
                      <strong>{formatRupiah(product.price)}</strong>
                    </p>
                    <button
                      onClick={() => addToCart(product)}
                      className="beli-btn"
                    >
                      Tambah <span>+</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!matchingProducts.length && (
            <div className="empty-state">
              <span>⌕</span>
              <h3>Produk tidak ditemukan</h3>
              <p>Coba kata kunci lain atau hapus pencarian.</p>
              <button onClick={() => setQuery("")}>Tampilkan semua</button>
            </div>
          )}
        </section>
      </main>

      <footer>
        <div className="footer-content">
          <div className="footer-brand">
            <span className="brand-mark">◈</span>
            <strong>TokoKu.</strong>
            <p>Produk digital terpercaya untuk kebutuhan Anda.</p>
          </div>
          <div className="footer-section">
            <h4>Hubungi kami</h4>
            <p>WhatsApp: 0812-6225-3187</p>
            <p>Email: info@tokoku.com</p>
          </div>
          <div className="footer-section">
            <h4>Jam operasional</h4>
            <p>Senin–Jumat: 09:00–18:00</p>
            <p>Sabtu–Minggu: 10:00–17:00</p>
          </div>
          <div className="footer-section">
            <h4>Jaminan kami</h4>
            <p>✓ Produk original</p>
            <p>✓ Pengiriman cepat & aman</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 TokoKu — Yandx Store</p>
          <p>Protected by Cloudflare Turnstile</p>
        </div>
      </footer>

      {cartOpen && (
        <div className="modal-backdrop" onMouseDown={closeCart}>
          <section
            className="cart-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">{"// pesanan"}</span>
                <h2 id="cart-title">Keranjang Anda</h2>
              </div>
              <button
                className="close-btn"
                onClick={closeCart}
                aria-label="Tutup keranjang"
              >
                ×
              </button>
            </div>

            <div className="cart-lines">
              {cart.length ? (
                cart.map((item) => (
                  <div className="cart-line" key={item.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image} alt="" />
                    <div>
                      <strong>{item.shortName}</strong>
                      <span>
                        {item.quantity} × {formatRupiah(item.price)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Hapus ${item.shortName}`}
                    >
                      Hapus
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-cart">
                  <span>⌑</span>
                  <p>Keranjang Anda masih kosong.</p>
                </div>
              )}
            </div>

            <div className="cart-total">
              <span>Total pembayaran</span>
              <strong>{formatRupiah(total)}</strong>
            </div>

            {cart.length > 0 && (
              <div className="turnstile-panel">
                <div className="turnstile-heading">
                  <div>
                    <strong>Verifikasi keamanan</strong>
                    <span>Selesaikan sebelum melanjutkan pesanan.</span>
                  </div>
                  <span className="shield-icon">✓</span>
                </div>
                <div ref={turnstileContainer} className="turnstile-container" />
                {isTurnstileTestMode && (
                  <p className="test-mode">
                    Mode pengujian aktif — masukkan kunci produksi untuk
                    perlindungan nyata.
                  </p>
                )}
                {verificationError && (
                  <p className="verification-error" role="alert">
                    {verificationError}
                  </p>
                )}
              </div>
            )}

            <button
              className="checkout-btn"
              onClick={checkout}
              disabled={!cart.length || !turnstileToken || checkingOut}
            >
              {checkingOut ? "Memverifikasi…" : "Lanjut pesan via WhatsApp"}
              {!checkingOut && <span>→</span>}
            </button>
            <p className="privacy-note">
              Secret key hanya diproses di server dan tidak pernah dikirim ke
              browser.
            </p>
          </section>
        </div>
      )}

      <div className={`toast ${toast ? "show" : ""}`} role="status">
        <span>✓</span> {toast}
      </div>
    </>
  );
}
