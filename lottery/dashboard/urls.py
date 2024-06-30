from django.urls import path
from django.contrib.auth import views as auth_views
from .import views

urlpatterns = [
    path('', views.dashboard),
    path('delete_good/', views.delete_good, name='delete_good'),
    path('get_good/<int:good_id>/', views.get_good_details, name='get_good'),
    path('update_good/', views.update_good, name="update_good"),
    path('get_categories/', views.get_categories, name='get_categories'),
    path('delete_category/', views.delete_category, name='delete_category'),
    path('add_good/', views.add_good, name="add_good"),
    path('add_category/', views.add_category, name='add_category'),
    path('insert_batch/', views.upload_excel, name="upload_excel"),
    path('export/', views.export_excel, name='export_to_excel'),
    path('update_template/', views.update_template, name='update_template')
]