$(document).ready(function() {
  var rowIndex = 1;

      // Функция для поиска товаров по введённому тексту
  $('#itemSearchInput').on('input', function() {
        var search = $(this).val().toLowerCase().trim();
    
        // Скрываем все collapse, которые не содержат совпадений
        $('.list-group-item').each(function() {
          var categoryCollapse = $(this).find('.collapse');
          var hasMatch = false;
    
        $(this).find('.good-item').each(function() {
          var itemName = $(this).data('name').toLowerCase();

            // Проверяем, содержит ли имя товара текст поиска
          if (itemName.includes(search)) {
            hasMatch = true;
            return false; // Выходим из цикла по товарам
          }
        });
      // Показываем или скрываем collapse для категории
      if (hasMatch) {
        categoryCollapse.addClass('show');
      } else {
        categoryCollapse.removeClass('show');
      }
    });
    
    // Если фильтр пустой, сворачиваем все категории
    if (search === '') {
      $('.collapse').removeClass('show');
    }
  });    

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