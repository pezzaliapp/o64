let csvData = [];

document.getElementById('csvFile').addEventListener('change', (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function (event) {
    const text = event.target.result;
    csvData = parseCSV(text);
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

function handleCode(code) {
  const prodotto = csvData.find(p => p.codice === code);
  const tbody = document.querySelector('#itemsTable tbody');

  if (prodotto) {
    const row = tbody.insertRow();
    const qty = 1;
    const sconto = 0;
    const netto = prodotto.prezzoLordo;
    const totale = (netto + prodotto.trasporto + prodotto.installazione) * qty;

    row.innerHTML = `
      <td>${prodotto.codice}</td>
      <td>${prodotto.descrizione}</td>
      <td><input type="number" value="${qty}" onchange="aggiornaTotale(this)"></td>
      <td>€${prodotto.prezzoLordo.toFixed(2)}</td>
      <td><input type="number" value="${sconto}" onchange="aggiornaTotale(this)">%</td>
      <td><input type="number" value="${netto.toFixed(2)}" onchange="aggiornaTotale(this)"></td>
      <td><input type="number" value="${prodotto.trasporto}" onchange="aggiornaTotale(this)"></td>
      <td><input type="number" value="${prodotto.installazione}" onchange="aggiornaTotale(this)"></td>
      <td class="totale-cell">€${totale.toFixed(2)}</td>
    `;
  } else {
    alert('Codice non trovato nel CSV: ' + code);
  }
}

function aggiornaTotale(input) {
  const row = input.closest('tr');
  const qty = parseFloat(row.cells[2].querySelector('input').value) || 0;
  const lordo = parseFloat(row.cells[3].textContent.replace('€', '')) || 0;
  const sconto = parseFloat(row.cells[4].querySelector('input').value) || 0;
  const netto = parseFloat(row.cells[5].querySelector('input').value) || 0;
  const trasp = parseFloat(row.cells[6].querySelector('input').value) || 0;
  const inst = parseFloat(row.cells[7].querySelector('input').value) || 0;

  const totale = ((netto || lordo) + trasp + inst) * qty * (1 - sconto / 100);
  row.querySelector('.totale-cell').textContent = `€${totale.toFixed(2)}`;
}

document.getElementById('cameraInput').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);
  img.onload = async () => {
    const canvas = document.getElementById('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const result = await Tesseract.recognize(canvas, 'eng');
    const text = result.data.text.trim();
    const words = Array.from(new Set(text.split(/\s+|\n+/).map(w => w.trim()).filter(w => w.length > 2)));
    showOCRResults(words);
  };
});

function showOCRResults(words) {
  const output = document.getElementById('ocrResults');
  output.innerHTML = '<h3>Testi rilevati:</h3>';
  words.forEach(word => {
    const div = document.createElement('div');
    const btn = document.createElement('button');
    btn.textContent = '+';
    btn.onclick = () => handleCode(word);
    div.textContent = word + ' ';
    div.appendChild(btn);
    output.appendChild(div);
  });
}
