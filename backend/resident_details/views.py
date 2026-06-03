# Copyright (c) 2026 Aravind Adari. All rights reserved.

from django.shortcuts import render
from django.http import JsonResponse
from .models import residentContract_Detail
# from django.views.decorators.csrf import csrf_exempt
from django.core.serializers import serialize
from django.views.decorators.csrf import ensure_csrf_cookie
from property_details.models import PropertyContract_Detail
from django.shortcuts import get_object_or_404
# from django.core.mail import EmailMessage

# Create your views here.
# @csrf_exempt
@ensure_csrf_cookie

def resident_details(request, property_id):
    """Handle GET /resident/<property_id>/ — render the resident onboarding form.

    Args:
        request: Django HttpRequest.
        property_id: Unique identifier for the linked property contract.

    Returns:
        Rendered HTML response with the resident registration form pre-populated with contract data.
    """
    property_contract = get_object_or_404(PropertyContract_Detail, uniqueId=property_id)

    return render(request, "resident/resident-form.html", {"property_contract": property_contract})

def resident_success(request):
    """Handle GET /resident/success/ — render the registration success confirmation page.

    Returns:
        Rendered HTML success page shown after a resident completes onboarding.
    """
    return render(request, "resident/resident-success.html")
        
def resident_table(request):
    """Handle GET /resident/table/ — return all resident registration records as JSON.

    Returns:
        JsonResponse with `success` and serialized `resident_table` list, ordered by submission date.
    """
    if request.method == 'GET':
        try:
            resident_table = residentContract_Detail.objects.all().order_by('-submitted_at')
            serialized_data = serialize('json', resident_table)
            
            return JsonResponse({'success': True, 'resident_table': serialized_data})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Invalid HTTP method'}, status=405)

def resident_data(request):
    """Handle POST /resident/submit/ — create a new resident registration record.

    Args:
        request: Django HttpRequest with POST body containing personal details (`fname`,
            `lname`, `phone`, `email`, `address`, `dob`, `gender`, `identityType`,
            `identityNumber`) and uploaded files (`frontCopy`, `backCopy`).

    Returns:
        JsonResponse with `success` flag and a result message. Returns 400-level errors
        for duplicate uniqueId, email, or phone.
    """
    if request.method == 'POST':
        try:
            uniqueId = request.POST.get('uniqueId')
            fname = request.POST.get('fname')
            lname = request.POST.get('lname')
            phone = request.POST.get('phone')
            email = request.POST.get('email')
            address = request.POST.get('address')
            dob = request.POST.get('dob')
            gender = request.POST.get('gender')
            identityType = request.POST.get('identityType')
            identityNumber = request.POST.get('identityNumber')
            frontCopy = request.FILES.get('frontCopy')
            backCopy = request.FILES.get('backCopy')

            if residentContract_Detail.objects.filter(uniqueId=uniqueId).exists():
                return JsonResponse({'success': False, 'message': 'Details already registered!'})

            if residentContract_Detail.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'message': 'Email already registered!'})

            if residentContract_Detail.objects.filter(phone=phone).exists():
                return JsonResponse({'success': False, 'message': 'Phone number already registered!'})
            
            residentContract_Detail.objects.create(
            uniqueId=uniqueId,
            fname=fname,
            lname=lname,
            phone=phone,
            email=email,
            address=address,
            dob=dob,
            gender=gender,
            identityType=identityType,
            identityNumber=identityNumber,
            frontCopy=frontCopy,
            backCopy=backCopy
        )
            
            record = PropertyContract_Detail.objects.get(uniqueId=uniqueId)
            record.status = True
            record.save() 
            
            return JsonResponse({'success': True, 'message': 'Data submitted successfully!'})
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later.'})
    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected.'})
