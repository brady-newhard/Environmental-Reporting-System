from django.db import models
from django.contrib.auth.models import User

class DailyCoatingReport(models.Model):
    date = models.DateField()
    inspector = models.ForeignKey(User, on_delete=models.CASCADE)
    contractor = models.CharField(max_length=255, null=True, blank=True)
    report_number = models.CharField(max_length=50, null=True, blank=True)
    oq_personnel = models.CharField(max_length=255, null=True, blank=True)
    facility_id = models.CharField(max_length=255, null=True, blank=True)
    purchase_order = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255)
    qa_inspector = models.CharField(max_length=255, null=True, blank=True)
    weather_conditions = models.CharField(max_length=255)
    temperature = models.DecimalField(max_digits=5, decimal_places=2)
    humidity = models.DecimalField(max_digits=5, decimal_places=2)
    notes = models.TextField(blank=True)
    finalized = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        verbose_name = 'Daily Coating Report'
        verbose_name_plural = 'Daily Coating Reports'
        app_label = 'disciplines.coating'

    def __str__(self):
        return f"Coating Report - {self.date} - {self.location}"

class CoatingInspection(models.Model):
    SURFACE_TYPE_CHOICES = [
        ('steel', 'Steel'),
        ('concrete', 'Concrete'),
        ('wood', 'Wood'),
        ('other', 'Other'),
    ]

    COATING_TYPE_CHOICES = [
        ('epoxy', 'Epoxy'),
        ('polyurethane', 'Polyurethane'),
        ('zinc', 'Zinc'),
        ('other', 'Other'),
    ]

    report = models.ForeignKey(DailyCoatingReport, on_delete=models.CASCADE, related_name='inspections')
    surface_type = models.CharField(max_length=50, choices=SURFACE_TYPE_CHOICES)
    coating_type = models.CharField(max_length=50, choices=COATING_TYPE_CHOICES)
    surface_area = models.DecimalField(max_digits=10, decimal_places=2)
    surface_preparation = models.TextField()
    coating_thickness = models.DecimalField(max_digits=5, decimal_places=2)
    temperature = models.DecimalField(max_digits=5, decimal_places=2)
    humidity = models.DecimalField(max_digits=5, decimal_places=2)
    visual_inspection = models.BooleanField(default=False)
    adhesion_test = models.BooleanField(default=False)
    adhesion_test_results = models.TextField(blank=True)
    defects_found = models.BooleanField(default=False)
    defect_description = models.TextField(blank=True)
    corrective_action = models.TextField(blank=True)
    passed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Additional fields from the form
    application_method = models.CharField(max_length=50, blank=True)  # Spray/Brush
    application_time_begin = models.TimeField(null=True, blank=True)
    application_time_end = models.TimeField(null=True, blank=True)
    wft_mils = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    mix_number = models.CharField(max_length=50, blank=True)
    comp_a_batch = models.CharField(max_length=50, blank=True)
    comp_b_batch = models.CharField(max_length=50, blank=True)
    mix_time = models.TimeField(null=True, blank=True)
    act_induct_time = models.TimeField(null=True, blank=True)
    pot_life = models.IntegerField(null=True, blank=True)  # in minutes
    quantity_used = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    witnessed = models.BooleanField(default=False)
    backfill_used = models.BooleanField(default=False)
    rock_shield_used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Coating Inspection'
        verbose_name_plural = 'Coating Inspections'
        app_label = 'disciplines.coating'

    def __str__(self):
        return f"Coating Inspection - {self.surface_type} - {self.coating_type}"

class CoatingPhoto(models.Model):
    inspection = models.ForeignKey(CoatingInspection, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='coating_photos/')
    description = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Coating Photo'
        verbose_name_plural = 'Coating Photos'
        app_label = 'disciplines.coating'

    def __str__(self):
        return f"Photo - {self.inspection} - {self.uploaded_at}"

class CoatingOversightItem(models.Model):
    STATUS_CHOICES = [
        ('yes', 'Yes'),
        ('no', 'No'),
        ('na', 'N/A'),
    ]

    report = models.ForeignKey(DailyCoatingReport, on_delete=models.CASCADE, related_name='oversight_items')
    item_number = models.IntegerField()
    description = models.CharField(max_length=255)
    status = models.CharField(max_length=3, choices=STATUS_CHOICES)
    comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['item_number']
        verbose_name = 'Coating Oversight Item'
        verbose_name_plural = 'Coating Oversight Items'
        app_label = 'disciplines.coating'

    def __str__(self):
        return f"Item {self.item_number} - {self.description}"
