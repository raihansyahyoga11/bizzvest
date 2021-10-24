from django.core.validators import RegexValidator

from halaman_toko.authentication_and_authorization import *
from .EntrepreneurAccount import *
from django.utils import timezone
from django.db import models


class Company(models.Model):  # dengan nama lain: Toko
    pemilik_usaha = models.ForeignKey(EntrepreneurAccount, on_delete=models.CASCADE, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    proposal = models.FileField(upload_to="uploads/company_photos/%Y/%m/", null=True)

    nama_merek = models.CharField(max_length=30, verbose_name='Nama merek')
    nama_perusahaan = models.CharField(max_length=35, verbose_name='Nama perusahaan')
    deskripsi = models.TextField(max_length=3000, default="", verbose_name='Deskripsi')


    # tidak terpengaruh oleh saham yg sudah dikumpulkan
    nilai_saham_dibutuhkan_total = models.BigIntegerField(blank=True, editable=False)
    nilai_saham_terkumpulkan_total = models.BigIntegerField(blank=True, editable=False)

    jumlah_lembar = models.BigIntegerField(verbose_name='Jumlah lembar saham')  # jumlah lembar saham yang diperlukan
    nilai_lembar_saham = models.BigIntegerField(verbose_name='Nilai lembar saham')  # nilai saham per lembar

    kode_saham = models.CharField(validators=[RegexValidator(regex='^[A-Z]{4}$', message='Length has to be 4', code='nomatch')],
                                  unique=True, max_length=4)
    dividen = models.IntegerField(verbose_name='Dividen')  # dividen saham dalam satuan bulan
    start_date = models.DateField(default=timezone.now, blank=True)  # waktu dan tanggal perusahaan ini mulai menerima saham
    end_date = models.DateField(verbose_name='Batas waktu')  # waktu dan tanggal perusahaan ini sudah berhenti menerima saham

    def __str__(self):
        return f"<{self.nama_merek} -- {self.nama_perusahaan} -- {self.pemilik_usaha.account.username}>"

    def save(self, *args, **kwargs):
        if (self.pemilik_usaha is None):
            self.pemilik_usaha = get_logged_in_user_account().entrepreneuraccount

        self.nilai_saham_terkumpulkan_total = 0
        self.nilai_saham_dibutuhkan_total = self.nilai_lembar_saham * self.jumlah_lembar
        super().save(*args, **kwargs)


