from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status

class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'username': user.username,
            'first_name': user.first_name,
        })

@api_view(['GET', 'POST'])
def verify_token(request):
    if request.method == 'GET':
        token_key = request.headers.get('Authorization', '').replace('Token ', '')
    else:
        token_key = request.data.get('token')
    
    try:
        token = Token.objects.get(key=token_key)
        user = token.user
        return Response({
            'username': user.username,
            'first_name': user.first_name
        }, status=status.HTTP_200_OK)
    except Token.DoesNotExist:
        return Response({'detail': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED) 