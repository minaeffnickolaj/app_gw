function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Имя точно верное?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');

// Функция для обновления боковой панели с категориями и товарами
function refreshSidebar(categories, goods) {
    var $categoriesList = $('ul.list-group');
    $categoriesList.empty(); // Очищаем текущие элементы списка
    $.each(categories, function(index, category) {
        var $categoryItem = $('<li>', { 'class': 'list-group-item' });
        var $categoryLink = $('<a>', {
            href: '#collapseCategory' + category.id,
            'data-toggle': 'collapse',
            'aria-expanded': 'false',
            'aria-controls': 'collapseCategory' + category.id,
            text: category.category,
        });

        var $goodsList = $('<ul>', {
            'class': 'list-group collapse mt-2',
            id: 'collapseCategory' + category.id
        });

        var filteredGoods = goods.filter(function(good) {
            return good.category_id === category.id;
        });

        console.log("Filtered goods for category", category.id, filteredGoods);

        $.each(filteredGoods, function(index, good) {
            var $goodItem = $('<li>', { 'class': 'list-group-item' });
            var $goodLink = $('<a>', {
                href: '#',
                'class': 'good-item',
                'data-id': good.id,
                'data-name': good.good_name,
                'data-category-id': good.category_id,
                'data-category': category.category,
                'data-cost': good.catalog_cost,
                'data-pv': good.pv_value,
                text: good.good_name
            });
            $goodItem.append($goodLink);
            $goodsList.append($goodItem);
        });

        $categoryItem.append($categoryLink);
        $categoryItem.append($goodsList);
        $categoriesList.append($categoryItem);
    });
}

$(document).ready(function() {
    // Обработчик кликов по элементам списка товаров (в том числе и добавленных динамически)
    $(document).on('click', '.good-item', function(e) {
        e.preventDefault();
        var goodName = $(this).data('name');
        var goodCategory = $(this).data('category');
        var goodCost = $(this).data('cost');
        var goodPv = $(this).data('pv');
        var goodId = $(this).data('id'); // Получаем ID товара
    
        $('#good-name').text(goodName);
        $('#good-category').text(goodCategory);
        $('#good-cost').text(goodCost);
        $('#good-pv').text(goodPv);
    
        // Сохраняем ID товара в кнопках
        $('#edit-button').data('id', goodId);
        $('#delete-button').data('id', goodId);
        $('#delete-button').data('name', goodName); // Сохраняем имя товара для уведомления
    
        $('#good-details').show();
    });

    // Обработчик клика по кнопке Удалить
    $('#delete-button').click(function() {
        var goodId = $(this).data('id');
        var goodName = $(this).data('name'); // Получаем имя товара для уведомления

        if (confirm('Вы уверены, что хотите удалить этот товар?')) {
            $.ajax({
                url: '/delete_good/', // URL для обработки запроса на удаление
                type: 'POST',
                data: {
                    'id': goodId
                },
                headers: {
                    'X-CSRFToken': csrftoken
                },
                success: function(response) {
                    if (response.success) {
                        toastr.success('Товар ' + goodName + ' был удален из базы');
                        $('#good-details').hide();
                        // Удаляем товар из списка на странице, но без загрузки обновленных данных
                        // Нет смысла гонять запросы если работать с базой будет кто-то один
                    $('.good-item[data-id="' + goodId + '"]').parent().remove();
                    } else {
                        toastr.error('Произошла ошибка при удалении товара');
                    }
                }
            });
        }
    });

    // Обработчик клика по кнопке "Редактировать"
    $('#edit-button').click(function() {
        var good_id = $(this).data('id');
        $.ajax({
            url: '/get_good/' + good_id + '/', // Используется правильный шаблон тега url
            type: 'GET',
            headers: {
                'X-CSRFToken': '{{ csrf_token }}'
            },
            success: function(response){
                $('#editName').val(response.good_name);
                $('#editCategory').val(response.category_id);
                $('#editCost').val(response.catalog_cost);
                $('#editPV').val(response.pv_value);
                $('#editGoodId').val(good_id); // Установка значения good_id
                $('#editModal').modal('show');
            },
            error: function(xhr, status, error) {
                toastr.error('Произошла ошибка при получении данных');
            }
        });
    });    

    $('#editForm').submit(function(e) {
        e.preventDefault(); // Предотвращаем стандартное поведение формы

        var formData = $(this).serialize(); // Получаем данные формы в виде строки
        var good_id = $('#editGoodId').val();
        formData += '&good_id=' + good_id;

        $.ajax({
            type: 'POST',
            url: '/update_good/',
            data: formData,
            headers: {
                'X-CSRFToken': csrftoken
            },
            success: function(response) {
                toastr.success(response.message); // Выводим сообщение об успешном обновлении
    
                // Закрываем модальное окно после успешного обновления
                $('#editModal').modal('hide');
                var categories = response.categories;
                var goods = response.goods; 
                refreshSidebar(categories,goods);
                $('#good-details').css('display', 'none');
            },
            error: function(xhr, status, error) {
                toastr.error('Произошла ошибка при обновлении товара');
                console.error(xhr.responseText);
            }
        });
    });

    //каскадное удаление по категории
    $('#delete-category-button').click(function() {
        // Получение списка категорий с сервера
        $.ajax({
            type: 'GET',
            url: '/get_categories/',
            headers: {
                'X-CSRFToken': csrftoken
            },
            success: function(categories) {
                var $categorySelect = $('#categorySelect');
                $categorySelect.empty(); // Очистка текущих опций

                // Добавление опций в выпадающий список
                $.each(categories, function(index, category) {
                    $categorySelect.append($('<option>', {
                        value: category.id,
                        text: category.category
                    }));
                });

                // Отображение модального окна
                $('#deleteCategoryModal').modal('show');
            },
            error: function(xhr, status, error) {
                toastr.error('Произошла ошибка при получении списка категорий');
                console.error(xhr.responseText);
            }
        });
    });

    // Обработчик отправки формы удаления категории
    $('#deleteCategoryForm').submit(function(e) {
        e.preventDefault();

        var confirmed = confirm('Вы уверены, что хотите удалить эту категорию и все связанные товары?');
        if (!confirmed) {
            return;
        }

        var formData = $(this).serialize(); // Получение данных формы

        $.ajax({
            type: 'POST',
            url: '/delete_category/',
            data: formData,
            headers: {
                'X-CSRFToken': csrftoken
            },
            success: function(response) {
                toastr.success(response.message); // Показ сообщения об успешном удалении

                // Закрытие модального окна
                $('#deleteCategoryModal').modal('hide');
                var categories = response.categories;
                var goods = response.goods; 
                refreshSidebar(categories,goods);
                // Обновление списка категорий и товаров на странице
                // Здесь можно повторно вызвать функцию для получения и отображения актуального списка категорий и товаров
            },
            error: function(xhr, status, error) {
                toastr.error('Произошла ошибка при удалении категории');
                console.error(xhr.responseText);
            }
        });
    });

    // Открытие модального окна для добавления товара
    $('#add_good_button').click(function() {
            $.ajax({
            type: 'GET',
            url: '/get_categories/',
            headers: {
                'X-CSRFToken': csrftoken
            },
            success: function(response) {
                var categories = response;
                var $addCategory = $('#addCategory');
                $addCategory.empty();
                $.each(categories, function(index, category) {
                    var $option = $('<option>', {
                        value: category.id,
                        text: category.category
                    });
                    $addCategory.append($option);
                });
            },
            error: function(xhr, status, error) {
                toastr.error('Произошла ошибка при загрузке категорий');
                console.error(xhr.responseText);
            }
        });
        $('#addModal').modal('show');
    });

    $('#addForm').submit(function(e) {
        e.preventDefault(); // Предотвращаем стандартное поведение формы

        var formData = $(this).serialize(); // Получаем данные формы в виде строки

        $.ajax({
            type: 'POST',
            url: '/add_good/',
            data: formData,
            headers: {
                'X-CSRFToken': csrftoken
            },
            success: function(response) {
                toastr.success(response.message); // Выводим сообщение об успешном добавлении

                // Закрываем модальное окно после успешного добавления
                $('#addModal').modal('hide');

                // Обновляем данные о категориях и товарах на странице
                refreshSidebar(response.categories, response.goods);
            },
            error: function(xhr, status, error) {
                toastr.error('Произошла ошибка при добавлении товара');
                console.error(xhr.responseText);
            }
        });
    });

    // Открытие модального окна для добавления категории
    $('#add_category_button').click(function() {
        $('#addCategoryModal').modal('show');
    });

    // Обработчик отправки формы добавления категории
    $('#addCategoryForm').submit(function(e) {
        e.preventDefault(); // Предотвращаем стандартное поведение формы

        var formData = $(this).serialize(); // Получаем данные формы в виде строки

        $.ajax({
            type: 'POST',
            url: '/add_category/',
            data: formData,
            headers: {
                'X-CSRFToken': csrftoken
            },
            success: function(response) {
                toastr.success(response.message); // Выводим сообщение об успешном добавлении

                // Закрываем модальное окно после успешного добавления
                $('#addCategoryModal').modal('hide');

                // Обновляем данные о категориях на странице
                refreshSidebar(response.categories, response.goods);
            },
            error: function(xhr, status, error) {
                toastr.error('Произошла ошибка при добавлении категории');
                console.error(xhr.responseText);
            }
        });
    });

    $('#import_data_button').click(function() {
        $('#uploadExcelModal').modal('show');
    });

    $('#uploadExcelForm').submit(function(e) {
        e.preventDefault(); // Предотвращаем стандартное поведение формы

        var formData = new FormData(this); // Получаем данные формы

        $.ajax({
            type: 'POST',
            url: '/insert_batch/',
            data: formData,
            contentType: false,
            processData: false,
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            },
            success: function(response) {
                toastr.success(response.message); // Выводим сообщение об успешной загрузке

                // Закрываем модальное окно после успешной загрузки
                $('#uploadExcelModal').modal('hide');

                // Обновляем данные о категориях и товарах на странице
                refreshSidebar(response.categories, response.goods);
            },
            error: function(xhr, status, error) {
                toastr.error('Произошла ошибка при загрузке файла');
                console.error(xhr.responseText);
            }
        });
    });            

    $('#export_data_button').click(function() {
        $.ajax({
            url: '/export/',
            type: 'GET',
            xhrFields: {
                responseType: 'blob' // Позволяет получить данные как Blob
            },
            success: function(data, status, xhr) {
                var filename = "";
                var disposition = xhr.getResponseHeader('Content-Disposition');
                if (disposition && disposition.indexOf('attachment') !== -1) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(disposition);
                    if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
                }
                var blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = filename || 'categories_and_goods.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            },
            error: function(xhr, status, error) {
                toastr.error('Произошла ошибка при экспорте данных');
            }
        });
    });
});