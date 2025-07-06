let csvData = [];

// Caricamento CSV
const csvInput = document.getElementById('csvFile');
csvInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target.result;
    csvData = parseCSV(text);
    alert('✅ CSV caricato con successo!');
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

// Ricerca dinamica
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

searchInput.addEventListener('input', () => {
  const term = searchInput.value.toLowerCase();
  searchResults.innerHTML = '';
  if (term.length < 2) return;
  const results = csvData.filter(p => p.codice.toLowerCase().includes(term) || p.descrizione.toLowerCase().includes(term));
  results.forEach(product => {
    const btn = document.createElement('button');
    btn.textContent = `${product.codice} - ${product.descrizione}`;
    btn.onclick = () => addProductToTable(product);
    searchResults.appendChild(btn);
  });
});

// Inserimento prodotto in tabella
function addProductToTable(product) {
  const tbody = document.querySelector('#itemsTable tbody');
  const row = tbody.insertRow();

  const qty = 1;
  const sconto = 0;
  const netto = product.prezzoLordo;
  const totale = calculateTotal(netto, product.trasporto, product.installazione, qty);

  row.innerHTML = `
    <td>${product.codice}</td>
    <td>${product.descrizione}</td>
    <td><input type="number" value="${qty}" onchange="updateRow(this)"></td>
    <td>€${product.prezzoLordo.toFixed(2)}</td>
    <td><input type="number" value="${sconto}" onchange="updateRow(this)"></td>
    <td><input type="number" value="${netto.toFixed(2)}" onchange="updateRow(this)"></td>
    <td><input type="number" value="${product.trasporto.toFixed(2)}" onchange="updateRow(this)"></td>
    <td><input type="number" value="${product.installazione.toFixed(2)}" onchange="updateRow(this)"></td>
    <td class="totale">€${totale.toFixed(2)}</td>
  `;
}

function calculateTotal(netto, trasporto, installazione, qty) {
  return (netto + trasporto + installazione) * qty;
}

// Aggiornamento riga tabella dinamico
function updateRow(input) {
  const row = input.closest('tr');
  const qty = parseFloat(row.cells[2].querySelector('input').value) || 0;
  const sconto = parseFloat(row.cells[4].querySelector('input').value) || 0;
  let netto = parseFloat(row.cells[5].querySelector('input').value) || 0;
  const trasporto = parseFloat(row.cells[6].querySelector('input').value) || 0;
  const installazione = parseFloat(row.cells[7].querySelector('input').value) || 0;

  // Se modifico sconto, aggiorno netto
  const lordo = parseFloat(row.cells[3].textContent.replace('€', ''));
  if (input === row.cells[4].querySelector('input')) {
    netto = lordo - (lordo * sconto / 100);
    row.cells[5].querySelector('input').value = netto.toFixed(2);
  }
  // Se modifico netto, aggiorno sconto
  else if (input === row.cells[5].querySelector('input')) {
    const nuovoSconto = lordo > 0 ? (1 - netto / lordo) * 100 : 0;
    row.cells[4].querySelector('input').value = nuovoSconto.toFixed(2);
  }

  const totale = calculateTotal(netto, trasporto, installazione, qty);
  row.querySelector('.totale').textContent = `€${totale.toFixed(2)}`;
}

// Genera TXT
function generateTXT() {
  const rows = document.querySelectorAll('#itemsTable tbody tr');
  let txt = 'Codice\tDescrizione\tQuantità\tNetto\tTrasporto\tInstallazione\tTotale\n';
  rows.forEach(r => {
    const data = [...r.querySelectorAll('td')].map(td => td.innerText.trim());
    txt += data.join('\t') + '\n';
  });
  downloadFile(txt, 'ordine.txt', 'text/plain');
}

// Genera PDF semplificato (solo testo)
function generatePDF() {
  const rows = document.querySelectorAll('#itemsTable tbody tr');
  let content = 'Scheda Ordine\n\n';
  rows.forEach(r => {
    const data = [...r.querySelectorAll('td')].map(td => td.innerText.trim());
    content += data.join(' | ') + '\n';
  });
  const blob = new Blob([content], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  window.open(url);
}

// WhatsApp
function shareWhatsApp() {
  const rows = document.querySelectorAll('#itemsTable tbody tr');
  let message = 'Scheda Ordine%0A';
  rows.forEach(r => {
    const data = [...r.querySelectorAll('td')].map(td => td.innerText.trim());
    message += data.join(' | ') + '%0A';
  });
  window.open(`https://wa.me/?text=${message}`);
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
