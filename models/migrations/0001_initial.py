# Generated by Django 3.2.8 on 2021-10-17 08:45

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nama_merek', models.CharField(max_length=30)),
                ('nama_perusahaan', models.CharField(max_length=35)),
                ('deskripsi', models.TextField(default='', max_length=3000)),
                ('nilai_saham_dibutuhkan_total', models.BigIntegerField(blank=True, editable=False)),
                ('nilai_saham_terkumpulkan_total', models.BigIntegerField(blank=True, editable=False)),
                ('nilai_lembar_saham', models.BigIntegerField()),
                ('jumlah_lembar', models.BigIntegerField()),
                ('dividen', models.IntegerField()),
                ('start_date', models.DateField(default=django.utils.timezone.now)),
                ('end_date', models.DateField()),
            ],
        ),
        migrations.CreateModel(
            name='InvestorAccountData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.CreateModel(
            name='UserAccount',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('username', models.CharField(db_index=True, max_length=24, null=True, unique=True)),
                ('email', models.EmailField(max_length=254, null=True, unique=True)),
                ('photo_profile', models.ImageField(null=True, upload_to='uploads/user_profile/%Y/%m/')),
                ('first_name', models.CharField(max_length=20)),
                ('last_name', models.CharField(max_length=20)),
                ('join_date', models.DateField(default=django.utils.timezone.now)),
                ('last_login', models.DateTimeField(default=django.utils.timezone.now)),
            ],
        ),
        migrations.CreateModel(
            name='Stock',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('jumlah_lembar_saham', models.BigIntegerField()),
                ('tanggal_ditanam', models.DateField(auto_now_add=True)),
                ('tanggal_berakhir', models.DateField()),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='models.company')),
                ('holder', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='models.investoraccountdata')),
            ],
        ),
        migrations.AddField(
            model_name='investoraccountdata',
            name='account',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='models.useraccount'),
        ),
        migrations.CreateModel(
            name='EntrepreneurAccountData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('account', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='models.useraccount')),
            ],
        ),
        migrations.CreateModel(
            name='CompanyPhoto',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('img', models.ImageField(upload_to='uploads/company_photos/%Y/%m/')),
                ('img_index', models.IntegerField()),
                ('alt', models.CharField(blank=True, default='', max_length=50)),
                ('caption', models.CharField(blank=True, default='', max_length=50)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='models.company')),
            ],
        ),
        migrations.AddField(
            model_name='company',
            name='pemilik_usaha',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='models.entrepreneuraccountdata'),
        ),
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('post_time', models.DateTimeField(auto_now_add=True)),
                ('message', models.CharField(max_length=500)),
                ('commenter', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='models.useraccount')),
                ('post_target', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='models.company')),
            ],
        ),
    ]
