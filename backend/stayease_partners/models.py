from django.db import models
from django.utils import timezone
from stayease_supply.models import Owner_Data

class YearlyDeductionSummary(models.Model):
    """Tracks cumulative rent-after-deductions totals for an owner on a per-year basis.

    Maintains a monthly breakdown list and a running cumulative total, reset each fiscal year.
    """
    owner = models.ForeignKey(Owner_Data, on_delete=models.CASCADE)
    year = models.PositiveSmallIntegerField()
    monthly_values = models.JSONField(default=list)
    cumulative_total = models.FloatField(default=0)
    last_updated = models.DateField(auto_now=True)

    def update_deductions(self, monthly_rent_after_deductions):
        """Append a monthly net-rent value to the summary, resetting at year or July boundary.

        Args:
            monthly_rent_after_deductions: Net rent amount for the current month.

        Returns:
            float: Updated cumulative total after appending the new value.
        """
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