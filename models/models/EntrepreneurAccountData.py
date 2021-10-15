from .UserAccount import *
from django.db import models





class EntrepreneurAccountData(models.Model):  # yang punya toko/usaha (yang butuh pinjaman)
    account = models.OneToOneField(UserAccount, on_delete=models.CASCADE)

    def __str__(self):
        return f"<Ent {self.account.username}>"




