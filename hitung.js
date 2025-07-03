const platformData = {
    shopee_a: { 
        percentage: 8.0, 
        fixed: 0, 
        info: "Shopee Kategori A: 8% (Fashion, Elektronik, Kebutuhan sehari-hari, Aksesoris HP, Otomotif)" 
    },
    shopee_b: { 
        percentage: 7.5, 
        fixed: 0, 
        info: "Shopee Kategori B: 7.5% dari harga jual setelah diskon seller" 
    },
    shopee_c: { 
        percentage: 5.75, 
        fixed: 0, 
        info: "Shopee Kategori C: 5.75% dari harga jual setelah diskon seller" 
    },
    shopee_d: { 
        percentage: 4.25, 
        fixed: 0, 
        info: "Shopee Kategori D: 4.25% (Sebagian elektronik & perlengkapan rumah)" 
    },
    tokopedia_elektronik: { 
        percentage: 8.0, 
        fixed: 0, 
        info: "Tokopedia Elektronik: 1-10% (efektif 8% setelah diskon 20% dari tarif penuh)" 
    },
    tokopedia_fashion: { 
        percentage: 8.0, 
        fixed: 0, 
        info: "Tokopedia Fashion/FMCG/Gaya Hidup: 4.25-10% (efektif 8% setelah diskon 20%)" 
    },
    tokopedia_lain: { 
        percentage: 8.0, 
        fixed: 0, 
        info: "Tokopedia Kategori Lain: 1-10% (efektif 8% setelah diskon 20%)" 
    },
    lazada_marketplace: { 
        percentage: 6.0, 
        fixed: 0, 
        info: "Lazada Marketplace: 4.25-8% + biaya penanganan ~1.5% (rata-rata ~6%)" 
    },
    lazada_lazmall: { 
        percentage: 7.5, 
        fixed: 0, 
        info: "LazMall: 4.32-10.32% + biaya penanganan ~1.5% (rata-rata ~7.5%)" 
    },
    tiktokshop_low: { 
        percentage: 2.0, 
        fixed: 2000, 
        info: "TikTok Shop Kategori Rendah: ~2% + Rp2.000 per pesanan" 
    },
    tiktokshop_high: { 
        percentage: 6.5, 
        fixed: 2000, 
        info: "TikTok Shop Kategori Tinggi: ~6.5% + Rp2.000 per pesanan" 
    },
    instagram: { 
        percentage: 0, 
        fixed: 0, 
        info: "Penjualan langsung tanpa fee platform" 
    }
};

// Event listeners for mode selection
document.addEventListener('DOMContentLoaded', function() {
    // Mode selection event listeners
    document.getElementById('markupMode').addEventListener('change', function() {
        if (this.checked) {
            updateModeDisplay('markup');
        }
    });

    document.getElementById('marginMode').addEventListener('change', function() {
        if (this.checked) {
            updateModeDisplay('margin');
        }
    });

    // Platform selection event listener
    document.getElementById('platform').addEventListener('change', function() {
        const platform = this.value;
        const customFeeGroup = document.getElementById('customFeeGroup');
        const customFixedGroup = document.getElementById('customFixedGroup');
        const platformInfo = document.getElementById('platformInfo');
        
        if (platform === 'custom') {
            customFeeGroup.classList.remove('hidden');
            customFixedGroup.classList.remove('hidden');
            platformInfo.classList.remove('hidden');
            platformInfo.textContent = 'Masukkan fee custom sesuai kebutuhan Anda';
        } else {
            customFeeGroup.classList.add('hidden');
            customFixedGroup.classList.add('hidden');
            if (platform && platformData[platform]) {
                platformInfo.classList.remove('hidden');
                platformInfo.textContent = platformData[platform].info;
            } else {
                platformInfo.classList.add('hidden');
            }
        }
    });

    // Initialize mode display
    updateModeDisplay('markup');
});

function updateModeDisplay(mode) {
    const profitLabel = document.getElementById('profitLabel');
    const modeExplanation = document.getElementById('modeExplanation');
    
    if (mode === 'markup') {
        profitLabel.textContent = 'Mark Up Target (%)';
        modeExplanation.innerHTML = '<strong>Mark Up:</strong> Dihitung dari harga modal. Contoh: Modal 100rb, Mark up 20% = Profit 20rb';
    } else {
        profitLabel.textContent = 'Margin Target (%)';
        modeExplanation.innerHTML = '<strong>Margin:</strong> Dihitung dari harga jual. Contoh: Harga jual 125rb, Modal 100rb, Margin 20% = Profit 25rb';
    }
}

function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
}

function calculate() {
    const modalPrice = parseFloat(document.getElementById('modalPrice').value) || 0;
    const platform = document.getElementById('platform').value;
    const profitPercentage = parseFloat(document.getElementById('profitPercentage').value) || 0;
    const affiliateFee = parseFloat(document.getElementById('affiliateFee').value) || 0;
    const optionalFee = parseFloat(document.getElementById('optionalFee').value) || 0;
    const profitMode = document.querySelector('input[name="profitMode"]:checked').value;
    
    // Validasi input
    if (modalPrice <= 0) {
        alert('⚠️ Mohon masukkan harga modal yang valid!');
        return;
    }
    
    if (!platform) {
        alert('⚠️ Mohon pilih platform penjualan!');
        return;
    }
    
    // Ambil data fee platform
    let feePercentage = 0;
    let feeFixed = 0;
    
    if (platform === 'custom') {
        feePercentage = parseFloat(document.getElementById('customFee').value) || 0;
        feeFixed = parseFloat(document.getElementById('customFixed').value) || 0;
    } else if (platformData[platform]) {
        feePercentage = platformData[platform].percentage;
        feeFixed = platformData[platform].fixed;
    }
    
    // Hitung harga jual
    let finalPrice;
    let targetProfit;
    
    const totalPercentageFees = (feePercentage + affiliateFee + optionalFee) / 100;
    
    if (profitMode === 'markup') {
        // Mark Up: Target profit = Modal × Mark Up %
        targetProfit = modalPrice * (profitPercentage / 100);
        const basePrice = modalPrice + feeFixed + targetProfit;
        finalPrice = basePrice / (1 - totalPercentageFees);
    } else {
        // Margin: Target profit = Harga Jual × Margin %
        // Harga Jual = (Modal + Fixed Fee) / (1 - Total Fees% - Margin%)
        const basePriceWithoutProfit = modalPrice + feeFixed;
        const totalDeductions = totalPercentageFees + (profitPercentage / 100);
        
        if (totalDeductions >= 1) {
            alert('⚠️ Total persentase fee dan margin tidak boleh >= 100%!');
            return;
        }
        
        finalPrice = basePriceWithoutProfit / (1 - totalDeductions);
        targetProfit = finalPrice * (profitPercentage / 100);
    }
    
    // Hitung masing-masing fee yang akan dipotong
    const platformFee = (finalPrice * feePercentage / 100) + feeFixed;
    const affiliateCost = finalPrice * affiliateFee / 100;
    const optionalCost = finalPrice * optionalFee / 100;
    
    // Hitung profit aktual
    const actualProfit = finalPrice - modalPrice - platformFee - affiliateCost - optionalCost;
    
    // Hitung persentase aktual
    let actualPercentage;
    if (profitMode === 'markup') {
        actualPercentage = (actualProfit / modalPrice) * 100;
    } else {
        actualPercentage = (actualProfit / finalPrice) * 100;
    }
    
    // Tampilkan hasil
    displayResults({
        modalPrice,
        platformFee,
        affiliateCost,
        optionalCost,
        targetProfit,
        finalPrice,
        actualProfit,
        actualPercentage,
        profitMode
    });
}

function displayResults(results) {
    const {
        modalPrice,
        platformFee,
        affiliateCost,
        optionalCost,
        targetProfit,
        finalPrice,
        actualProfit,
        actualPercentage,
        profitMode
    } = results;
    
    // Update hasil di UI
    document.getElementById('resultModal').textContent = formatRupiah(modalPrice);
    document.getElementById('resultFee').textContent = formatRupiah(platformFee);
    document.getElementById('resultAffiliate').textContent = formatRupiah(affiliateCost);
    document.getElementById('resultOptional').textContent = formatRupiah(optionalCost);
    document.getElementById('resultProfit').textContent = formatRupiah(targetProfit);
    document.getElementById('resultFinal').textContent = formatRupiah(finalPrice);
    
    // Update verifikasi perhitungan
    document.getElementById('actualProfit').textContent = formatRupiah(actualProfit);
    document.getElementById('actualPercentage').textContent = actualPercentage.toFixed(2) + '%';
    
    // Update label sesuai mode
    if (profitMode === 'markup') {
        document.getElementById('resultProfitLabel').textContent = 'Target Mark Up:';
        document.getElementById('actualPercentageLabel').textContent = 'Mark Up Aktual:';
    } else {
        document.getElementById('resultProfitLabel').textContent = 'Target Margin:';
        document.getElementById('actualPercentageLabel').textContent = 'Margin Aktual:';
    }
    
    // Tampilkan panel hasil
    document.getElementById('results').classList.remove('hidden');
    
    // Scroll ke hasil
    document.getElementById('results').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Fungsi untuk reset form
function resetForm() {
    document.getElementById('modalPrice').value = '';
    document.getElementById('platform').value = '';
    document.getElementById('profitPercentage').value = '';
    document.getElementById('affiliateFee').value = '';
    document.getElementById('optionalFee').value = '';
    document.getElementById('customFee').value = '';
    document.getElementById('customFixed').value = '';
    document.getElementById('markupMode').checked = true;
    document.getElementById('results').classList.add('hidden');
    updateModeDisplay('markup');
}

// Event listener untuk Enter key
document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        calculate();
    }
});

// Format input angka saat user mengetik
document.addEventListener('DOMContentLoaded', function() {
    const numberInputs = ['modalPrice', 'profitPercentage', 'affiliateFee', 'optionalFee', 'customFee', 'customFixed'];
    
    numberInputs.forEach(function(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function() {
                // Hapus karakter non-digit kecuali titik
                this.value = this.value.replace(/[^0-9.]/g, '');
                
                // Pastikan hanya ada satu titik
                const parts = this.value.split('.');
                if (parts.length > 2) {
                    this.value = parts[0] + '.' + parts.slice(1).join('');
                }
            });
        }
    });
});