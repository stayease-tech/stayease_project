from django.shortcuts import render
from django.http import JsonResponse
from .models import Normal_Enquirie, Visit_Enquirie
# from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import ensure_csrf_cookie
from django.core.mail import EmailMessage
import json

# @csrf_exempt
@ensure_csrf_cookie
# Create your views here.
def index_page(request):
    """Handle GET / — render the main index HTML page and set the CSRF cookie."""
    return render(request, "index.html")

def normal_enquiry(request):
    """Handle POST /enquiry/normal/ — save a general enquiry and send a notification email.

    Args:
        request: Django HttpRequest with JSON body containing `name`, `phone`,
            `email`, `comments`, and `submittedAt`.

    Returns:
        JsonResponse with a `message` key on success (200) or an `error` key on failure (400/405).
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name', '')
            phone = data.get('phone', '')
            email = data.get('email', '')
            comments = data.get('comments', '')
            submittedAt = data.get('submittedAt', '')

            Normal_Enquirie.objects.create(
                name=name,
                phone=phone,
                email=email,
                comments=comments,
                submittedAt=submittedAt
            )

            emailsend = EmailMessage(
                subject=f"Enquiry from {name}",
                body=f"Name: {name}\nPhone: {phone}\nEmail: {email}\nComments: {comments}\nSubmitted At: {submittedAt}",
                from_email='hello@mystayease.com',
                to=['hello@mystayease.com'],
            )
            
            emailsend.send()

            response_message = f"Thank you {name}, your enquiry has been received!"
            return JsonResponse({'message': response_message}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

def visit_enquiry(request):
    """Handle POST /enquiry/visit/ — save a property visit request and send a notification email.

    Args:
        request: Django HttpRequest with JSON body containing `name`, `phone`,
            `email`, `property`, and `submittedAt`.

    Returns:
        JsonResponse with a `message` key on success (200) or an `error` key on failure (400/405).
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            name = data.get('name', '')
            phone = data.get('phone', '')
            email = data.get('email', '')
            property = data.get('property', '')
            submittedAt = data.get('submittedAt', '')

            Visit_Enquirie.objects.create(
                name=name,
                phone=phone,
                email=email,
                property=property,
                submittedAt=submittedAt
            )

            emailsend = EmailMessage(
                subject=f"Property enquiry for {property}",
                body=f"Name: {name}\nPhone: {phone}\nEmail: {email}\nProperty Name: {property}\nSubmitted At: {submittedAt}",
                from_email='hello@mystayease.com',
                to=['hello@mystayease.com'],
            )
            
            emailsend.send()

            response_message = f"Thank you {name}, your enquiry has been received!"
            return JsonResponse({'message': response_message}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Invalid request method'}, status=405)
