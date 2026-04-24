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
    property_contract = get_object_or_404(PropertyContract_Detail, uniqueId=property_id)

    return render(request, "resident/resident-form.html", {"property_contract": property_contract})

def resident_success(request):
    return render(request, "resident/resident-success.html")
        
def resident_table(request):
    if request.method == 'GET':
        try:
            resident_table = residentContract_Detail.objects.all().order_by('-submitted_at')
            serialized_data = serialize('json', resident_table)
            
            return JsonResponse({'success': True, 'resident_table': serialized_data})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Invalid HTTP method'}, status=405)

def resident_data(request):
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
