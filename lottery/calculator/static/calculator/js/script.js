$(document).ready(function() {
  var rowIndex = 1;

  $('.good-item').on('click', function(e) {
    e.preventDefault();
    
    var name = $(this).data('name');
    var cost = parseFloat($(this).data('cost')).toFixed(2); // Преобразуем в число с двумя знаками после запятой
    var pv = parseFloat($(this).data('pv')).toFixed(2); // Преобразуем в число с двумя знаками после запятой

    var newRow = `
      <tr>
        <td>${rowIndex}</td>
        <td>${name}</td>
        <td><input type="text" class="form-control cost-input" value="${cost}"></td>
        <td><input type="checkbox"></td>
        <td class="pv-value">${pv}</td>
        <td><button class="btn btn-danger btn-sm delete-row">Удалить</button></td>
      </tr>
    `;

    $('#totalsRow').before(newRow);
    rowIndex++;
    updateTotals();
  });

  $('#selectedItemsTable').on('click', '.delete-row', function() {
    $(this).closest('tr').remove();
    updateRowNumbers();
    updateTotals();
  });

  $('#selectedItemsTable').on('input', '.cost-input', function() {
    updateTotals();
  });

  //пересчет индексов строк
  function updateRowNumbers() {
    $('#selectedItemsTable tbody tr:not(#totalsRow)').each(function(index) {
      $(this).find('td:first').text(index + 1);
    });
  }

  //пересчет итогов
  function updateTotals() {
    var totalCost = 0;
    var totalPV = 0;
    
    $('#selectedItemsTable tbody tr:not(#totalsRow)').each(function() {
      var cost = parseFloat($(this).find('.cost-input').val()) || 0;
      var pv = parseFloat($(this).find('.pv-value').text()) || 0;
      totalCost += cost;
      totalPV += pv;
    });

    $('#totalCost').text(totalCost.toFixed(2));
    $('#totalPV').text(totalPV.toFixed(2));
  }
});