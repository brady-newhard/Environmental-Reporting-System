from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.core.exceptions import ObjectDoesNotExist
from django.views.decorators.csrf import csrf_exempt
from rest_framework.authentication import TokenAuthentication
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def login(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Please provide both username and password'}, status=400)

        user = authenticate(username=username, password=password)

        if not user:
            return Response({'error': 'Invalid credentials'}, status=400)

        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username,
            'first_name': user.first_name
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
def verify_token(request):
    auth_header = request.headers.get('Authorization')
    logger.info(f"Token verification attempt with header: {auth_header}")
    
    if not auth_header or not auth_header.startswith('Token '):
        logger.warning("Token verification failed: No token provided")
        return Response({'error': 'No token provided'}, status=401)
    
    try:
        token_key = auth_header.split(' ')[1]
        token = Token.objects.get(key=token_key)
        logger.info(f"Token verified successfully for user: {token.user.username}")
        return Response({
            'status': 'Token is valid',
            'user': token.user.username,
            'first_name': token.user.first_name
        })
    except (IndexError, ObjectDoesNotExist):
        logger.warning(f"Token verification failed: Invalid token")
        return Response({'error': 'Invalid token'}, status=401)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Token '):
            logger.warning("Logout attempted with no token")
            return Response({'error': 'No token provided'}, status=400)
            
        token_key = auth_header.split(' ')[1]
        token = Token.objects.get(key=token_key)
        username = token.user.username
        token.delete()
        logger.info(f"User {username} logged out successfully")
        return Response({'status': 'Successfully logged out'})
    except (Token.DoesNotExist, IndexError) as e:
        logger.error(f"Error during logout: {str(e)}")
        return Response({'error': 'Invalid token'}, status=400)
    except Exception as e:
        logger.error(f"Unexpected error during logout: {str(e)}")
        return Response({'error': 'Logout failed'}, status=500) 