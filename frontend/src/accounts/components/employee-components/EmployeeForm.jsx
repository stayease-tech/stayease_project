import { useState } from 'react';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import axios from 'axios';
import Cookies from 'js-cookie';

function EmployeeForm({ isExpanded, setIsExpanded }) {
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
    setEmployeeData({
      ...employeeData,
      [e.target.name]: e.target.value,
    });
  };

  const getCSRFToken = () => {
    return Cookies.get('csrftoken');
  };

  axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken();

  const employeeHandleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `/accounts/expense-form-submit/`,
        employeeData,
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
    <div>
      <Sidebar
        isExpanded={isExpanded}
        toggleSidebar={() => setIsExpanded(!isExpanded)}
      />

      <div className="flex-1 duration-300">
        <Navbar isExpanded={isExpanded} />

        <div
          className={`text-slate-800 max-lg:bg-white min-h-screen ${isExpanded ? 'ml-16 md:ml-64' : 'ml-16'} pt-[5rem] lg:pt-[6rem] px-6 lg:pb-[1rem]`}
        >
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
              <strong>First Name:</strong>
            </label>
            <input
              type="text"
              name="firstName"
              value={employeeData.firstName}
              onChange={employeeHandleChange}
              className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
              placeholder="Enter the first name here"
              required
            />

            <label htmlFor="lastName" className="text-[#D4A017] max-sm:text-sm">
              <strong>Last Name:</strong>
            </label>
            <input
              type="text"
              name="lastName"
              value={employeeData.lastName}
              onChange={employeeHandleChange}
              className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
              placeholder="Enter the last name here"
              required
            />

            <label htmlFor="phone" className="text-[#D4A017] max-sm:text-sm">
              <strong>Phone Number:</strong>
            </label>
            <input
              type="tel"
              name="phone"
              value={employeeData.phone}
              onChange={employeeHandleChange}
              className="mt-2 mb-3 text-black w-full p-2 mb-2 border border-gray-300 rounded text-xs sm:text-sm"
              placeholder="Enter the phone number here"
              required
            />

            <label htmlFor="email" className="text-[#D4A017] max-sm:text-sm">
              <strong>Email Address:</strong>
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
              <strong>Gender:</strong>
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
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            <label htmlFor="role" className="text-[#D4A017] max-sm:text-sm">
              <strong>Role:</strong>
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
              <option value="Supply">Supply</option>
              <option value="Sales">Sales</option>
              <option value="Accounts">Accounts</option>
              <option value="Operations">Operations</option>
            </select>

            <button
              className="block mt-4 w-full px-4 py-2 bg-[#D4A017] text-white text-base font-medium rounded cursor-pointer hover:bg-[#B8860B] max-sm:text-sm"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EmployeeForm;
