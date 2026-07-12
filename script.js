// ==========================================================
// TokoKu — data produk & logika tools
// ==========================================================

const produkList = [
    { nama: "Nokos Indonesia", harga: 5000 },
    { nama: "Alight Motion Premium", harga: 5000 },
    { nama: "Script Denia premium group", harga: 29000 },
];

let keranjang = [];

// ---------- Format Rupiah ----------
function formatRupiah(angka) {
    return "Rp" + Number(angka).toLocaleString("id-ID");
}

// ---------- Toast ----------
function showToast(pesan) {
    const toast = document.getElementById("toast");
    toast.textContent = pesan;
    toast.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

// ---------- Tool 1: Cari Produk ----------
function searchProduk() {
    const input = document.getElementById("searchInput").value.trim().toLowerCase();
    const hasil = document.getElementById("searchResult");

    if (!input) {
        hasil.textContent = "Masukkan kata kunci pencarian.";
        return;
    }

    const cocok = produkList.filter(p => p.nama.toLowerCase().includes(input));

    if (cocok.length === 0) {
        hasil.textContent = `Produk "${input}" tidak ditemukan.`;
    } else {
        hasil.textContent = cocok.map(p => `${p.nama} — ${formatRupiah(p.harga)}`).join(" | ");
    }
}

// ---------- Tool 2: Kalkulator Diskon ----------
function hitungDiskon() {
    const harga = parseFloat(document.getElementById("hargaAsli").value);
    const diskon = parseFloat(document.getElementById("diskonPersen").value);
    const hasil = document.getElementById("hasilDiskon");

    if (isNaN(harga) || harga <= 0) {
        hasil.textContent = "Masukkan harga asli yang valid.";
        return;
    }
    if (isNaN(diskon) || diskon < 0 || diskon > 100) {
        hasil.textContent = "Masukkan persen diskon antara 0–100.";
        return;
    }

    const potongan = (harga * diskon) / 100;
    const hargaAkhir = harga - potongan;

    hasil.textContent = `Hemat ${formatRupiah(potongan)} → Bayar ${formatRupiah(hargaAkhir)}`;
}

// ---------- Tool 3: Konversi Harga ----------
const kurs = {
    usd: 16300,   // 1 USD ≈ Rp16.300
    idr: 1,
    sgd: 12100,   // 1 SGD ≈ Rp12.100
    myr: 3450,    // 1 MYR ≈ Rp3.450
};

const simbol = { usd: "$", idr: "Rp", sgd: "S$", myr: "RM" };

function konversiHarga() {
    const rupiah = parseFloat(document.getElementById("rupiahInput").value);
    const target = document.getElementById("currencySelect").value;
    const hasil = document.getElementById("hasilKonversi");

    if (isNaN(rupiah) || rupiah <= 0) {
        hasil.textContent = "Masukkan jumlah Rupiah yang valid.";
        return;
    }

    if (target === "idr") {
        hasil.textContent = formatRupiah(rupiah);
        return;
    }

    const nilai = rupiah / kurs[target];
    hasil.textContent = `≈ ${simbol[target]}${nilai.toLocaleString("id-ID", { maximumFractionDigits: 2 })} (kurs perkiraan)`;
}

// ---------- Tool 4: Keranjang ----------
function tambahKeranjang(nama, harga) {
    keranjang.push({ nama, harga });
    document.getElementById("cartCount").textContent = keranjang.length;
    showToast(`${nama} ditambahkan ke keranjang`);
}

function lihatKeranjang() {
    const preview = document.getElementById("cartPreview");

    if (keranjang.length === 0) {
        preview.textContent = "Keranjang masih kosong.";
        return;
    }

    const total = keranjang.reduce((sum, item) => sum + item.harga, 0);
    const daftar = keranjang.map(item => `• ${item.nama} — ${formatRupiah(item.harga)}`).join("<br>");

    preview.innerHTML = `${daftar}<br><strong>Total: ${formatRupiah(total)}</strong>`;
}
