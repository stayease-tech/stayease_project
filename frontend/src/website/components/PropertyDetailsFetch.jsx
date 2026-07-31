import { useState, useEffect } from 'react';
import axios from 'axios';

function PropertyDetailsFetch() {
  const [propertyArray, setPropertyArray] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/supply/get-property-data/');

        setPropertyArray(response.data.property_data);
      } catch (err) {
        console.log(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { propertyArray, loading };
}

export default PropertyDetailsFetch;
