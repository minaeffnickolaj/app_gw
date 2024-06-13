from django.shortcuts import render
<<<<<<< Updated upstream

# Create your views here.
=======
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import Good, Category
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
    
def dashboard(request):
    goods = Good.objects.all()
    categories = Category.objects.all()
    context = {
        'goods': goods,
        'categories': categories,
    }
    return render(request, 'dashboard_index.html', context)