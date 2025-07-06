
document.getElementById('csvFile').addEventListener('change', function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = function(e) {
    const lines = e.target.result.split('\n');
    const productList = document.getElementById('productList');
    productList.innerHTML = '';
    lines.forEach(line => {
      const [code, description, price] = line.split(',');
      if (code && description) {
        const div = document.createElement('div');
        div.innerHTML = `<span>${code}</span> – <span>${description}</span> <button onclick="addToOrder('${code}', '${description}', ${parseFloat(price || 0)})">[+]</button>`;
        productList.appendChild(div);
      }
    });
  };
  reader.readAsText(file);
});

function addToOrder(code, description, price) {
  const tbody = document.querySelector('#orderTable tbody');
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${code}</td><td>${description}</td>
    <td>1</td><td>€${price.toFixed(2)}</td>
    <td><input type="number" value="0" onchange="updateNet(this)"></td>
    <td><input type="number" value="${price.toFixed(2)}" onchange="updateDiscount(this)"></td>
    <td><input type="number" value="0"></td>
    <td><input type="number" value="0"></td>
    <td>€${price.toFixed(2)}</td>
  `;
  tbody.appendChild(row);
}

function updateNet(input) {
  const row = input.closest('tr');
  const gross = parseFloat(row.cells[3].innerText.replace('€',''));
  const discount = parseFloat(input.value) || 0;
  const netCell = row.cells[5].querySelector('input');
  netCell.value = (gross - (gross * (discount / 100))).toFixed(2);
  updateTotal(row);
}

function updateDiscount(input) {
  const row = input.closest('tr');
  const gross = parseFloat(row.cells[3].innerText.replace('€',''));
  const net = parseFloat(input.value) || 0;
  const discountCell = row.cells[4].querySelector('input');
  discountCell.value = ((1 - net / gross) * 100).toFixed(0);
  updateTotal(row);
}

function updateTotal(row) {
  const net = parseFloat(row.cells[5].querySelector('input').value) || 0;
  const trasp = parseFloat(row.cells[6].querySelector('input').value) || 0;
  const inst = parseFloat(row.cells[7].querySelector('input').value) || 0;
  row.cells[8].innerText = `€${(net + trasp + inst).toFixed(2)}`;
}
