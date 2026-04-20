from django.shortcuts import render
from django.http import JsonResponse
from .models import PropertyContract_Detail
from tenant_details.models import TenantContract_Detail
# from django.views.decorators.csrf import csrf_exempt
from django.core.serializers import serialize
from django.views.decorators.csrf import ensure_csrf_cookie

# @csrf_exempt
@ensure_csrf_cookie

# Create your views here.
def property_table(request):
    if request.method == 'GET':
        try:
            property_table = PropertyContract_Detail.objects.all().order_by('-submitted_at')
            serialized_data = serialize('json', property_table)

            return JsonResponse({'success': True, 'property_table': serialized_data})
        except Exception as e:
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later.'})

def submit_contract(request):
    if request.method == 'POST':
        try:
            uniqueId = request.POST.get('uniqueId')
            communityManager = request.POST.get('communityManager')
            roomNo = request.POST.get('roomNo')
            accommodationType = request.POST.get('accommodationType')
            monthlyFee = request.POST.get('monthlyFee')
            stayDuration = request.POST.get('stayDuration')
            startDate = request.POST.get('startDate')
            endDate = request.POST.get('endDate')
            moveOutTime = request.POST.get('moveOutTime')
            securityDeposit = request.POST.get('securityDeposit')
            userFeeDueDate = request.POST.get('userFeeDueDate')
            propertyAddress = request.POST.get('propertyAddress')
            tenantContact = request.POST.get('tenantContact')

            exists = TenantContract_Detail.objects.filter(uniqueId=uniqueId).exists()

            PropertyContract_Detail.objects.create(
            uniqueId=uniqueId,
            communityManager=communityManager,
            roomNo=roomNo,
            accommodationType=accommodationType,
            monthlyFee=monthlyFee,
            stayDuration=stayDuration,
            startDate=startDate,
            endDate=endDate,
            moveOutTime=moveOutTime,
            securityDeposit=securityDeposit,
            userFeeDueDate=userFeeDueDate,
            propertyAddress=propertyAddress,
            tenantContact=tenantContact,
            status=exists
        )
            
            return JsonResponse({'success': True, 'message': 'Data submitted successfully!'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later.'})
    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected.'})
