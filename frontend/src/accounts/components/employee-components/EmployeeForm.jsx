import { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useDropdowns } from "../../../shared/DropdownContext";
import { DashPage } from "../../../shared/Dashboard";
import { sanitizeNameValue, validateNameValue } from "../../../shared/formValidation";
import { formatIndianPhone, isValidIndianPhone, normalizePhoneDigits } from "../../../shared/phone";

function EmployeeForm() {
  const { getOptions } = useDropdowns();
  const [employeeData, setEmployeeData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    gender: '',
    role: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const employeeHandleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'firstName' || name === 'lastName') nextValue = sanitizeNameValue(value);
    if (name === 'phone') nextValue = formatIndianPhone(value);

    setEmployeeData({
      ...employeeData,
      [name]: nextValue,
    });
  };

  const getCSRFToken = () => {
    return Cookies.get('csrftoken');
  };

  axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

  const employeeHandleSubmit = async (e) => {
    e.preventDefault();

    const firstNameError = validateNameValue(employeeData.firstName);
    const lastNameError = validateNameValue(employeeData.lastName);

    if (firstNameError || lastNameError) {
      alert(firstNameError || lastNameError);
      return;
    }

    if (!isValidIndianPhone(employeeData.phone)) {
      alert('Phone number must be exactly 10 digits.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `/accounts/employee-form-submit/`,
        { ...employeeData, phone: normalizePhoneDigits(employeeData.phone) },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        alert(response.data.message);

        setEmployeeData({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          gender: '',
          role: '',
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form. Please try again!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashPage>
          <form
            className="w-[100%] lg:w-[98%] mx-auto lg:my-8 py-6 sm:p-8 lg:p-10 lg:rounded-lg md:bg-white text-slate-800"
            onSubmit={employeeHandleSubmit}
            method="POST"
          >
            <h1 className="text-center sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-8 lg:mt-0 text-[#D4A017]">
              ADD EMPLOYEE DETAILS
            </h1>

            <h3 className="font-semibold mb-4 text-stone-400 max-sm:text-sm">
              Create employee login here
            </h3>

            <label
              htmlFor="firstName"
              className="text-[#D4A017] max-sm:text-sm"
            >
              <strong>First Name: <span className="text-red-500">*</span></strong>
            </label>
            <input
              type="text"
              name="firstName"
              value={employeeData.firstName}
              onChange={employeeHandleChange}
              className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
              placeholder="Enter the first name here"
              required
              pattern="^[A-Za-zÀ-ÖØ-öø-ÿ .'-]+$"
              title="Letters, spaces, apostrophes, periods, or hyphens only"
            />

            <label htmlFor="lastName" className="text-[#D4A017] max-sm:text-sm">
              <strong>Last Name: <span className="text-red-500">*</span></strong>
            </label>
            <input
              type="text"
              name="lastName"
              value={employeeData.lastName}
              onChange={employeeHandleChange}
              className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
              placeholder="Enter the last name here"
              required
              pattern="^[A-Za-zÀ-ÖØ-öø-ÿ .'-]+$"
              title="Letters, spaces, apostrophes, periods, or hyphens only"
            />

            <label htmlFor="phone" className="text-[#D4A017] max-sm:text-sm">
              <strong>Phone Number: <span className="text-red-500">*</span></strong>
            </label>
            <input
              type="tel"
              name="phone"
              value={employeeData.phone}
              onChange={employeeHandleChange}
              className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
              placeholder="XXXXX XXXXX"
              maxLength={11}
              required
            />

            <label htmlFor="email" className="text-[#D4A017] max-sm:text-sm">
              <strong>Email Address: <span className="text-red-500">*</span></strong>
            </label>
            <input
              type="email"
              name="email"
              value={employeeData.email}
              onChange={employeeHandleChange}
              className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
              placeholder="Enter the email address here"
              required
            />

            <label htmlFor="gender" className="text-[#D4A017] max-sm:text-sm">
              <strong>Gender: <span className="text-red-500">*</span></strong>
            </label>
            <select
              value={employeeData.gender}
              onChange={employeeHandleChange}
              className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
              name="gender"
              required
            >
              <option value="" disabled>
                Select the gender here
              </option>
              {getOptions('genders').map((g, i) => (
                <option key={i} value={g}>{g}</option>
              ))}
            </select>

            <label htmlFor="role" className="text-[#D4A017] max-sm:text-sm">
              <strong>Role: <span className="text-red-500">*</span></strong>
            </label>
            <select
              value={employeeData.role}
              onChange={employeeHandleChange}
              className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
              name="role"
              required
            >
              <option value="" disabled>
                Select the role here
              </option>
              {getOptions('employee_roles').map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>

            <button
              className="block mt-4 w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
    </DashPage>
  );
}

export default EmployeeForm;
