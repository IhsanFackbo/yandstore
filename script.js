// Data Produk
const produk = [
    { nama: 'Nokos Indonesia', harga: 5000, id: 1 },
    { nama: 'Alight Motion Premium', harga: 5000, id: 2 },
    { nama: 'Script Denia premium group', harga: 29000, id: 3 }
];

// Keranjang Belanja
let cart = [];

// Fungsi Pesan Original
function pesan(namaProduk){
    let nomor = "6281234567890";
    let pesan = "Halo, saya ingin membeli " + namaProduk;
    let url = "https://wa.me/" + nomor + "?text=" + encodeURIComponent(pesan);
    window.open(url,"_blank");
}

// ========== TOOLS FUNCTIONS ==========

// 1. SEARCH PRODUK
function searchProduk() {
    const keyword = document.getElementById('searchInput').value.toLowerCase().trim();
    const resultDiv = document.getElementById('searchResult');
    
    if (!keyword) {
        resultDiv.innerHTML = '⚠️ Silakan masukkan nama produk';
        resultDiv.style.color = '#ff9800';
        return;
    }
    
    const hasil = produk.filter(p => p.nama.toLowerCase().includes(keyword));
    
    if (hasil.length > 0) {
        let text = '✅ Ditemukan ' + hasil.length + ' produk: ';
        hasil.forEach(p => {
            text += p.nama + ' (Rp' + p.harga.toLocaleString('id-ID') + '), ';
        });
        resultDiv.innerHTML = text;
        resultDiv.style.color = '#4caf50';
    } else {
        resultDiv.innerHTML = '❌ Produk tidak ditemukan';
        resultDiv.style.color = '#f44336';
    }
}

// 2. HITUNG DISKON
function hitungDiskon() {
    const hargaAsli = parseFloat(document.getElementById('hargaAsli').value);
    const diskonPersen = parseFloat(document.getElementById('diskonPersen').value);
    const resultDiv = document.getElementById('hasilDiskon');
    
    if (!hargaAsli || !diskonPersen || hargaAsli <= 0 || diskonPersen < 0) {
        resultDiv.innerHTML = '⚠️ Masukkan nilai dengan benar';
        resultDiv.style.color = '#ff9800';
        return;
    }
    
    if (diskonPersen > 100) {
        resultDiv.innerHTML = '❌ Diskon tidak boleh lebih dari 100%';
        resultDiv.style.color = '#f44336';
        return;
    }
    
    const nominalDiskon = hargaAsli * (diskonPersen / 100);
    const hargaFinal = hargaAsli - nominalDiskon;
    
    resultDiv.innerHTML = 
        '💰 Harga Asli: Rp' + hargaAsli.toLocaleString('id-ID') + '<br>' +
        '🏷️ Diskon (' + diskonPersen + '%): -Rp' + nominalDiskon.toLocaleString('id-ID') + '<br>' +
        '<strong style="color:#667eea; font-size:18px;">Harga Final: Rp' + hargaFinal.toLocaleString('id-ID') + '</strong>';
    resultDiv.style.color = '#333';
}

// 3. KONVERSI HARGA
function konversiHarga() {
    const rupiah = parseFloat(document.getElementById('rupiahInput').value);
    const currency = document.getElementById('currencySelect').value;
    const resultDiv = document.getElementById('hasilKonversi');
    
    if (!rupiah || rupiah <= 0) {
        resultDiv.innerHTML = '⚠️ Masukkan jumlah rupiah';
        resultDiv.style.color = '#ff9800';
        return;
    }
    
    // Kurs Terbaru (bisa disesuaikan)
    const rates = {
        usd: 0.000063,  // 1 IDR = 0.000063 USD
        idr: 1,
        sgd: 0.000084,  // 1 IDR = 0.000084 SGD
        myr: 0.00030    // 1 IDR = 0.00030 MYR
    };
    
    const symbols = {
        usd: '$',
        idr: 'Rp',
        sgd: '$',
        myr: 'RM'
    };
    
    const hasil = rupiah * rates[currency];
    
    resultDiv.innerHTML = 
        'Rp' + rupiah.toLocaleString('id-ID') + ' = <strong style="color:#667eea; font-size:18px;">' + 
        symbols[currency] + hasil.toFixed(2) + '</strong>';
    resultDiv.style.color = '#333';
}

// 4. TAMBAH KE KERANJANG
function tambahKeranjang(namaProduk, harga) {
    const item = {
        nama: namaProduk,
        harga: harga,
        id: Math.random()
    };
    
    cart.push(item);
    updateCartCount();
    
    // Notifikasi
    alert('✅ ' + namaProduk + ' ditambahkan ke keranjang!');
}

// 5. UPDATE CART COUNT
function updateCartCount() {
    document.getElementById('cartCount').textContent = cart.length;
}

// 6. LIHAT KERANJANG
function lihatKeranjang() {
    const cartPreview = document.getElementById('cartPreview');
    
    if (cart.length === 0) {
        cartPreview.innerHTML = '🛒 Keranjang kosong';
        return;
    }
    
    let total = 0;
    let html = '<div style="text-align: left; margin-top: 10px;">';
    
    cart.forEach((item, index) => {
        html += '<div style="padding: 8px 0; border-bottom: 1px solid #eee;">' +
                (index + 1) + '. ' + item.nama + '<br>' +
                '<span style="color: #667eea; font-weight: bold;">Rp' + item.harga.toLocaleString('id-ID') + '</span>' +
                '</div>';
        total += item.harga;
    });
    
    html += '<div style="margin-top: 12px; padding-top: 12px; border-top: 2px solid #667eea;">' +
            '<strong>Total: Rp' + total.toLocaleString('id-ID') + '</strong><br>' +
            '<button onclick="checkoutCart()" style="margin-top: 10px; width: 100%; padding: 10px;">Checkout</button>' +
            '</div></div>';
    
    cartPreview.innerHTML = html;
}

// 7. CHECKOUT
function checkoutCart() {
    if (cart.length === 0) {
        alert('❌ Keranjang kosong');
        return;
    }
    
    let total = 0;
    let items = '';
    
    cart.forEach(item => {
        items += item.nama + ' (Rp' + item.harga.toLocaleString('id-ID') + '), ';
        total += item.harga;
    });
    
    let nomor = "6281234567890";
    let pesanCheckout = "Halo, saya ingin membeli:\n" + items + 
                        "\nTotal: Rp" + total.toLocaleString('id-ID');
    let url = "https://wa.me/" + nomor + "?text=" + encodeURIComponent(pesanCheckout);
    
    window.open(url, "_blank");
    cart = [];
    updateCartCount();
    document.getElementById('cartPreview').innerHTML = '✅ Pesanan terkirim ke WhatsApp!';
}