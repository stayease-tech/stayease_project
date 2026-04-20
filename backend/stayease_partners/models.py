from django.db import models
from django.utils import timezone
from stayease_supply.models import Owner_Data

class YearlyDeductionSummary(models.Model):
    owner = models.ForeignKey(Owner_Data, on_delete=models.CASCADE)
    year = models.PositiveSmallIntegerField()
    monthly_values = models.JSONField(default=list)
    cumulative_total = models.FloatField(default=0)
    last_updated = models.DateField(auto_now=True)

    def update_deductions(self, monthly_rent_after_deductions):
        current_date = timezone.now()
        
        if current_date.year != self.year or current_date.month == 7:
            self.year = current_date.year
            self.monthly_values = [monthly_rent_after_deductions]
            self.cumulative_total = monthly_rent_after_deductions
        else:
            if len(self.monthly_values) < current_date.month:
                self.monthly_values.append(monthly_rent_after_deductions)
                self.cumulative_total += monthly_rent_after_deductions
        
        self.save()
        return self.cumulative_total

    class Meta:
        unique_together = ('owner', 'year')