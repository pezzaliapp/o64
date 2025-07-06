let csvData = [];

document.getElementById('csvFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    const text = event.target.result;
    csvData = parseCSV(text);
    document.getElementById('search').disabled = false;
    alert('✅ Listino caricato!');
  };
  reader.readAsText(file, 'ISO-8859-1');
});

function parseCSV(text) {
  const rows = text.split('\n').slice(1);
  return rows.map(row => {
    const cols = row.split(';');
    return {
      codice: cols[0]?.trim(),
      descrizione: cols[1],
      prezzoLordo: parseFloat(cols[2]?.replace(',', '.') || 0),
      installazione: parseFloat(cols[3]?.replace(',', '.') || 0),
      trasporto: parseFloat(cols[4]?.replace(',', '.') || 0)
    };
  });
}

document.getElementById('search').addEventListener('input', function () {
  const term = this.value.toLowerCase();
  const results = csvData.filter(p =>
    p.codice.toLowerCase().includes(term) || p.descrizione.toLowerCase().includes(term)
  );

  const output = document.getElementById('searchResults');
  output.innerHTML = '';
  results.forEach(p => {
    const btn = document.createElement('button');
    btn.textContent = `${p.codice} – ${p.descrizione}`;
    btn.onclick = () => addProduct(p);
    output.appendChild(btn);
  });
});

function addProduct(p) {
  const tbody = document.querySelector('#itemsTable tbody');
  const row = tbody.insertRow();

  row.innerHTML = `
    <td>${p.codice}</td>
    <td>${p.descrizione}</td>
    <td><input type="number" class="qty" value="1" min="1"></td>
    <td>€${p.prezzoLordo.toFixed(2)}</td>
    <td><input type="number" class="sconto" value="0" min="0" max="100"></td>
    <td><input type="number" class="netto" value="${p.prezzoLordo.toFixed(2)}"></td>
    <td><input type="number" class="trasporto" value="${p.trasporto.toFixed(2)}"></td>
    <td><input type="number" class="installazione" value="${p.installazione.toFixed(2)}"></td>
    <td class="totale">€0.00</td>
  `;

  updateRow(row);
  attachEvents(row);
}

function attachEvents(row) {
  const inputs = row.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', () => updateRow(row));
  });
}

function updateRow(row) {
  const qty = parseFloat(row.querySelector('.qty').value) || 1;
  const lordo = parseFloat(row.cells[3].textContent.replace('€', '')) || 0;
  let sconto = parseFloat(row.querySelector('.sconto').value) || 0;
  let netto = parseFloat(row.querySelector('.netto').value) || 0;
  const trasporto = parseFloat(row.querySelector('.trasporto').value) || 0;
  const installazione = parseFloat(row.querySelector('.installazione').value) || 0;

  // Sincronizzazione sconto/netto
  const source = document.activeElement.className;
  if (source === 'sconto') {
    netto = lordo - (lordo * sconto / 100);
    row.querySelector('.netto').value = netto.toFixed(2);
  } else if (source === 'netto') {
    sconto = 100 - (netto / lordo * 100);
    row.querySelector('.sconto').value = sconto.toFixed(1);
  }

  const totale = (netto + trasporto + installazione) * qty;
  row.querySelector('.totale').textContent = `€${totale.toFixed(2)}`;
  updateTotali();
}

function updateTotali() {
  let somma = 0;
  document.querySelectorAll('.totale').forEach(td => {
    const val = parseFloat(td.textContent.replace('€', '')) || 0;
    somma += val;
  });
  document.getElementById('totalValue').textContent = `Totale Ordine: €${somma.toFixed(2)}`;
}

// Genera PDF
function generaPDF() {
  const doc = new jsPDF();
  doc.text("Ordine", 10, 10);
  let y = 20;

  document.querySelectorAll('#itemsTable tbody tr').forEach(row => {
    const cols = [...row.cells].map(c => c.innerText).join(' | ');
    doc.text(cols, 10, y);
    y += 10;
  });

  doc.save('ordine.pdf');
}

// Genera TXT
function generaTXT() {
  let txt = "Codice | Descrizione | Q.tà | Prezzo Lordo | Sconto | Netto | Trasp. | Inst. | Totale\n";
  document.querySelectorAll('#itemsTable tbody tr').forEach(row => {
    const cols = [...row.cells].map(c => c.innerText).join(' | ');
    txt += cols + "\n";
  });

  const blob = new Blob([txt], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ordine.txt';
  a.click();
}

// Invio WhatsApp
function inviaWhatsApp() {
  let msg = "Ordine:\n";
  document.querySelectorAll('#itemsTable tbody tr').forEach(row => {
    const cols = [...row.cells].map(c => c.innerText).join(' | ');
    msg += cols + "\n";
  });
  msg += "\n" + document.getElementById('totalValue').textContent;

  const link = `https://wa.me/?text=${encodeURIComponent(msg)}`;
  window.open(link, '_blank');
}
