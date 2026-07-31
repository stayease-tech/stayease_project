import { createContext, useContext, useMemo } from 'react';
import PROPERTIES from '../apis/PropertyData';

// Create context
const PropertyContext = createContext();

// Custom hook to use the context
export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertyProvider');
  }
  return context;
};

// Provider component
export const PropertyProvider = ({ children }) => {
  // Memoize the properties to prevent unnecessary re-renders
  const properties = useMemo(() => PROPERTIES, []);

  // Get all properties
  const getAllProperties = () => properties;

  // Get property by ID
  const getPropertyById = (id) => {
    return properties.find((property) => property.id === parseInt(id));
  };

  // Get properties by link
  const getPropertiesByLink = (link) => {
    return properties.find((property) =>
      property.link.toLowerCase().includes(link.toLowerCase())
    );
  };

  // Context value
  const value = {
    properties,
    getAllProperties,
    getPropertyById,
    getPropertiesByLink,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};
