import { useMemo } from "react"
import PropertyEnquiry from './PropertyEnquiry'
import FeaturedProperties from '../section-components/FeaturedProperties'
import { useProperties } from '../contexts/PropertyContext'
import { useLocation } from 'react-router-dom'

const PropertyDetails = () => {
    const { properties, getPropertiesByLink } = useProperties()
    const location = useLocation()

    const propertyData = getPropertiesByLink(location.pathname)

    // Memoized property filtering
    const displayedProperties = useMemo(() => {
        return properties.filter(p => p.link !== propertyData.link);
    }, [propertyData.link, properties]);

    return <div>
        <PropertyEnquiry propertyData={propertyData} />
        <FeaturedProperties heading='Similar Properties' display='hidden' properties={displayedProperties} />
    </div>
}

export default PropertyDetails
