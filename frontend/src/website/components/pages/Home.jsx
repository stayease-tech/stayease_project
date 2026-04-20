import { useRef } from 'react'
import Banner from '../section-components/Banner'
import About from '../section-components/About'
import FeaturedProperties from '../section-components/FeaturedProperties'
import Accomodations from '../section-components/Accomodations'
import Amenities from '../section-components/Amenities'
import Gallery from '../section-components/Gallery'
import EnquirySection from '../section-components/EnquirySection'
import { useProperties } from '../contexts/PropertyContext'

const Home = () => {
    const { properties } = useProperties()
    const enquiryRef = useRef(null)

    const scrollToEnquiry = () => {
        enquiryRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    return <div>
        <Banner scrollToEnquiry={scrollToEnquiry} />
        <About />
        <FeaturedProperties properties={properties} />
        <Accomodations />
        <Amenities />
        <Gallery />
        <EnquirySection ref={enquiryRef} />
    </div>
}

export default Home
