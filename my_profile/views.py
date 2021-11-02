from django.shortcuts import render
from models_app.models.UserAccount import UserAccount
from models_app.models.InvestorAccount import InvestorAccount
from models_app.models.EntrepreneurAccount import EntrepreneurAccount
from my_profile.forms import ProfileForm, FormSpesial
from django.http.response import HttpResponseRedirect
from django.core.exceptions import ValidationError

# Create your views here.
class DoesProblemExist():
    def __init__(self):
        pass


class FormErrors():
    def __init__(self, errors):
        dictionary = errors.as_data()
        fields_list =  ['proposal',
                        'nama_merek',
                        'nama_perusahaan',
                        'alamat',
                        'deskripsi',
                        'jumlah_lembar',
                        'nilai_lembar_saham',
                        'kode_saham',
                        'dividen',
                        'end_date',
                        ]

        self.does_problem_exist = DoesProblemExist()

        no_error = (ValidationError("") ,)
        for attr_name in fields_list:
            temp:ValidationError = dictionary.get(attr_name, no_error)[-1]
            setattr(self, attr_name, temp.message)
            setattr(self.does_problem_exist, attr_name, "problem" if (attr_name in dictionary) else "no-problem")
def index(request):
    
    profil = UserAccount.objects.all().first()
    # akun_investor = InvestorAccount.objects.all.values()
    # akun_enterpreneur = EntrepreneurAccount.objects.all.values()
    response = {'profil':profil}
    return render(request, 'tampilan_profil.html', response);

# def ganti_password(request):
#     context ={}
  
#     # create object of form
#     form = PasswordForm(request.POST or None, request.FILES or None)
      
#     # check if form data is valid
#     if form.is_valid():
#         # save the form data to model
#         form.save()
#         return HttpResponseRedirect('form_gantiprofil.html')
  
#     context['form']= form
#     return render(request, 'form_gantipassword.html', context)

def ganti_profil(request):
    # print("asdfgskjhdfs")
    profil = UserAccount.objects.all().first()
    context ={"profil" : profil}
    # create object of form
    form = ProfileForm(request.POST or None, request.FILES or None, instance=profil)
    form_khusus = FormSpesial(request.POST or None, request.FILES or None, instance=profil.user_model)
    # check if form data is valid
    print("jksbdk", request.method, request.POST)
    if request.method == "POST" :
        print("asdsakhsa", form.is_valid(), form_khusus.is_valid())
        print(form.errors, form_khusus.errors)
        if form.is_valid() and form_khusus.is_valid():
            # save the form data to model
            form.save()
            form_khusus.save()
            return HttpResponseRedirect('/my-profile/')
        
            
        
  
    context['form']= form
    # print(profil)
    # print(profil.is_entrepreneur)
    return render(request, 'form_gantiprofil.html', context)