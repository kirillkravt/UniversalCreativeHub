from django.shortcuts import render
from django.http import HttpResponse

def home(request):
    return render(request, 'home.html', {
        'title': 'Universal Creative Hub',
        'message': 'Welcome to your self-hosted creative platform!'
    })

def health_check(request):
    return HttpResponse('OK', status=200)