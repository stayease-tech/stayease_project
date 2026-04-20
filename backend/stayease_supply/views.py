import json
from django.utils import timezone
from django.http import JsonResponse
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.files.storage import default_storage
from django.db.models import Prefetch
from .models import User_Activity_Data, User_Login_Data, Owner_Data, Property_Data, Room_Data, Bed_Data, Property_Detail, Neighbourhood_Image, Price_Board_Detail

@login_required
def auth_check(request):
    if request.user.is_authenticated:
        return JsonResponse({"isAuthenticated": True, "username": request.user.username})
    return JsonResponse({"isAuthenticated": False})

@csrf_exempt
def login_view(request):
    data = json.loads(request.body)
    username = data.get("username")
    password = data.get("password")
    
    user = authenticate(request, username=username, password=password)

    if user is not None:
        login(request, user)
        permissions = list(user.get_all_permissions())

        user_activity_data_instance, created = User_Activity_Data.objects.get_or_create(
            username=user.username,
            useremail=user.email,
        )

        user_activity_data_instance.save()

        user_login_instance = User_Login_Data.objects.create(
            user_activity_instance=user_activity_data_instance,
            login_time=timezone.now()
        )

        return JsonResponse({"success": True, "username": user.username, "useremail": user.email, "permissions": permissions, "login_id": user_login_instance.id})

    return JsonResponse({"success": False, "message": "Invalid credentials"}, status=400)

def logout_view(request):
    data = json.loads(request.body)
    login_id = data.get("loginId")

    login_instance = User_Login_Data.objects.get(
        id=login_id
    )
                
    if login_instance:
        login_instance.logout_time = timezone.now()
        login_instance.save()

    logout(request)
    return JsonResponse({"success": True})

def get_user_activity_data(request):
    if request.method == 'GET':
        try:
            user_activity_data = User_Activity_Data.objects.prefetch_related(
                Prefetch('user_activity', queryset=User_Login_Data.objects.order_by('login_time'))
            ).all()

            data = []

            for user_data in user_activity_data:
                data.append({
                    "id": user_data.id,
                    "username": user_data.username,
                    "useremail": user_data.useremail,
                    "login_data": [
                        {
                            "id": login_data.id,
                            "login_time": login_data.login_time,
                            "logout_time": login_data.logout_time
                        }
                        for login_data in user_data.user_activity.all()
                    ]
                })

            return JsonResponse({'success': True, 'user_activity_data': data})
            
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

@csrf_exempt
def owner_form_submit(request):
    if request.method == 'POST':
        try:
            owner_instance = Owner_Data(
                ownerName=request.POST.get('ownerName'),
                memberSince=request.POST.get('memberSince'),
                ownerPhone=request.POST.get('ownerPhone'),
                ownerEmail=request.POST.get('ownerEmail'),
                ownerAddress=request.POST.get('ownerAddress'),
                ownerDob=request.POST.get('ownerDob'),
                ownerGender=request.POST.get('ownerGender'),
                aadharNumber=request.POST.get('aadharNumber'),
                aadharVerification=request.POST.get('aadharVerification'),
                panNumber=request.POST.get('panNumber'),
                panVerification=request.POST.get('panVerification'),
                accountHolderName=request.POST.get('accountHolderName'),
                accountNumber=request.POST.get('accountNumber'),
                bankName=request.POST.get('bankName'),
                bankBranch=request.POST.get('bankBranch'),
                ifscCode=request.POST.get('ifscCode'),
                accountStatus=request.POST.get('accountStatus'),
                paymentType=request.POST.get('paymentType'),
                aadharFrontCopy=request.FILES.get("aadharFrontCopy"),
                aadharBackCopy=request.FILES.get("aadharBackCopy"),
                panFrontCopy=request.FILES.get("panFrontCopy"),
                panBackCopy=request.FILES.get("panBackCopy"),
                chequeCopy=request.FILES.get("chequeCopy"),
                noOfProperties = 0
            )
            owner_instance.save()

            return JsonResponse({'success': True, 'message': 'Owner data submitted successfully!'})
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later!'})

    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})

def get_owner_data(request):
    if request.method == 'GET':
        try:
            owner_data = Owner_Data.objects.all()

            data = []
            for detail in owner_data:
                data.append({
                    "id": detail.id,
                    "ownerName": detail.ownerName,
                    "memberSince": detail.memberSince,
                    "ownerPhone": detail.ownerPhone,
                    "ownerEmail": detail.ownerEmail,
                    "ownerAddress": detail.ownerAddress,
                    "ownerDob": detail.ownerDob,
                    "ownerGender": detail.ownerGender,
                    "aadharNumber": detail.aadharNumber,
                    "aadharVerification": detail.aadharVerification,
                    "panNumber": detail.panNumber,
                    "panVerification": detail.panVerification,
                    "accountHolderName": detail.accountHolderName,
                    "accountNumber": detail.accountNumber,
                    "bankName": detail.bankName,
                    "bankBranch": detail.bankBranch,
                    "ifscCode": detail.ifscCode,
                    "accountStatus": detail.accountStatus,
                    "paymentType": detail.paymentType,
                    "aadharFrontCopy": detail.aadharFrontCopy.url if detail.aadharFrontCopy else None,
                    "aadharBackCopy": detail.aadharBackCopy.url if detail.aadharBackCopy else None,
                    "panFrontCopy": detail.panFrontCopy.url if detail.panFrontCopy else None,
                    "panBackCopy": detail.panBackCopy.url if detail.panBackCopy else None,
                    "chequeCopy": detail.chequeCopy.url if detail.chequeCopy else None,
                    "noOfProperties": detail.noOfProperties,
                    "submittedDateAndTime": detail.submittedDateAndTime,
                    "updatedDateAndTime": detail.updatedDateAndTime
                })

            return JsonResponse({'success': True, 'supply_table': data})
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

@api_view(["PUT"])
@csrf_exempt
def owner_form_update(request, id):
    if request.method == 'PUT':
        try:
            owner_data = Owner_Data.objects.get(id=id)

            submitted_data = request.POST
            uploaded_files = request.FILES

            updated_fields = []

            for field, new_value in submitted_data.items():
                if hasattr(owner_data, field):
                    current_value = getattr(owner_data, field)
                    if new_value != current_value:
                        setattr(owner_data, field, new_value)
                        updated_fields.append(field)

            for field, new_file in uploaded_files.items():
                if hasattr(owner_data, field):
                    existing_file = getattr(owner_data, field)
                    
                    if existing_file:
                        if default_storage.exists(existing_file.name):  
                            default_storage.delete(existing_file.name)

                    setattr(owner_data, field, new_file)
                    updated_fields.append(field)

            if updated_fields:
                owner_data.save(update_fields=updated_fields)
                owner_data.updatedDateAndTime = timezone.now()
                owner_data.save()

            return JsonResponse({'success': True, 'message': 'Owner data updated successfully!'})

        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error updating data. Please try again later!'})
    else:
        return JsonResponse({'success': False, 'message': 'Invalid request method. PUT expected!'})

@csrf_exempt
def owner_form_delete(request, id):
    if request.method == 'DELETE':
        try:
            owner_data = Owner_Data.objects.get(id=id)
            owner_data.delete()
            return JsonResponse({'success': True, 'message': 'Owner data deleted successfully!'})
                
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error deleting owner data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. DELETE expected!'})

@csrf_exempt
def property_data_submit(request, id):
    if request.method == 'POST':
        try:
            owner_instance = Owner_Data.objects.get(id=id)

            property_instance = Property_Data(
                owner=owner_instance,
                propertyName=request.POST.get('propertyName'),
                propertyType=request.POST.get('propertyType'),
                foundedYear=request.POST.get('foundedYear'),
                doorBuilding=request.POST.get('doorBuilding'),
                streetAddress=request.POST.get('streetAddress'),
                area=request.POST.get('area'),
                landmark=request.POST.get('landmark', ''),
                state=request.POST.get('state'),
                city=request.POST.get('city'),
                pincode=request.POST.get('pincode'),
                selectedMealTypes=json.loads(request.POST.get('selectedMealTypes')),
                rent=request.POST.get('rent'),
                deposit=request.POST.get('deposit'),
                rentFree=request.POST.get('rentFree'),
                rating=request.POST.get('rating'),
                selectedAmenities=json.loads(request.POST.get('selectedAmenities')),
                image=request.FILES.get('image'),
                status=request.POST.get('status'),
                noOfBasements=request.POST.get("basementNos"),
                noOfFloors=request.POST.get("floorNos"),
                noOfRooms=request.POST.get("noOfRooms"),
                saleDeed=request.FILES.get("saleDeed"),
                ebill=request.FILES.get("ebill"),
                taxReceipt=request.FILES.get("taxReceipt"),
                waterBill=request.FILES.get("waterBill"),
                loi=request.FILES.get("loi"),
                agreement=request.FILES.get("agreement"),
            )
            property_instance.save()

            owner_instance.noOfProperties = Property_Data.objects.filter(owner=owner_instance).count()
            owner_instance.save()

            rooms_per_floor = json.loads(request.POST.get("roomsPerFloor"))
            rooms_per_basement = json.loads(request.POST.get("roomsPerBasement"))

            room_data = []

            for item in rooms_per_floor:
                floor = item.get("floor")
                room_count = item.get("rooms")
                for _ in range(int(room_count)):
                    room_data.append(Room_Data(
                        buildingLevel=f"Floor {floor}",
                        is_basement=False,
                        property=property_instance
                    ))

            for item in rooms_per_basement:
                basement = item.get("basement")
                room_count = item.get("rooms")
                for _ in range(int(room_count)):
                    room_data.append(Room_Data(
                        buildingLevel=f"Basement -{basement}",
                        is_basement=True,
                        property=property_instance
                    ))

            Room_Data.objects.bulk_create(room_data)

            return JsonResponse({'success': True, 'message': 'Property data submitted successfully!'})
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later!'})

    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})

def get_property_data(request, id):
    if request.method == 'GET':
        try:
            if int(id) == 0:
                properties = Property_Data.objects.all().select_related('owner')
            else:
                properties = Property_Data.objects.filter(owner_id=id).select_related('owner')

            data = []
            for detail in properties:
                data.append({
                    "id": detail.id,
                    "ownerName": detail.owner.ownerName if detail.owner else None,
                    "serial_number": detail.serial_number,
                    "propertyName": detail.propertyName,
                    "propertyType": detail.propertyType,
                    "foundedYear": detail.foundedYear,
                    "doorBuilding": detail.doorBuilding,
                    "streetAddress": detail.streetAddress,
                    "area": detail.area,
                    "landmark": detail.landmark,
                    "state": detail.state,
                    "city": detail.city,
                    "pincode": detail.pincode,
                    "selectedMealTypes": detail.selectedMealTypes,
                    "rent": detail.rent,
                    "deposit": detail.deposit,
                    "rentFree": detail.rentFree,
                    "rating": detail.rating,
                    "selectedAmenities": detail.selectedAmenities,
                    "image": detail.image.url if detail.image else None,
                    "noOfBasements": detail.noOfBasements,
                    "status": detail.status,
                    "noOfFloors": detail.noOfFloors,
                    "noOfRooms": detail.noOfRooms,
                    "saleDeed": detail.saleDeed.url if detail.saleDeed else None,
                    "ebill": detail.ebill.url if detail.ebill else None,
                    "taxReceipt": detail.taxReceipt.url if detail.taxReceipt else None,
                    "waterBill": detail.waterBill.url if detail.waterBill else None,
                    "loi": detail.loi.url if detail.loi else None,
                    "agreement": detail.agreement.url if detail.agreement else None,
                    "submittedDateAndTime": detail.submittedDateAndTime,
                    "updatedDateAndTime": detail.updatedDateAndTime,
                    "owner_id": detail.owner_id
                    })

            return JsonResponse({'success': True, 'property_table': data})
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

@api_view(["PUT"])
@csrf_exempt
def property_form_update(request, id):
    if request.method == 'PUT':
        try:
            property_data = Property_Data.objects.get(id=id)

            uploaded_files = request.FILES

            updated_fields = []

            for field in ['propertyName', 'propertyType', 'foundedYear', 'doorBuilding', 'streetAddress', 'area', 'landmark', 'state', 'city', 'pincode', 'rent', 'deposit', 'rentFree', 'rating', 'status']:
                if field in request.POST:
                    new_value = request.POST[field]
                    current_value = getattr(property_data, field)
                    if new_value != str(current_value):
                        setattr(property_data, field, new_value)
                        updated_fields.append(field)

            if 'selectedMealTypes' in request.POST:
                new_meal_types = json.loads(request.POST.get('selectedMealTypes'))
                current_meal_types = getattr(property_data, 'selectedMealTypes', [])
                
                if set(new_meal_types) != set(current_meal_types):
                    setattr(property_data, 'selectedMealTypes', new_meal_types)
                    updated_fields.append('selectedMealTypes')

            if 'selectedAmenities' in request.POST:
                new_amenities = json.loads(request.POST.get('selectedAmenities'))
                current_amenities = getattr(property_data, 'selectedAmenities', [])
                
                if set(new_amenities) != set(current_amenities):
                    setattr(property_data, 'selectedAmenities', new_amenities)
                    updated_fields.append('selectedAmenities')

            for field, new_file in uploaded_files.items():
                if hasattr(property_data, field):
                    existing_file = getattr(property_data, field)
                    
                    if existing_file:
                        if default_storage.exists(existing_file.name):  
                            default_storage.delete(existing_file.name)

                    setattr(property_data, field, new_file)
                    updated_fields.append(field)

            if updated_fields:
                property_data.save(update_fields=updated_fields)
                property_data.updatedDateAndTime = timezone.now()
                property_data.save()

            return JsonResponse({'success': True, 'message': 'Property data updated successfully!'})

        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error updating data. Please try again later!'})
    
    return JsonResponse({'success': False, 'message': 'Invalid request method. PUT expected!'})

@csrf_exempt
def property_form_delete(request, id):
    if request.method == 'DELETE':
        try:
            property_data = Property_Data.objects.get(id=id)

            file_fields = ['saleDeed', 'ebill', 'taxReceipt', 'waterBill', 'loi', 'agreement']

            for field_name in file_fields:
                file_field = getattr(property_data, field_name)
                if file_field:
                    file_field.delete()

            property_data.property.all().delete()

            property_data.delete()

            return JsonResponse({'success': True, 'message': 'Property data deleted successfully!'})
                
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error deleting property data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. DELETE expected!'})

def room_form_submit(request, id):
    if request.method == 'POST':
        try:
            room_data = json.loads(request.body)
            propertyId = room_data['propertyId']

            rooms_with_same_property_id = Room_Data.objects.filter(property_id=propertyId)

            room_to_be_added = get_object_or_404(rooms_with_same_property_id, pk=id)

            if rooms_with_same_property_id.exclude(pk=id).filter(roomNo=room_data['roomNo']).exclude(pk=id).exists():
                return JsonResponse({'success': False, 'message': 'Room number already exists!'})

            room_to_be_added.roomNo = room_data['roomNo']
            room_to_be_added.roomType = room_data['roomType']
            room_to_be_added.status = 'Completed'
            room_to_be_added.save()

            for bed_data in room_data['beds']:
                Bed_Data.objects.create(
                    room=room_to_be_added,
                    bedLabel=bed_data.get('bedLabel', ''),
                    balconyAccess=bed_data.get('balconyAccess', ''),
                    bathAccess=bed_data.get('bathAccess', ''),
                    roomType=bed_data.get('roomType', ''),
                    energyPlan=bed_data.get('energyPlan', ''),
                    hallAccess=bed_data.get('hallAccess', ''),
                    kitchenAccess=bed_data.get('kitchenAccess', ''),
                    roomSqft=bed_data.get('roomSqft', ''),
                    tataSkyNo=bed_data.get('tataSkyNo', ''),
                    wifiNo=bed_data.get('wifiNo', ''),
                    bescomMeterNo=bed_data.get('bescomMeterNo', '')
                )

            return JsonResponse({'success': True, 'message': 'Room and beds data submitted successfully!'})
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later!'})

    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected!'})

def get_room_data(request, id):
    if request.method == 'GET':
        try:
            if int(id) == 0:
                rooms = Room_Data.objects.prefetch_related('room').all()
            else:
                rooms = Room_Data.objects.filter(property_id=id).prefetch_related('room')

            data = []

            for room in rooms:
                room_data = {
                    'id': room.id,
                    'buildingLevel': room.buildingLevel,
                    'roomNo': room.roomNo,
                    'roomType': room.roomType,
                    'status': room.status,
                    'is_basement': room.is_basement,
                    'property_id': room.property_id,
                    'beds': []
                }
                
                if hasattr(room, 'room') and room.room.exists():
                    for bed in room.room.all():
                        room_data['beds'].append({
                            'id': bed.id,
                            'bedLabel': bed.bedLabel,
                            'balconyAccess': bed.balconyAccess,
                            'bathAccess': bed.bathAccess,
                            'roomType': bed.roomType,
                            'energyPlan': bed.energyPlan,
                            'hallAccess': bed.hallAccess,
                            'kitchenAccess': bed.kitchenAccess,
                            'roomSqft': bed.roomSqft,
                            'tataSkyNo': bed.tataSkyNo,
                            'wifiNo': bed.wifiNo,
                            'bescomMeterNo': bed.bescomMeterNo,
                        })
                
                data.append(room_data)

            return JsonResponse({'success': True, 'room_table': data})
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error fetching data. Please try again later!'})
        
    return JsonResponse({'success': False, 'message': 'Invalid request method. GET expected!'})

@csrf_exempt
def room_data_update(request, id):
    if request.method == 'PUT':
        try:
            room_data = json.loads(request.body)
            property_id = room_data['propertyId']

            rooms_with_same_property_id = Room_Data.objects.filter(property_id=property_id)
            room_to_be_updated = get_object_or_404(rooms_with_same_property_id, pk=id)

            if 'roomNo' in room_data:
                if rooms_with_same_property_id.exclude(pk=id).filter(roomNo=room_data['roomNo']).exists():
                    return JsonResponse({'success': False, 'message': f'Room number {room_data["roomNo"]} already exists!'})

            for field, value in room_data.items():
                if field not in ['beds', 'property_id'] and hasattr(room_to_be_updated, field):
                    setattr(room_to_be_updated, field, value)

            if 'roomType' in room_data:
                Bed_Data.objects.filter(room_id=id).delete()
                
                for bed_data in room_data.get('beds', []):
                    Bed_Data.objects.create(
                        room=room_to_be_updated,
                        bedLabel=bed_data.get('bedLabel', ''),
                        balconyAccess=bed_data.get('balconyAccess', ''),
                        bathAccess=bed_data.get('bathAccess', ''),
                        roomType=bed_data.get('roomType', ''),
                        energyPlan=bed_data.get('energyPlan', ''),
                        hallAccess=bed_data.get('hallAccess', ''),
                        kitchenAccess=bed_data.get('kitchenAccess', ''),
                        roomSqft=bed_data.get('roomSqft', ''),
                        tataSkyNo=bed_data.get('tataSkyNo', ''),
                        wifiNo=bed_data.get('wifiNo', ''),
                        bescomMeterNo=bed_data.get('bescomMeterNo', '')
                    )

            if 'beds' in room_data:
                for bed_data in room_data['beds']:
                    try:
                        bed = Bed_Data.objects.get(id=bed_data['id'], room=room_to_be_updated)
                        for field, value in bed_data.items():
                            if field != 'id' and hasattr(bed, field):
                                setattr(bed, field, value)
                        bed.save()
                    except Bed_Data.DoesNotExist:
                        continue

            room_to_be_updated.save()
            
            return JsonResponse({'success': True, 'message': 'Room and beds data updated successfully!'})
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error updating data. Please try again later!'})

    return JsonResponse({'success': False, 'message': 'Invalid request method. PUT expected!'})
    
def get_property_details(request):
    if request.method == 'GET':
        try:
            property = Property_Detail.objects.prefetch_related('neighbourhoodImages').all()

            property_data = []
            for data in property:
                property_data.append({
                    "id": data.id,
                    "livingRoom": data.livingRoom.url if data.livingRoom else None,
                    "bedRoom": data.bedRoom.url if data.bedRoom else None,
                    "kitchenArea": data.kitchenArea.url if data.kitchenArea else None,
                    "bathroom": data.bathroom.url if data.bathroom else None,
                    "commonArea": data.commonArea.url if data.commonArea else None,
                    "productImg": data.productImg.url if data.productImg else None,
                    "propertyName": data.propertyName,
                    "propertyLocation": data.propertyLocation,
                    "propertyAddress": data.propertyAddress,
                    "propertyRoomRent": data.propertyRoomRent,
                    "propertyDescription": data.propertyDescription,
                    "propertyPathname": data.propertyPathname,
                    "propertyIframeLink": data.propertyIframeLink,
                    "neighbourhood_images": [
                        {
                            "id": image.id,
                            "image": image.images.url if image.images else None,
                            "property_id": image.property_id,
                        }
                        for image in data.neighbourhoodImages.all()
                    ],
                    "priceboard_details": [
                        {
                            "id": price.id,
                            "roomType": price.roomType,
                            "roomRent": price.roomRent,
                            "property_id": price.property_id,
                        }
                        for price in data.priceBoardDetails.all()
                    ]
                }) 

            return JsonResponse({'success': True, 'property_data': property_data})
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later.'})
        
def property_form_submit(request):
    if request.method == 'POST':
        try:
            property_instance = Property_Detail(
                propertyName=request.POST.get('propertyName'),
                propertyLocation=request.POST.get('propertyLocation'),
                propertyAddress=request.POST.get('propertyAddress'),
                propertyRoomRent=request.POST.get('propertyRoomRent'),
                propertyDescription=request.POST.get('propertyDescription'),
                propertyPathname=request.POST.get('propertyPathname'),
                propertyIframeLink=request.POST.get('propertyIframeLink'),
                productImg=request.FILES.get("productImg")
            )

            image_fields = ['livingRoom', 'bedRoom', 'kitchenArea', 'bathroom', 'commonArea']
            for field in image_fields:
                if field in request.FILES:
                    setattr(property_instance, field, request.FILES[field])

            property_instance.save()

            neighbourhood_images = request.FILES.getlist('neighbourhoodImages')
            saved_neighbourhood_images = []
            for image in neighbourhood_images:
                neighbourhood_image = Neighbourhood_Image(property=property_instance, images=image)
                neighbourhood_image.save()
                saved_neighbourhood_images.append(neighbourhood_image.images.url)

            room_types = request.POST.getlist("roomType")
            room_rents = request.POST.getlist("roomRent")

            if len(room_types) != len(room_rents):
                return JsonResponse({"error": "Mismatched roomType and roomRent data"}, status=400)

            for room_type, room_rent in zip(room_types, room_rents):
                Price_Board_Detail.objects.create(
                    property=property_instance,
                    roomType=room_type,
                    roomRent=room_rent
                )

            return JsonResponse({'success': True, 'message': 'Data submitted successfully!'})
        except Exception as e:
            print (e)
            return JsonResponse({'success': False, 'message': 'Error submitting data. Please try again later.'})

    return JsonResponse({'success': False, 'message': 'Invalid request method. POST expected.'})