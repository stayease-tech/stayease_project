const currentDate = new Date();

const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const day = String(currentDate.getDate()).padStart(2, '0');

const formattedDate = `${year}-${month}-${day}`;

document.getElementById("dob").value = formattedDate;

// File Upload dropdown function
function toggleDropdown() {
    const dropdown = document.getElementById('dropdown-options');
    dropdown.classList.toggle('hidden');
}

document.addEventListener('click', (event) => {
    const dropdown = document.getElementById('dropdown-options');
    const toggleButton = document.getElementById('dropdown-toggle');
    if (event.target !== dropdown && event.target !== toggleButton) {
        dropdown.classList.add('hidden');
    }
});

// Data submission success message popup function
// function showPopup(message) {
//     const popup = document.getElementById('popup-message');
//     popup.innerHTML = `<i class="fa fa-check-circle"></i> ${message}`;
//     popup.classList.remove('hidden');
//     popup.classList.add('show');

//     setTimeout(() => {
//         popup.classList.remove('show');
//         popup.classList.add('hidden');
//     }, 5000);
// }

// Form validation function
function validateForm(event) {
    event.preventDefault();

    document.getElementById('submitBtn').disabled = true;
    document.getElementById('submitBtn').textContent = 'Loading...';
    document.getElementById("data-error").textContent = 'Please do not refresh or exit the page';
    document.getElementById("data-error").style.color = '#eba312';

    const uniqueId = document.getElementById("uniqueId").value;
    const fname = document.getElementById("fname").value;
    const lname = document.getElementById("lname").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const address = document.getElementById("address").value;
    const dob = document.getElementById("dob").value;
    const gender = document.getElementById("gender").value;
    const identityType = document.getElementById("identity-type").value;
    const identityNumber = document.getElementById("identity-number").value;
    const frontCopy = document.getElementById("front-copy").files[0];
    const backCopy = document.getElementById("back-copy").files[0];

    document.getElementById("fname-error").textContent = "";
    document.getElementById("lname-error").textContent = "";
    document.getElementById("phone-error").textContent = "";
    document.getElementById("email-error").textContent = "";
    document.getElementById("dob-error").textContent = "";
    document.getElementById("identity-number-error").textContent = "";
    document.getElementById("identity-document-error").textContent = "";

    const namePattern = /^[a-zA-Z]+$/;
    if (fname.trim() === "" || !namePattern.test(fname)) {
        document.getElementById("fname-error").textContent = "Invalid firstname!";
        return false;
    }

    if (lname.trim() === "" || !namePattern.test(lname)) {
        document.getElementById("lname-error").textContent = "Invalid lastname!";
        return false;
    }

    const phonePattern = /^[0-9]{10}$/;
    if (phone.trim() === "" || !phonePattern.test(phone)) {
        document.getElementById("phone-error").textContent = "Please enter a valid phone number (10 digits)!";
        return false;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (email.trim() === "" || !emailPattern.test(email)) {
        document.getElementById("email-error").textContent = "Please enter a valid email!";
        return false;
    }

    const today = new Date().toISOString().split('T')[0];
    if (dob > today) {
        document.getElementById("dob-error").textContent = "Date of birth cannot be in the future!";
        return false;
    }

    if (identityNumber.trim() === "") {
        document.getElementById("identity-number-error").textContent = "Please enter your identity number!";
        return false;
    } else if (identityType === "aadhar" && !/^\d{12}$/.test(identityNumber)) {
        document.getElementById("identity-number-error").textContent = "Please enter a valid 12-digit Aadhar number!";
        return false;
    } else if (identityType === "pan-card" && !/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(identityNumber)) {
        document.getElementById("identity-number-error").textContent = "Please enter a valid PAN card number!";
        return false;
    } else if (identityType === "driver-license" && !/^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{6}$/.test(identityNumber)) {
        document.getElementById("identity-number-error").textContent = "Please enter a valid Driving License number!";
        return false;
    } else if (identityType === "passport" && !/^[A-PR-WY][1-9]\d{6}[A-Z]{1}$/.test(identityNumber)) {
        document.getElementById("identity-number-error").textContent = "Please enter a valid Passport number!";
        return false;
    } else if (identityType === "other" && identityNumber.trim().length < 5) {
        document.getElementById("identity-number-error").textContent = "Please enter a valid identity number for 'Other'!";
        return false;
    }

    if (!frontCopy && !backCopy) {
        document.getElementById("identity-document-error").textContent = 'Please upload the document!';
        return false;
    }
    if (!frontCopy) {
        document.getElementById("identity-document-error").textContent = 'Please upload a front copy file!';
        return false;
    }
    if (!backCopy) {
        document.getElementById("identity-document-error").textContent = 'Please upload a back copy file!';
        return false;
    }

    const [dobYear, dobMonth, dobDay] = document.getElementById("dob").value.split('-');

    const monthAbbreviation = new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(`${dobYear}-${dobMonth}-01`));

    const formData = new FormData();
    formData.append('uniqueId', uniqueId);
    formData.append('fname', fname);
    formData.append('lname', lname);
    formData.append('phone', phone);
    formData.append('email', email);
    formData.append('address', address);
    formData.append('dob', `${dobDay}-${monthAbbreviation}-${dobYear}`);
    formData.append('gender', gender);
    formData.append('identityType', identityType);
    formData.append('identityNumber', identityNumber);
    formData.append('frontCopy', frontCopy);
    formData.append('backCopy', backCopy);

    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch('/tenant-details/tenant-data/', { //Form submission API here
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById("data-error").textContent = "";
                // alert(data.message);
                event.target.reset();
                document.getElementById("dob").value = formattedDate;
                window.location.href = "https://stayease-contract.vercel.app/tenant-details/tenant-success/";
            } else {
                document.getElementById("data-error").textContent = `Data submission failed. ${data.message}`;
                document.getElementById("data-error").style.color = 'red';
            }
        })
        .catch(error => {
            console.error('Error submitting data:', error);
            document.getElementById("data-error").textContent = "Error submitting data. Please try again later!";
            document.getElementById("data-error").style.color = 'red';
        }).finally(() => {
            document.getElementById('submitBtn').disabled = false;
            document.getElementById('submitBtn').textContent = "Submit";
        });

    return false;
}