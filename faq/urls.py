from django.urls import path
from . import views

app_name = 'faq'

urlpatterns = [
    path('', views.index, name='index'),
    path('save/', views.save_data, name='save'),
    path('json/', views.faqJson)
]
