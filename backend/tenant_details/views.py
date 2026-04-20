from django.shortcuts import render
from django.http import JsonResponse
from .models import TenantContract_Detail
# from django.views.decorators.csrf import csrf_exempt
from django.core.serializers import serialize
from django.views.decorators.csrf import ensure_csrf_cookie
from property_details.models import PropertyContract_Detail
from django.shortcuts import get_object_or_404
# from django.core.mail import EmailMessage

# Create your views here.
# @csrf_exempt
@ensure_csrf_cookie

def tenant_details(request, property_id):
    property_contract = get_object_or_404(PropertyContract_Detail, uniqueId=property_id)

    return render(request, "tenant/tenant-form.html", {"property_contract": property_contract})

def tenant_success(request):
    return render(request, "tenant/tenant-success.html")
        
def tenant_table(request):
    if request.method == 'GET':
        try:
            tenant_table = TenantContract_Detail.objects.all().order_by('-submitted_at')
            serialized_data = serialize('json', tenant_table)
            
            return JsonResponse({'success': True, 'tenant_table': serialized_data})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Invalid HTTP method'}, status=405)

def tenant_data(request):
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

            if TenantContract_Detail.objects.filter(uniqueId=uniqueId).exists():
                return JsonResponse({'success': False, 'message': 'Details already registered!'})

            if TenantContract_Detail.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'message': 'Email already registered!'})

            if TenantContract_Detail.objects.filter(phone=phone).exists():
                return JsonResponse({'success': False, 'message': 'Phone number already registered!'})
            
            TenantContract_Detail.objects.create(
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
