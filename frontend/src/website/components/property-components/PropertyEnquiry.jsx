import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import MapComponent from './MapComponent';
import IconSlider from './IconSlider';
import axios from 'axios';
import Cookies from 'js-cookie';

// Constants
const SLIDE_INTERVAL = 3000;
const TOUCH_THRESHOLD = 50;

// Memoized price board - keeps exact same styling
const PriceBoard = memo(({ priceBoardData }) => (
  <>
    {priceBoardData.map((data) => (
      <div
        key={data.id}
        className="flex justify-between p-3 border border-[#eba312] mt-3"
      >
        <div className="font-semibold">{data?.type}</div>
        <div className="font-semibold">₹{data?.price}/mo*</div>
      </div>
    ))}
    <p className="text-xs text-left mt-5">Additional GST Applicable</p>
  </>
));

PriceBoard.displayName = 'PriceBoard';

// Memoized enquiry board - keeps exact same styling
const EnquiryBoard = memo(
  ({ formData, isSubmitting, handleChange, handleSubmit }) => (
    <>
      <h2 className="text-2xl font-semibold text-[#eba312]">
        Book Your Visit Today
      </h2>

      <form onSubmit={handleSubmit} className="text-left mt-3">
        <div className="mb-3">
          <label className="block text-sm font-medium mb-2" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full bg-white text-gray-900 text-sm font-light border-b-2 border-gray-300 rounded focus:outline-none focus:border-[#eba312] transition-colors resize-none p-1"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-2" htmlFor="phone">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full bg-white text-gray-900 text-sm font-light border-b-2 border-gray-300 rounded focus:outline-none focus:border-[#eba312] transition-colors resize-none p-1"
          />
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium mb-2" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-white text-gray-900 text-sm font-light border-b-2 border-gray-300 rounded focus:outline-none focus:border-[#eba312] transition-colors resize-none p-1"
          />
        </div>

        <button
          type="submit"
          className="bg-amber-500 text-white py-2 px-4 rounded hover:bg-amber-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </>
  )
);

EnquiryBoard.displayName = 'EnquiryBoard';

// Memoized slide component - exact same styling
const Slide = memo(({ slide, index, isActive, length }) => (
  <div
    className={`absolute top-0 left-0 w-full h-full transition-opacity duration-700 ease-in-out ${isActive ? 'opacity-100' : 'opacity-0'}`}
  >
    <img
      src={slide.src}
      alt={slide.alt}
      className="w-full h-full object-cover"
      loading={index === 0 ? 'eager' : 'lazy'}
    />

    <div className="numbertext absolute top-0 left-0 text-white p-2 text-sm opacity-0 group-hover:opacity-90">
      {index + 1} / {length}
    </div>
  </div>
));

Slide.displayName = 'Slide';

// Memoized thumbnail component - exact same styling
const Thumbnail = memo(({ slide, index, isActive, onClick }) => (
  <div className="">
    <img
      className={`demo cursor-pointer w-full h-[8vh] lg:h-[15vh] object-cover ${isActive ? 'opacity-100' : 'opacity-60'}`}
      src={slide.src}
      alt={slide.alt}
      onClick={onClick}
      loading="eager"
    />
  </div>
));

Thumbnail.displayName = 'Thumbnail';

// Helper function to format date
const formatSubmittedAt = () => {
  const date = new Date();

  // Get day with leading zero
  const day = date.getDate().toString().padStart(2, '0');

  // Get month abbreviation
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = months[date.getMonth()];

  // Get full year
  const year = date.getFullYear();

  // Get hours in 12-hour format
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  // Get minutes with leading zero
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
};

const PropertyEnquiry = memo(({ propertyData }) => {
  const [slideIndex, setSlideIndex] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    property: '',
    submittedAt: '',
  });

  // Use refs for touch tracking to prevent re-renders
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Memoized navigation functions
  const plusSlides = useCallback(
    (n) => {
      setSlideIndex(
        (prev) =>
          ((prev - 1 + n + propertyData?.propertyImages.length) %
            propertyData?.propertyImages.length) +
          1
      );
    },
    [propertyData.propertyImages.length]
  );

  const currentSlide = useCallback((index) => {
    setSlideIndex(index);
  }, []);

  // Touch handlers - using refs
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current - touchEndX.current > TOUCH_THRESHOLD) {
      plusSlides(1);
    } else if (touchEndX.current - touchStartX.current > TOUCH_THRESHOLD) {
      plusSlides(-1);
    }
  }, [plusSlides]);

  // Auto-play interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      plusSlides(1);
    }, SLIDE_INTERVAL);

    return () => clearInterval(intervalId);
  }, [plusSlides]);

  // Form handlers
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Disable button
      setIsSubmitting(true);

      // Add submittedAt to form data
      const dataToSend = {
        ...formData,
        property: propertyData.name,
        submittedAt: formatSubmittedAt(),
      };

      const csrftoken = Cookies.get('csrftoken');
      try {
        const res = await axios.post('/visit-enquiry/', dataToSend, {
          headers: {
            'X-CSRFToken': csrftoken,
          },
        });
        alert(res.data.message);
        setFormData({
          name: '',
          phone: '',
          email: '',
          property: '',
          submittedAt: '',
        }); // Reset form on success
      } catch (error) {
        console.error('Error submitting enquiry:', error);
        alert('Failed to submit enquiry. Please try again.');
      } finally {
        // Re-enable button regardless of success or failure
        setIsSubmitting(false);
      }
    },
    [formData, propertyData.name]
  );

  // Memoize mapped lists
  const slidesList = useMemo(
    () =>
      propertyData?.propertyImages.map((slide, index) => (
        <Slide
          key={slide.id}
          slide={slide}
          index={index}
          isActive={slideIndex === index + 1}
          length={propertyData?.propertyImages.length}
        />
      )),
    [slideIndex, propertyData.propertyImages]
  );

  const thumbnailsList = useMemo(
    () =>
      propertyData?.propertyImages.map((slide, index) => (
        <Thumbnail
          key={slide.id}
          slide={slide}
          index={index}
          isActive={slideIndex === index + 1}
          onClick={() => currentSlide(index + 1)}
        />
      )),
    [slideIndex, currentSlide, propertyData.propertyImages]
  );

  const dotsList = useMemo(
    () =>
      propertyData?.propertyImages.map((_, index) => (
        <span
          key={index}
          className={`dot cursor-pointer w-2 h-2 mx-1 rounded-full ${slideIndex === index + 1 ? 'bg-amber-500' : 'bg-gray-300'}`}
          onClick={() => currentSlide(index + 1)}
        ></span>
      )),
    [slideIndex, currentSlide, propertyData.propertyImages]
  );

  // Memoized neighbourhood images grid
  const neighbourhoodGrid = useMemo(() => {
    if (!propertyData?.neighbourhoodImages?.length) return null;

    const images = propertyData.neighbourhoodImages;
    const allImages = images.flat(); // Flatten to handle each image individually
    const imageCount = allImages.length;

    // Determine grid columns based on image count and screen size
    const getGridCols = () => {
      // Mobile first (default for small screens)
      if (imageCount <= 2) return 'grid-cols-1'; // 1 per row for 1-2 images
      if (imageCount <= 4) return 'grid-cols-2'; // 2 per row for 3-4 images
      if (imageCount <= 6) return 'grid-cols-2 md:grid-cols-3'; // 2 on mobile, 3 on desktop
      return 'grid-cols-2 md:grid-cols-4'; // 2 on mobile, 4 on desktop for 8+ images
    };

    return (
      <div className={`grid ${getGridCols()} gap-2 md:gap-3 mb-5`}>
        {allImages.map((image, index) => (
          <div
            key={index}
            className="relative aspect-square overflow-hidden group"
          >
            <img
              src={image}
              alt={`Neighbourhood view ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    );
  }, [propertyData?.neighbourhoodImages]);

  return (
    <section className="pt-20 md:pt-[6rem]">
      <div className="mx-auto text-center py-10 md:p-[4rem]">
        {/* Slider and Thumbnails - EXACT same structure */}
        <div className="flex flex-col md:flex-row md:space-x-20 lg:mx-5">
          <div
            className="relative w-full overflow-hidden group"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative w-full h-[50vh] md:h-[75vh]">
              {slidesList}
            </div>

            <button
              className="prev absolute top-[50%] left-0 transform -translate-y-1/2 text-4xl text-white py-2 px-4 hidden md:block opacity-0 group-hover:opacity-90 transition-opacity duration-300"
              onClick={() => plusSlides(-1)}
            >
              ❮
            </button>
            <button
              className="next absolute top-[50%] right-0 transform -translate-y-1/2 text-4xl text-white py-2 px-4 hidden md:block opacity-0 group-hover:opacity-90 transition-opacity duration-300"
              onClick={() => plusSlides(1)}
            >
              ❯
            </button>
          </div>

          <div className="flex justify-center hidden lg:block">
            {thumbnailsList}
          </div>
        </div>

        {/* Dots - EXACT same styling */}
        <div className="flex justify-center mt-[2rem] md:mb-[2rem] lg:mb-[4rem]">
          {dotsList}
        </div>

        {/* Main Content - EXACT same structure */}
        <div className="flex flex-col lg:flex-row md:space-x-10">
          <div className="lg:w-[55vw]">
            {/* Property Description */}
            <div className="p-3 lg:p-8 text-left rounded-lg lg:border md:border-slate-200 md:mt-0 m-5">
              <h3 className="text-2xl font-semibold my-3 text-[#eba312]">
                {propertyData?.name} ({propertyData?.location})
              </h3>
              <p>{propertyData?.desc}</p>
            </div>

            {/* Mobile Price Board */}
            <div className="p-10 border border-[#eba312] rounded-lg m-5 lg:hidden">
              <PriceBoard priceBoardData={propertyData?.priceBoardData} />
            </div>

            {/* Address Section */}
            <div className="p-8 text-left rounded-lg border md:border-slate-200 md:mt-8 m-5">
              <h3 className="text-xl font-semibold my-5 text-[#eba312]">
                Address
              </h3>
              <p>{propertyData?.address}</p>
              <MapComponent mapUrl={propertyData?.mapURL} />
            </div>

            {/* Amenities */}
            <div className="p-8 text-left rounded-lg border md:border-slate-200 md:mt-8 m-5">
              <IconSlider />
            </div>

            {/* Neighbourhood Section - USING NEIGHBOURHOOD_IMAGES */}
            <div className="p-8 text-left rounded-lg border md:border-slate-200 md:mt-8 m-5">
              <h3 className="text-xl font-semibold my-5 text-[#eba312]">
                Neighbourhood from {propertyData?.name}
              </h3>
              {neighbourhoodGrid}
            </div>

            {/* House Rules */}
            <div className="p-8 text-left rounded-lg border md:border-slate-200 md:mt-8 m-5">
              <h3 className="text-xl font-semibold my-5 text-[#eba312]">
                Basic House Rules For Comfortable Stay
              </h3>
              <ul>
                <li className="mb-5">
                  <span className="font-semibold">Move-in/Move-out:</span>&nbsp;
                  Move-in is permitted after 3:00 PM and move-out must be
                  completed before 10:00 AM. Keep valuables locked. Management
                  is not responsible for lost or stolen items. CCTV footage for
                  common areas is available upon request (up to 10 days).
                  Delivery personnel are not allowed inside.
                </li>
                <li className="mb-5">
                  <span className="font-semibold">Guest Policy:</span>&nbsp;
                  Only single or full occupancy is allowed, subject to approval
                  and as outlined in the agreement. Guests are strictly
                  prohibited in double or shared occupancy.Conserve water and
                  electricity. Maintain cleanliness in your room and common
                  areas.
                </li>
                <li className="mb-5">
                  <span className="font-semibold">Repairs & Electricity:</span>
                  &nbsp; A cool-off period applies before repair costs become
                  your responsibility (see agreement). Costs are shared for
                  shared accommodations. Electricity is pay-as-you-go with smart
                  meters, including power backup. Report maintenance issues
                  immediately.
                </li>
                <li className="mb-5">
                  <span className="font-semibold">Noise & Substances:</span>
                  &nbsp; Maintain low noise levels in rooms and common areas.
                  Smoking and drinking are prohibited in common areas with a
                  ₹1000 fine for the first offense and potential eviction for
                  repeated violations. Drugs are strictly prohibited, resulting
                  in eviction and police reporting.
                </li>
              </ul>
            </div>

            {/* Mobile Enquiry Board */}
            <div className="p-10 rounded-lg border border-[#eba312] m-5 lg:hidden">
              <EnquiryBoard
                formData={formData}
                isSubmitting={isSubmitting}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
              />
            </div>
          </div>

          {/* Desktop Sticky Sidebar */}
          <div className="relative md:m-0 hidden lg:block lg:w-[40vw]">
            <div className="sticky top-10 pb-5">
              <div className="p-10 border border-[#eba312] rounded-lg mb-10">
                <PriceBoard priceBoardData={propertyData?.priceBoardData} />
              </div>

              <div className="p-10 border border-[#eba312] rounded-lg shadow-custom">
                <EnquiryBoard
                  formData={formData}
                  isSubmitting={isSubmitting}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

PropertyEnquiry.displayName = 'PropertyEnquiry';

export default PropertyEnquiry;
