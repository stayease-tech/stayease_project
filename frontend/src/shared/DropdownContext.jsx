import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const DropdownContext = createContext();

const EXPENSE_CATEGORY_MAP = {
    'Operations': 'expense_categories__operations',
    'Sales': 'expense_categories__sales',
    'Marketing': 'expense_categories__marketing',
    'Transformation': 'expense_categories__transformation',
    'Expansion': 'expense_categories__expansion',
    'HR & Admin': 'expense_categories__hr_admin',
    'Check-Out Deductions': 'expense_categories__checkout_deductions',
    'Monthly Maintenance': 'expense_categories__monthly_maintenance',
    'Owner Deductions': 'expense_categories__owner_deductions',
    'Owner Payout': 'expense_categories__owner_payout',
    'Resident Deductions': 'expense_categories__resident_deductions',
    'Resident Payable': 'expense_categories__resident_payable',
    'Resident Receivable': 'expense_categories__resident_receivable',
};

export const DropdownProvider = ({ children }) => {
    const [dropdownConfig, setDropdownConfig] = useState({});
    const [staffNames, setStaffNames] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configRes, staffRes] = await Promise.all([
                    axios.get('/accounts/get-dropdown-config/'),
                    axios.get('/accounts/get-staff-names/'),
                ]);
                if (configRes.data.success) {
                    setDropdownConfig(configRes.data.dropdown_config);
                }
                if (staffRes.data.success) {
                    setStaffNames(staffRes.data.staff_names);
                }
            } catch (err) {
                console.error('Failed to load dropdown config:', err);
            }
            setLoaded(true);
        };
        fetchData();
    }, []);

    const getOptions = (group) => dropdownConfig[group] || [];

    const getOptionsWithCurrent = (group, currentValue) => {
        const options = dropdownConfig[group] || [];
        if (currentValue && !options.includes(currentValue)) {
            return [currentValue, ...options];
        }
        return options;
    };

    const getExpenseCategories = (expenseType) => {
        const key = EXPENSE_CATEGORY_MAP[expenseType];
        return key ? (dropdownConfig[key] || []) : [];
    };

    const getStaffNamesList = () => staffNames.map(s => s.name);

    return (
        <DropdownContext.Provider value={{
            dropdownConfig,
            staffNames,
            loaded,
            getOptions,
            getOptionsWithCurrent,
            getExpenseCategories,
            getStaffNamesList,
        }}>
            {children}
        </DropdownContext.Provider>
    );
};

export const useDropdowns = () => useContext(DropdownContext);
