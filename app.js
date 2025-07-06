
let csvData = [];

document.getElementById('csvFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target.result;
    csvData = parseCSV(text);
    populateSearch();
    alert('CSV caricato con successo!');
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

function populateSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.disabled = false;
  searchInput.addEventListener('input', () => {
    const value = searchInput.value.toLowerCase();
    const results = csvData.filter(p =>
      p.codice.toLowerCase().includes(value) ||
      p.descrizione.toLowerCase().includes(value)
    );
    showResults(results);
  });
}

function showResults(results) {
  const output = document.getElementById('ocrResults');
  output.innerHTML = '';
  results.forEach(prod => {
    const div = document.createElement('div');
    const btn = document.createElement('button');
    btn.textContent = '+';
    btn.onclick = () => handleCode(prod.codice);
    div.textContent = `${prod.codice} – ${prod.descrizione} `;
    div.appendChild(btn);
    output.appendChild(div);
  });
}

function handleCode(code) {
  const prodotto = csvData.find(p => p.codice === code);
  const tbody = document.querySelector('#itemsTable tbody');
  if (!prodotto) return;

  const row = tbody.insertRow();
  const lordo = prodotto.prezzoLordo;

  row.innerHTML = `
    <td>${prodotto.codice}</td>
    <td>${prodotto.descrizione}</td>
    <td><input type="number" value="1" class="qty" /></td>
    <td>€${lordo.toFixed(2)}</td>
    <td><input type="number" value="0" class="sconto" /></td>
    <td><input type="number" value="${lordo.toFixed(2)}" class="netto" /></td>
    <td><input type="number" value="${prodotto.trasporto.toFixed(2)}" class="trasporto" /></td>
    <td><input type="number" value="${prodotto.installazione.toFixed(2)}" class="installazione" /></td>
    <td class="totale">€0.00</td>
  `;

  const inputs = row.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', () => recalculateRow(row, lordo));
  });

  recalculateRow(row, lordo);
}

function recalculateRow(row, lordo) {
  const qty = parseFloat(row.querySelector('.qty').value || 0);
  const scontoInput = row.querySelector('.sconto');
  const nettoInput = row.querySelector('.netto');
  const trasporto = parseFloat(row.querySelector('.trasporto').value || 0);
  const installazione = parseFloat(row.querySelector('.installazione').value || 0);

  let sconto = parseFloat(scontoInput.value || 0);
  let netto = parseFloat(nettoInput.value || 0);
  const changedInput = document.activeElement;

  if (changedInput === scontoInput) {
    netto = lordo * (1 - sconto / 100);
    nettoInput.value = netto.toFixed(2);
  } else if (changedInput === nettoInput) {
    sconto = 100 * (1 - netto / lordo);
    scontoInput.value = sconto.toFixed(2);
  }

  const totale = (netto + trasporto + installazione) * qty;
  row.querySelector('.totale').textContent = '€' + totale.toFixed(2);
}
