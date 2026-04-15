document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.getElementById('items-container');
    const addItemBtn = document.getElementById('add-item-btn');
    const form = document.getElementById('invoice-form');

    // Initial item row
    createItemRow();

    // Event Listeners for Live Preview
    form.addEventListener('input', updatePreview);
    addItemBtn.addEventListener('click', () => {
        createItemRow();
        updatePreview();
    });

    // Logo Upload
    document.getElementById('logo-input').addEventListener('change', function(e) {
        const reader = new FileReader();
        reader.onload = function() {
            const img = document.getElementById('preview-logo');
            img.src = reader.result;
            img.classList.remove('hidden');
        }
        reader.readAsDataURL(e.target.files[0]);
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
        // Basic Info
        document.getElementById('preview-company-name').textContent = document.getElementById('company-name').value;
        document.getElementById('preview-company-address').textContent = document.getElementById('company-address').value;
        document.getElementById('preview-company-ice').textContent = document.getElementById('company-ice').value;
        document.getElementById('preview-client-name').textContent = document.getElementById('client-name').value;
        document.getElementById('preview-date').textContent = document.getElementById('invoice-date').value;
        
        const clientIce = document.getElementById('client-ice').value;
        document.getElementById('preview-client-ice').textContent = clientIce;
        document.getElementById('preview-client-ice-row').style.display = clientIce ? 'block' : 'none';

        // Calculation Logic
        let totalHT = 0;
        let totalTVA = 0;
        const itemsBody = document.getElementById('preview-items-body');
        itemsBody.innerHTML = '';

        document.querySelectorAll('.item-row').forEach(row => {
            const desc = row.querySelector('.item-desc').value;
            const tvaPercent = parseFloat(row.querySelector('.item-tva').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;

            const rowHT = price * qty;
            const rowTVA = rowHT * (tvaPercent / 100);
            
            totalHT += rowHT;
            totalTVA += rowTVA;

            if(desc) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${desc}</td>
                    <td>${tvaPercent}%</td>
                    <td>${price.toFixed(2)}</td>
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

    // PDF Export
    document.getElementById('download-pdf').addEventListener('click', () => {
        const element = document.getElementById('invoice-template');
        const opt = {
            margin: 0,
            filename: `Facture_${document.getElementById('client-name').value || 'Export'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    });

    document.getElementById('print-invoice').addEventListener('click', () => {
        window.print();
    });
});