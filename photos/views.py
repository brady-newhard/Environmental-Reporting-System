from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Photo
from .serializers import PhotoSerializer

# Create your views here.

class PhotoViewSet(viewsets.ModelViewSet):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Photo.objects.all()
        content_type = self.request.query_params.get('content_type', None)
        object_id = self.request.query_params.get('object_id', None)
        
        if content_type:
            queryset = queryset.filter(content_type=content_type)
        if object_id:
            queryset = queryset.filter(object_id=object_id)
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        photos = request.FILES.getlist('photos')
        content_type = request.data.get('content_type', '')
        object_id = request.data.get('object_id')
        location = request.data.get('location', '')
        description = request.data.get('description', '')

        uploaded_photos = []
        for photo in photos:
            photo_data = {
                'image': photo,
                'content_type': content_type,
                'object_id': object_id,
                'location': location,
                'description': description
            }
            serializer = self.get_serializer(data=photo_data)
            if serializer.is_valid():
                serializer.save(uploaded_by=request.user)
                uploaded_photos.append(PhotoSerializer(serializer.instance, context={'request': request}).data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(uploaded_photos, status=status.HTTP_201_CREATED)
