"""
URL configuration for lottery project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from dashboard import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('dashboard/', views.dashboard),
    path('delete_good/', views.delete_good, name='delete_good'),
    path('get_good/<int:good_id>/', views.get_good_details, name='get_good'),
    path('update_good/', views.update_good, name="update_good"),
    path('get_categories/', views.get_categories, name='get_categories'),
    path('delete_category/', views.delete_category, name='delete_category'),
]