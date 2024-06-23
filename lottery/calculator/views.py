from django.shortcuts import render
from dashboard.models import Good,Category
# Create your views here.

def calculator(request, context):
    goods = Good.objects.all()
    categories = Category.objects.all()
    context = {
        'goods': goods,
        'categories': categories,
    }
    return render(request, 'calculator_index.html', context)