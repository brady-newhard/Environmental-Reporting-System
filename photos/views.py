from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Photo
from .serializers import PhotoSerializer
import logging

logger = logging.getLogger(__name__)

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
        logger.info(f"Creating photo for user: {self.request.user.username}")
        serializer.save(uploaded_by=self.request.user)

    @action(detail=False, methods=['get'])
    def health_check(self, request):
        """Simple health check endpoint"""
        return Response({
            'status': 'healthy',
            'user': request.user.username if request.user.is_authenticated else 'anonymous',
            'message': 'Photo API is working'
        })

    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        logger.info(f"Bulk upload request from user: {request.user.username}")
        logger.info(f"Request data: {request.data}")
        logger.info(f"Request files: {request.FILES}")
        
        try:
            photos = request.FILES.getlist('photos')
            content_type = request.data.get('content_type', '')
            object_id = request.data.get('object_id')
            location = request.data.get('location', '')
            description = request.data.get('description', '')

            logger.info(f"Processing {len(photos)} photos for content_type: {content_type}, object_id: {object_id}")

            uploaded_photos = []
            for i, photo in enumerate(photos):
                logger.info(f"Processing photo {i+1}/{len(photos)}: {photo.name}")
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
                    logger.info(f"Successfully uploaded photo {i+1}")
                else:
                    logger.error(f"Invalid photo data for photo {i+1}: {serializer.errors}")
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            logger.info(f"Successfully uploaded {len(uploaded_photos)} photos")
            return Response(uploaded_photos, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error in bulk_upload: {str(e)}")
            return Response(
                {'error': f'Upload failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
