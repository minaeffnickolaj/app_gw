from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
from .models import Good, Category

# Create your views here.
def dashboard(request):
    goods = Good.objects.all()
    categories = Category.objects.all()
    context = {
        'goods': goods,
        'categories': categories,
    }
    return render(request, 'dashboard_index.html', context)

@require_POST
def delete_good(request):
    good_id = request.POST.get('id')
    try:
        good = Good.objects.get(id=good_id)
        good.delete()
        return JsonResponse({'success': True})
    except Good.DoesNotExist:
        return JsonResponse({'success': False})
    
@require_GET   
def get_good_details(request, good_id):
    try:
        good = get_object_or_404(Good, id=good_id)
        data = {
            'good_name': good.good_name,
            'category_id': good.category_id,
            'catalog_cost': good.catalog_cost,
            'pv_value': good.pv_value
        }
        return JsonResponse(data)
    except Http404:
        return JsonResponse({'error': 'Good not found'}, status=404)

@require_POST
def update_good(request):
    if request.method == 'POST':
        good_id = request.POST.get('good_id')
        good = get_object_or_404(Good, pk=good_id)  
        
        good.good_name = request.POST.get('editName')
        category_id = request.POST.get('editCategory')
        # ссылаемся на объект
        category = get_object_or_404(Category, pk=category_id)
        good.category = category
        good.catalog_cost = request.POST.get('editCost')
        good.pv_value = request.POST.get('editPV')
        
        # Сохраняем обновленный товар
        good.save()

        #Возвращаем дату для перерисовки фронта
        updated_good = Good.objects.get(pk=good_id)
        categories = Category.objects.all()
        goods = Good.objects.all()

        response_data = {
            'message': 'Товар успешно обновлен',
            'updated_good':{
                'good_name': updated_good.good_name,
                'category_id': updated_good.category.id,
                'catalog_cost': updated_good.catalog_cost,
                'pv_value': updated_good.pv_value,
            },
            'categories':list(categories.values('id','category')),
            'goods':list(goods.values('id','category_id','good_name','catalog_cost','pv_value'))
        }
        
        return JsonResponse(response_data, status=200)
    
    return JsonResponse({'error': 'Метод не разрешен'}, status=405)

def get_categories(request):
    if request.method == 'GET':
        categories = Category.objects.all()
        categories_list = list(categories.values('id', 'category'))
        return JsonResponse(categories_list, safe=False)
    return JsonResponse({'error': 'Метод не разрешен'}, status=405)

@require_POST
def delete_category(request):
    category_id = request.POST.get('category_id')
    if category_id:
        category = get_object_or_404(Category, pk=category_id)
        push_category_name = category.category
        category.delete()

        categories = Category.objects.all()
        goods = Good.objects.all()

        response_data = {
        'message': 'Категория ' + push_category_name +  ' удалена',
        'categories':list(categories.values('id','category')),
        'goods':list(goods.values('id','category_id','good_name','catalog_cost','pv_value'))
        }
        return JsonResponse(response_data, status=200)
    return JsonResponse({'error': 'ID категории не предоставлен'}, status=400)

@require_POST
def add_good(request):
    good_name = request.POST.get('good_name')
    category_id = request.POST.get('category_id')
    catalog_cost = request.POST.get('catalog_cost')
    pv_value = request.POST.get('pv_value')

    category = get_object_or_404(Category, pk=category_id)
    
    good = Good.objects.create(
        good_name=good_name,
        category=category,
        catalog_cost=catalog_cost,
        pv_value=pv_value
    )
    good.save()
    categories = Category.objects.all()
    goods = Good.objects.all()

    response_data = {
        'message': 'Товар \"' + good_name + '\" успешно добавлен',
        'categories': list(categories.values('id', 'category')),
        'goods': list(goods.values('id', 'category_id', 'good_name', 'catalog_cost', 'pv_value'))
    }

    return JsonResponse(response_data, status=200)