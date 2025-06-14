from rest_framework import serializers
from .models import Photo

class PhotoSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.ReadOnlyField(source='uploaded_by.username')
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Photo
        fields = ['id', 'image', 'image_url', 'description', 'location', 'uploaded_by', 'uploaded_at', 'content_type', 'object_id']
        read_only_fields = ['uploaded_by', 'uploaded_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return None 