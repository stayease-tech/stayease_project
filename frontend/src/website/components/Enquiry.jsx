import React from 'react';
import PropertyEnquiry from './property-components/PropertyEnquiry';
import ProductSlider from './section-components/ProductSlider';
import PropertyDetailsFetch from './PropertyDetailsFetch';
import { useLocation } from 'react-router-dom';

const Enquiry = () => {
  const location = useLocation();
  const { propertyArray } = PropertyDetailsFetch();

  return (
    <div>
      <PropertyEnquiry
        pathname={location.pathname}
        property={propertyArray.filter(
          (property) => property.propertyPathname === location.pathname
        )}
      />
      <ProductSlider
        heading="Similar Properties"
        pathname={location.pathname}
      />
    </div>
  );
};

export default Enquiry;
