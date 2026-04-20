import { memo } from 'react'

// Memoized map component
const MapComponent = memo(({mapUrl}) => {
  return (
    <div className="flex justify-center mt-10 px-4 md:px-0">
      <iframe
        className='w-full md:w-[90vw] h-[45vh] md:h-[70vh] rounded-lg shadow-lg'
        src={mapUrl}
        title="StayEase Office Location - Electronic City, Bangalore"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        style={{ border: 0 }}
        aria-label="Google Maps location of StayEase office in Electronic City, Bangalore"
      />
    </div>
  )
})

MapComponent.displayName = 'MapComponent'

export default MapComponent