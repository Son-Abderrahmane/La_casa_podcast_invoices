document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.getElementById('items-container');
    const addItemBtn = document.getElementById('add-item-btn');
    const form = document.getElementById('invoice-form');
    const logoInput = document.getElementById('logo-input');
    const previewLogo = document.getElementById('preview-logo');

    // --- 1. SET DEFAULT DATE (TODAY) ---
    const dateInput = document.getElementById('invoice-date');
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    if (dateInput) dateInput.value = formattedDate;

    // --- 2. SET YOUR LOCAL LOGO AS DEFAULT ---
    previewLogo.src = 'la-casa-podcaast-logo.png'; 
    previewLogo.classList.remove('hidden');

    // Initialize logic
    createItemRow();
    updatePreview();

    // Listen for any typing in the form
    form.addEventListener('input', updatePreview);
    
    addItemBtn.addEventListener('click', () => {
        createItemRow();
        updatePreview();
    });

    // Allow user to override the default logo with a manual upload
    logoInput.addEventListener('change', function(e) {
        const reader = new FileReader();
        reader.onload = function() {
            previewLogo.src = reader.result;
            previewLogo.classList.remove('hidden');
        }
        if (e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
    });

    function createItemRow() {
        const div = document.createElement('div');
        div.className = 'item-row';
        div.innerHTML = `
            <input type="text" class="item-desc" placeholder="Désignation" required>
            <input type="number" class="item-tva" value="20" placeholder="TVA %">
            <input type="number" class="item-price" placeholder="P.U. HT" step="0.01" required>
            <input type="number" class="item-qty" value="1" placeholder="Qté" required>
            <button type="button" class="btn-remove">X</button>
        `;
        div.querySelector('.btn-remove').addEventListener('click', () => {
            div.remove();
            updatePreview();
        });
        itemsContainer.appendChild(div);
    }

    function updatePreview() {
        // --- SYNC ALL DETAILS (Company, Client, Date) ---
        document.getElementById('preview-company-name').textContent = document.getElementById('company-name').value;
        document.getElementById('preview-company-address').textContent = document.getElementById('company-address').value;
        document.getElementById('preview-company-ice').textContent = document.getElementById('company-ice').value;
        
        document.getElementById('preview-client-name').textContent = document.getElementById('client-name').value;
        document.getElementById('preview-client-ice').textContent = document.getElementById('client-ice').value;
        document.getElementById('preview-date').textContent = document.getElementById('invoice-date').value;

        // --- CALCULATION LOGIC ---
        let totalHT = 0;
        let totalTVA = 0;
        const itemsBody = document.getElementById('preview-items-body');
        itemsBody.innerHTML = '';

        document.querySelectorAll('.item-row').forEach(row => {
            const desc = row.querySelector('.item-desc').value;
            const tvaPercent = parseFloat(row.querySelector('.item-tva').value) || 0;
            const priceTTC = parseFloat(row.querySelector('.item-price').value) || 0;
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;

            const priceHT = priceTTC / (1 + tvaPercent / 100);
            const unitTVA = priceTTC - priceHT;
            const rowHT = priceHT * qty;
            const rowTVA = unitTVA * qty;

            totalHT += rowHT;
            totalTVA += rowTVA;

            if (desc) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${desc}</td>
                    <td>${tvaPercent}%</td>
                    <td>${priceHT.toFixed(2)}</td>
                    <td>${qty}</td>
                    <td>${rowHT.toFixed(2)}</td>
                `;
                itemsBody.appendChild(tr);
            }
        });

        const totalTTC = totalHT + totalTVA;
        document.getElementById('preview-total-ht').textContent = totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 });
        document.getElementById('preview-total-tva').textContent = totalTVA.toLocaleString('fr-FR', { minimumFractionDigits: 2 });
        document.getElementById('preview-total-ttc').textContent = totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 });
    }

    // PDF Export with high quality
// Find the download-pdf event listener in script.js and replace it with this:
document.getElementById('download-pdf').addEventListener('click', () => {
    const element = document.getElementById('invoice-template');
    
    // 1. Temporarily disable scaling for a clean capture
    const originalTransform = element.style.transform;
    element.style.transform = "none";

    const opt = {
        margin: 0,
        filename: `Facture_${document.getElementById('client-name').value || 'LA_CASA'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            y: 0,
            scrollY: 0,
            windowHeight: element.scrollHeight // Captures only the actual content height
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
        },
        // This forces the library to NOT create a new page
        pagebreak: { mode: 'avoid-all' } 
    };

    // 2. Generate
    html2pdf().set(opt).from(element).toPdf().get('pdf').then(function (pdf) {
        // Double check: if there is more than 1 page, delete the others
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = totalPages; i > 1; i--) {
            pdf.deletePage(i);
        }
    }).save().then(() => {
        // 3. Restore the screen scaling
        element.style.transform = originalTransform;
    });
});
});