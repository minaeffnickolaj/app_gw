from django.db import models

class Category(models.Model):
    id = models.AutoField(primary_key=True)
    category = models.CharField(max_length=100)

    def _str_(self):
        return self.category
    
class Good(models.Model):
    id = models.AutoField(primary_key=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    good_name = models.CharField(max_length=100)
    catalog_cost = models.DecimalField(max_digits=6, decimal_places=2)
    pv_value = models.DecimalField(max_digits=6, decimal_places=2)

    def _str_(self):
        return self.good_name
    
class TemplateFinalText(models.Model):
    name = models.CharField(max_length=100, unique=True)
    text = models.TextField()

    def __str__(self):
        return self.name