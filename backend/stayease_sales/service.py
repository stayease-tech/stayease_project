# service.py
import requests
import base64
import json
import time
from django.conf import settings

class ZohoESignService:
    def __init__(self):
        self.config = settings.ZOHO_ESIGN_CONFIG
        self.region = self.config.get('region', 'in')
        
        # Auth endpoint
        self.auth_url = f"https://accounts.zoho.{self.region}/oauth/v2/token"
        
        # Zoho Sign API endpoint
        self.api_url = f"https://sign.zoho.{self.region}/api/v1"
        
        print(f"Zoho Service initialized with region: {self.region}")
        print(f"Auth URL: {self.auth_url}")
        print(f"API URL: {self.api_url}")
    
    def _get_access_token(self):
        """Get access token from Zoho using refresh token"""
        params = {
            'refresh_token': self.config['refresh_token'],
            'client_id': self.config['client_id'],
            'client_secret': self.config['client_secret'],
            'grant_type': 'refresh_token'
        }
        
        response = requests.post(
            self.auth_url, 
            data=params,
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        print(f"Token Response Status: {response.status_code}")
        
        if response.status_code != 200:
            raise Exception(f"Zoho token request failed: {response.text}")
        
        token_data = response.json()
        
        if 'error' in token_data:
            raise Exception(f"Zoho error: {token_data['error']}")
        
        access_token = token_data.get('access_token')
        if not access_token:
            raise Exception(f"No access_token in response: {token_data}")
        
        return access_token
    
    def _upload_document(self, token, document):
        """Step 1: Upload the PDF file to Zoho Sign (just the file)"""
        url = f"{self.api_url}/documents"
        headers = {
            'Authorization': f'Zoho-oauthtoken {token}',
        }
        
        with document.pdf_file.open('rb') as f:
            files = {
                'file': (f"{document.title}.pdf", f, 'application/pdf')
            }
            response = requests.post(url, headers=headers, files=files)
        
        print(f"Upload Response Status: {response.status_code}")
        
        if response.status_code != 200 and response.status_code != 201:
            raise Exception(f"Document upload failed: {response.text}")
        
        response_data = response.json()
        
        # Extract document_id from the response structure
        document_id = None
        if 'documents' in response_data:
            document_ids = response_data['documents'].get('document_ids', [])
            if document_ids and len(document_ids) > 0:
                document_id = document_ids[0].get('document_id')
        
        if not document_id:
            raise Exception(f"Could not extract document_id from upload response: {response_data}")
        
        print(f"Document uploaded successfully. Document ID: {document_id}")
        return document_id
    
    def _create_request(self, token, document, document_id):
        """Step 2: Create the signing request using the document_id - Final Correct Format"""
        import time
        
        # Wait for document to be processed
        print("Waiting 8 seconds for document to be fully processed...")
        time.sleep(8)
        
        url = f"{self.api_url}/requests"
        headers = {
            'Authorization': f'Zoho-oauthtoken {token}',
            'Content-Type': 'application/json'
        }
        
        # Correct payload format: "requests" wrapper with "document_ids" (plural)
        payload = {
            "requests": {
                "request_name": document.title,
                "actions": [
                    {
                        "recipient_name": document.recipient_name,
                        "recipient_email": document.recipient_email,
                        "action_type": "SIGN"
                    }
                ],
                "document_ids": [document_id]
            }
        }
        
        print(f"Creating request with document_id: {document_id}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"Create Request Response Status: {response.status_code}")
        print(f"Create Request Response Body: {response.text}")
        
        if response.status_code != 200:
            raise Exception(f"Failed to create signing request: {response.text}")
        
        return response.json()
    
    def send_for_signature(self, document):
        """Complete process to send a document for signature"""
        try:
            print("Getting access token...")
            token = self._get_access_token()
            print("Access token obtained successfully")
            
            # Two-step process
            print("Step 1: Uploading document...")
            document_id = self._upload_document(token, document)
            print(f"Step 1 complete. Document ID: {document_id}")
            
            print("Step 2: Creating signing request...")
            request_result = self._create_request(token, document, document_id)
            print("Step 2 complete.")
            
            # Extract the signing URL and request ID from the response
            signing_url = None
            request_id = None
            
            if 'requests' in request_result:
                request_id = request_result['requests'].get('request_id')
                if 'actions' in request_result['requests']:
                    actions = request_result['requests']['actions']
                    if actions and len(actions) > 0:
                        signing_url = actions[0].get('action_url')
            
            return {
                'success': True,
                'request_id': request_id,
                'signing_url': signing_url,
                'message': f'Document sent for signature to {document.recipient_email}'
            }
            
        except Exception as e:
            print(f"Error in Zoho service: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }