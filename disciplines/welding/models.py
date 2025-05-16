from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class DailyWeldReport(models.Model):
    date = models.DateField()
    inspector = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weld_reports')
    project = models.CharField(max_length=255, null=True, blank=True)
    contractor = models.CharField(max_length=255, null=True, blank=True)
    construction_wbs = models.CharField(max_length=255, blank=True)
    retirement_wbs = models.CharField(max_length=255, blank=True)
    activity = models.TextField(blank=True)
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    welders_onsite = models.IntegerField(null=True, blank=True)
    location = models.CharField(max_length=255)
    weather_conditions = models.CharField(max_length=255)
    temperature = models.DecimalField(max_digits=5, decimal_places=2)
    humidity = models.DecimalField(max_digits=5, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    finalized = models.BooleanField(default=False)

    # Welds tracking
    welds_fab_to_date = models.IntegerField(default=0)
    welds_fab_today = models.IntegerField(default=0)
    welds_fab_total = models.IntegerField(default=0)
    welds_onsite_to_date = models.IntegerField(default=0)
    welds_onsite_today = models.IntegerField(default=0)
    welds_onsite_total = models.IntegerField(default=0)
    welds_tiein_to_date = models.IntegerField(default=0)
    welds_tiein_today = models.IntegerField(default=0)
    welds_tiein_total = models.IntegerField(default=0)
    welds_test_to_date = models.IntegerField(default=0)
    welds_test_today = models.IntegerField(default=0)
    welds_test_total = models.IntegerField(default=0)

    # X-Ray tracking
    xray_fab_to_date = models.IntegerField(default=0)
    xray_fab_today = models.IntegerField(default=0)
    xray_fab_total = models.IntegerField(default=0)
    xray_onsite_to_date = models.IntegerField(default=0)
    xray_onsite_today = models.IntegerField(default=0)
    xray_onsite_total = models.IntegerField(default=0)
    xray_tiein_to_date = models.IntegerField(default=0)
    xray_tiein_today = models.IntegerField(default=0)
    xray_tiein_total = models.IntegerField(default=0)
    xray_test_to_date = models.IntegerField(default=0)
    xray_test_today = models.IntegerField(default=0)
    xray_test_total = models.IntegerField(default=0)

    # Welds Rejected/Repaired tracking
    welds_rejected_fab_repaired = models.IntegerField(default=0)
    welds_rejected_fab_rejected = models.IntegerField(default=0)
    welds_rejected_fab_total = models.IntegerField(default=0)
    welds_rejected_onsite_repaired = models.IntegerField(default=0)
    welds_rejected_onsite_rejected = models.IntegerField(default=0)
    welds_rejected_onsite_total = models.IntegerField(default=0)
    welds_rejected_tiein_repaired = models.IntegerField(default=0)
    welds_rejected_tiein_rejected = models.IntegerField(default=0)
    welds_rejected_tiein_total = models.IntegerField(default=0)
    welds_rejected_test_repaired = models.IntegerField(default=0)
    welds_rejected_test_rejected = models.IntegerField(default=0)
    welds_rejected_test_total = models.IntegerField(default=0)

    # X-Ray Rejected/Repaired tracking
    xray_repair_fab_repaired = models.IntegerField(default=0)
    xray_repair_fab_rejected = models.IntegerField(default=0)
    xray_repair_fab_total = models.IntegerField(default=0)
    xray_repair_onsite_repaired = models.IntegerField(default=0)
    xray_repair_onsite_rejected = models.IntegerField(default=0)
    xray_repair_onsite_total = models.IntegerField(default=0)
    xray_repair_tiein_repaired = models.IntegerField(default=0)
    xray_repair_tiein_rejected = models.IntegerField(default=0)
    xray_repair_tiein_total = models.IntegerField(default=0)
    xray_repair_test_repaired = models.IntegerField(default=0)
    xray_repair_test_rejected = models.IntegerField(default=0)
    xray_repair_test_total = models.IntegerField(default=0)

    # Installations
    pipe_installed_size = models.CharField(max_length=50, blank=True)
    pipe_installed_footage = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    pipe_installed_from = models.CharField(max_length=255, blank=True)
    pipe_installed_to = models.CharField(max_length=255, blank=True)

    road_xing_size = models.CharField(max_length=50, blank=True)
    road_xing_footage = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    road_xing_bore = models.BooleanField(default=False)

    stream_xings_size = models.CharField(max_length=50, blank=True)
    stream_xings_footage = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stream_xings_from = models.CharField(max_length=255, blank=True)
    stream_xings_to = models.CharField(max_length=255, blank=True)

    taps_installed_size = models.CharField(max_length=50, blank=True)
    taps_installed_no = models.IntegerField(null=True, blank=True)

    block_gates_size = models.CharField(max_length=50, blank=True)
    block_gates_no = models.IntegerField(null=True, blank=True)

    cut_out1_size = models.CharField(max_length=50, blank=True)
    cut_out1_defect = models.CharField(max_length=255, blank=True)
    cut_out2_size = models.CharField(max_length=50, blank=True)
    cut_out2_defect = models.CharField(max_length=255, blank=True)

    # Signatures
    welding_inspector_name = models.CharField(max_length=255, null=True, blank=True)
    welding_inspector_signature = models.TextField(blank=True)
    contractor_signature = models.TextField(blank=True)
    supervisor_signature = models.TextField(blank=True)

    class Meta:
        ordering = ['-date', '-created_at']
        verbose_name = 'Daily Weld Report'
        verbose_name_plural = 'Daily Weld Reports'
        app_label = 'disciplines.welding'

    def __str__(self):
        return f"Weld Report - {self.date} - {self.project}"

class WeldInspection(models.Model):
    WELD_TYPE_CHOICES = [
        ('BUTT', 'Butt Weld'),
        ('FILLET', 'Fillet Weld'),
        ('PLUG', 'Plug Weld'),
        ('SLOT', 'Slot Weld'),
    ]

    POSITION_CHOICES = [
        ('FLAT', 'Flat'),
        ('HORIZONTAL', 'Horizontal'),
        ('VERTICAL', 'Vertical'),
        ('OVERHEAD', 'Overhead'),
    ]

    report = models.ForeignKey(DailyWeldReport, on_delete=models.CASCADE, related_name='inspections')
    weld_number = models.CharField(max_length=50)
    weld_type = models.CharField(max_length=10, choices=WELD_TYPE_CHOICES)
    position = models.CharField(max_length=10, choices=POSITION_CHOICES)
    joint_type = models.CharField(max_length=100)
    material_type = models.CharField(max_length=100)
    thickness = models.DecimalField(max_digits=5, decimal_places=2)
    length = models.DecimalField(max_digits=8, decimal_places=2)
    preheat_temp = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    interpass_temp = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    post_weld_temp = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    visual_inspection = models.BooleanField(default=False)
    ndt_performed = models.BooleanField(default=False)
    ndt_method = models.CharField(max_length=100, blank=True)
    ndt_results = models.TextField(blank=True)
    defects_found = models.BooleanField(default=False)
    defect_description = models.TextField(blank=True)
    corrective_action = models.TextField(blank=True)
    passed = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['weld_number']
        verbose_name = 'Weld Inspection'
        verbose_name_plural = 'Weld Inspections'
        app_label = 'disciplines.welding'

    def __str__(self):
        return f"Weld {self.weld_number} - {self.get_weld_type_display()}"

class WeldPhoto(models.Model):
    inspection = models.ForeignKey(WeldInspection, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='weld_photos/')
    description = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = 'Weld Photo'
        verbose_name_plural = 'Weld Photos'
        app_label = 'disciplines.welding'

    def __str__(self):
        return f"Photo for Weld {self.inspection.weld_number} - {self.uploaded_at}"
