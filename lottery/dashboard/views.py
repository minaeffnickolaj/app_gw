from django.shortcuts import render
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