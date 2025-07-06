
let csvData = [];

document.getElementById('csvFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    const text = event.target.result;
    csvData = parseCSV(text);
    renderProductList(csvData);
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

function renderProductList(data) {
  const container = document.getElementById('productList');
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  container.innerHTML = '';
  data.filter(p => p.codice.toLowerCase().includes(searchTerm) || p.descrizione.toLowerCase().includes(searchTerm))
      .forEach(p => {
        const div = document.createElement('div');
        div.innerHTML = `<code>${p.codice}</code> — ${p.descrizione} <button onclick='addToTable("${p.codice}")'>+</button>`;
        container.appendChild(div);
      });
}

document.getElementById('searchInput').addEventListener('input', () => renderProductList(csvData));

function addToTable(code) {
  const prodotto = csvData.find(p => p.codice === code);
  const tbody = document.querySelector('#itemsTable tbody');
  if (!prodotto) return;

  const row = tbody.insertRow();
  row.innerHTML = `
    <td>${prodotto.codice}</td>
    <td>${prodotto.descrizione}</td>
    <td><input type="number" value="1" onchange="recalculate(this)"/></td>
    <td>€${prodotto.prezzoLordo.toFixed(2)}</td>
    <td><input type="number" value="0" onchange="recalculate(this)"/>%</td>
    <td><input type="number" value="${prodotto.prezzoLordo.toFixed(2)}" onchange="recalculate(this)"/></td>
    <td><input type="number" value="${prodotto.trasporto.toFixed(2)}" onchange="recalculate(this)"/></td>
    <td><input type="number" value="${prodotto.installazione.toFixed(2)}" onchange="recalculate(this)"/></td>
    <td class="totale">€0.00</td>
  `;
  recalculate(row.querySelector('input'));
}

function recalculate(input) {
  const row = input.closest('tr');
  const qty = parseFloat(row.cells[2].querySelector('input').value || 0);
  const sconto = parseFloat(row.cells[4].querySelector('input').value || 0);
  const netto = parseFloat(row.cells[5].querySelector('input').value || 0);
  const trasporto = parseFloat(row.cells[6].querySelector('input').value || 0);
  const installazione = parseFloat(row.cells[7].querySelector('input').value || 0);
  const prezzoScontato = netto * (1 - sconto / 100);
  const totale = (prezzoScontato + trasporto + installazione) * qty;
  row.querySelector('.totale').textContent = '€' + totale.toFixed(2);
}
