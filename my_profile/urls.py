from django.urls import path
from .views import ganti_foto, index, ganti_profil, my_profile_API, my_profile_json, foto_API

urlpatterns = [
    path('', index, name='index'),
    path('ganti-profil', ganti_profil, name='ganti_profil'),
    path('upload-foto', ganti_foto, name='ganti_foto'),
    path('my-profile-json',my_profile_json, name='my_profile_json'),
    path('my-profile-api', my_profile_API, name='my_profile_API'),
    path('foto-api', foto_API, name='foto_API')

]
