from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
from .models import Good, Category
from .forms import GoodForm

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