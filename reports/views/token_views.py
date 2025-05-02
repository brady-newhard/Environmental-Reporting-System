from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.core.exceptions import ObjectDoesNotExist
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    logger.info(f"Login attempt for user: {username}")

    if username is None or password is None:
        logger.warning("Login attempt with missing credentials")
        return Response({'error': 'Please provide both username and password'}, status=400)

    user = authenticate(username=username, password=password)
    logger.info(f"Authentication result for {username}: {'success' if user else 'failed'}")

    if not user:
        return Response({'error': 'Invalid Credentials'}, status=401)

    token, _ = Token.objects.get_or_create(user=user)
    logger.info(f"Token generated for user {username}")
    return Response({
        'token': token.key,
        'user_id': user.pk,
        'username': user.username
    })

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
            'user': token.user.username
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