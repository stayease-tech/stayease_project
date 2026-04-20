import { useRef, useCallback, useMemo, memo } from 'react'

// Table of contents data - defined outside component
const TABLE_OF_CONTENTS = [
    { id: 1, ref: 'sectionRef1', title: 'Acceptance of terms of service' },
    { id: 2, ref: 'sectionRef2', title: 'Collection of personal information' },
    { id: 3, ref: 'sectionRef3', title: 'Use of cookies and other tracking tools' },
    { id: 4, ref: 'sectionRef4', title: 'How personal information is used' },
    { id: 5, ref: 'sectionRef5', title: 'Change in privacy policy' },
    { id: 6, ref: 'sectionRef6', title: 'Third-Party Services' }
]

// Memoized table of contents component
const TableOfContents = memo(({ scrollToSection }) => (
    <section className='relative hidden md:block'>
        <div className='sticky top-[10%] border border-white rounded-lg w-[25vw] h-[12%] px-8 shadow-lg'>
            <h4 className='text-xl md:text-2xl pt-[3rem] pb-[1.5rem] text-center font-semibold'>
                Table of Contents
            </h4>
            <ol className='space-y-3'>
                {TABLE_OF_CONTENTS.map((item) => (
                    <li key={item.id}>
                        <button
                            onClick={() => scrollToSection(item.ref)}
                            className='mb-3 hover:text-[#eba312] text-left underline transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 rounded px-2 py-1'
                            aria-label={`Scroll to ${item.title}`}
                        >
                            {item.id}. {item.title}
                        </button>
                    </li>
                ))}
            </ol>
        </div>
    </section>
))

TableOfContents.displayName = 'TableOfContents'

// Memoized section component
const PolicySection = memo(({ title, children, sectionRef }) => (
    <>
        <h4 ref={sectionRef} className='text-xl md:text-2xl pt-[3rem] pb-[1.5rem] font-semibold text-[#eba312]'>
            {title}
        </h4>
        <ul className='list-disc pl-5 space-y-4'>
            {children}
        </ul>
    </>
))

PolicySection.displayName = 'PolicySection'

function PrivacyPolicy() {
    // Create stable refs using useRef (these are stable and don't change)
    const sectionRef1 = useRef(null)
    const sectionRef2 = useRef(null)
    const sectionRef3 = useRef(null)
    const sectionRef4 = useRef(null)
    const sectionRef5 = useRef(null)
    const sectionRef6 = useRef(null)

    // Memoize the refs object to prevent recreation on each render
    const sectionRefs = useMemo(() => ({
        sectionRef1,
        sectionRef2,
        sectionRef3,
        sectionRef4,
        sectionRef5,
        sectionRef6
    }), [
        sectionRef1,
        sectionRef2,
        sectionRef3,
        sectionRef4,
        sectionRef5,
        sectionRef6
    ]) // Dependencies are the stable refs

    // Memoized scroll function - with proper dependencies
    const scrollToSection = useCallback((refKey) => {
        sectionRefs[refKey]?.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        })
    }, [sectionRefs]) // Now sectionRefs is stable due to useMemo

    return (
        <div className='pt-[8rem] md:pt-[10rem] pb-[1rem] md:pb-[2rem] px-[1rem] md:px-[5rem] lg:px-[8rem]'>
            {/* Header */}
            <div className='text-center mb-5'>
                <h1 className="text-2xl md:text-4xl font-semibold my-3 md:my-5 text-[#eba312]">
                    Privacy Policy
                </h1>
            </div>

            {/* Main Content with Table of Contents */}
            <div className='flex flex-col md:flex-row md:space-x-20 mt-[2rem] md:mt-[5rem] pb-[2rem] lg:pb-[5rem]'>
                {/* Table of Contents - Desktop */}
                <TableOfContents scrollToSection={scrollToSection} />

                {/* Policy Content */}
                <section className='md:w-[70%]'>
                    {/* Introduction */}
                    <p className='leading-relaxed'>
                        The privacy policy (“Policy”) is applicable to the online interfaces of Estancia Ease Private Limited (Under the brand name of “Stayease”) (“Stayease”, “us”, “we” or “our”) including www.mystayease.com, the mobile site/applications (including but not limited to the Stayease Member or any other app for iOS, Android, or any other windows operating system collectively referred to as “Site”). The purpose of this Policy is to describe how Stayease collects, uses, maintains and shares information about you (“user” or “you” or “your”) on account of you accessing and using the platform. This information may include but is not limited to any information you upload, emails that you exchange with Stayease and other users of the platform and any information submitted/ provided by you to Stayease.
                    </p>

                    {/* Section 1 */}
                    <PolicySection title="Acceptance of terms of service" sectionRef={sectionRefs.sectionRef1}>
                        <li>By registering for and/or using the Services in any manner, including but not limited to visiting or browsing the Site, user agrees to these Terms of Service and all other operating rules, policies, and procedures that may be published from time to time on the Site by the Company, each of which is incorporated by reference and each of which may be updated from time to time without notice to the user.</li>
                        <li>Certain of the Services may be subject to additional terms and conditions specified by the Company from time to time; use of such Services by the user is subject to those additional terms and conditions, which are incorporated into these Terms of Service by this reference.</li>
                        <li>These Terms of Service apply to all users of the Services, including, without limitation, users who are contributors of content, information, and other materials or services, registered or otherwise.</li>
                    </PolicySection>

                    {/* Section 2 */}
                    <PolicySection title="Collection of personal information" sectionRef={sectionRefs.sectionRef2}>
                        <li>“Personal information” is defined to include information that whether on its own or in combination with other information may be used to readily identify or contact you such as: name, address, email address, phone number etc. The type of personal information that we collect from you varies based on your particular interaction with our Website. Personal information collected shall include but is not limited to name, gender, age, bank account, password, postal address, phone number, email address, contact, ID proof (PAN, Passport, Aadhar, Voter ID etc.), bank account/credit card/debit card details, proof of employment, proof of educational background, and other information that would assist us in verifying your identity.</li>
                        <li>We may also collect personal information that you post in your profile, requests or feedback, and any comments or discussions you post in any blog, chat, or other correspondence site on the Platform. In our sole and absolute discretion, we may also ask for and collect supplemental information from third parties, such as information about your credit from a credit bureau (to the extent permitted by law), or information to verify any identification details you provided during registration.</li>
                        <li>You undertake that your personal information shall at all times be accurate, complete and up to date. We shall also make reasonable efforts to provide you with the opportunity to request correction of your personal information provided to us if the same is inaccurate; or even to delete the personal information, if so requested and subject to applicable law. Further, we may decline to process requests which we find to be contrary to the terms laid down under this Policy, Platform terms and conditions or any applicable laws, require disproportionate technical effort, jeopardize the privacy of others or are extremely impractical.</li>
                    </PolicySection>

                    {/* Section 3 */}
                    <PolicySection title="Use of cookies and other tracking tools" sectionRef={sectionRefs.sectionRef3}>
                        <li>To improve the responsiveness of the websites for you, Stayease may use "cookies", or similar electronic tools to collect information to assign each visitor a unique, random number as a User Identification (User ID) to understand the user's individual interests using the Identified Computer. Unless the user voluntarily identifies himself/herself (through registration, for example), Stayease will have no way of knowing who the user is, even if Stayease assign a cookie to the user's computer. The only Personal Information a cookie can contain is information the user supplies. A cookie cannot read data off the hard drive. Stayease's advertisers may also assign their own cookies to the user's browser (if the user clicks on their ads), a process that Stayease do not control.</li>
                        <li>Stayease web servers automatically collect limited information about the user's computer's connection to the Internet, including the IP address, when he/she visits the Website. The IP address does not identify a user personally. Stayease uses this information to deliver its web pages to the user upon request, to tailor the Website to the interests of its users, to measure traffic within the Website and let advertisers know the geographic locations from where the visitors come.</li>
                        <li>When a user uses one of the location-enabled services (for example, when he/she access Services from a mobile device), Stayease may collect and process information about the mobile device's GPS location (including the latitude, longitude of your mobile device) and the time the location information is recorded to customize the Services with location-based information and features (for example, to inform you about restaurants in your area or applicable promotions). Some of these services require personal data for the feature to work and Stayease may associate location data with the user's device ID and other information. If a user wishes to use the particular feature, he/she will be asked to consent to the user's data being used for this purpose. The user can withdraw his/her consent at any time by disabling the GPS or other location-tracking functions on the device, provided the device allows this. After Seeing the device manufacturer's instructions for further details.</li>
                    </PolicySection>

                    {/* Section 4 */}
                    <PolicySection title="How personal information is used" sectionRef={sectionRefs.sectionRef4}>
                        <li>We collect your personal information and aggregate information about the use of our Platform and Services to better understand your needs and to provide you with a better Platform experience. Specifically, we may use your personal information for any of the following reasons mentioned To provide our Services to you, including registering you for our Services, verifying your identity and authority to use our Services, and to otherwise enable you to use our Platform and our Services.</li>
                        <li>For customer support and to respond to your inquiries.</li>
                        <li>For internal book-keeping purposes</li>
                        <li>To process billing and payment, including sharing with third party payment gateways connection with Platform and/or Services.</li>
                        <li>To improve and maintain our Platform and our Services (for example, we track information entered through the "Search" function; this helps us determine which areas of our Platform users like best and areas that we may want to enhance; we also will use for trouble shooting purposes, where applicable).</li>
                        <li>To periodically send promotional emails to the email address you provide regarding new launches/Products offered by Stayease, special offers from or other information about Stayease that we think you may find interesting/relevant.</li>
                        <li>To contact you via email, telephone, facsimile or mail, or, where requested, by text message, to deliver certain services or information you have requested.</li>
                        <li>For market research purposes, including, but not limited to, the customization of the Platform according to your interests.</li>
                        <li>We may use your demographic information (i.e., age, postal code, residential and commercial addresses, and other various data) to more effectively facilitate the promotion of goods and services to appropriate target audiences and for other research and analytical purposes.</li>
                        <li>To resolve disputes, to protect ourselves and other users of our Platform and Services, and to enforce our Platform's terms and conditions</li>
                        <li>We also may compare personal information collected through the Platform and Services To verify its accuracy with personal information collected from third parties and we may combine aggregate data with the personal information we collect about you.</li>
                        <li>From time to time, Stayease may use personal information for new and unanticipated uses not previously disclosed in our Privacy Policy. If our information practices change regarding information previously collected, Stayease shall make reasonable efforts to provide notice and obtain consent of any such uses as may be required by law.</li>
                    </PolicySection>

                    {/* Section 5 */}
                    <PolicySection title="Change in privacy policy" sectionRef={sectionRefs.sectionRef5}>
                        <li>Stayease reserves the right at any time, at its sole discretion, to change or otherwise modify the Policy without prior notice, and your continued access or use of this Website signifies your acceptance of the updated or modified Policy. However, if we make any material change to the policy, we will notify you by means of a notice on this Website prior to the change becoming effective. A material change is a change made by Stayease in the following clauses of the privacy policy,<br /><br /> (1) Privacy Policy use and applicability<br /> (2) Third Party Usage of Data<br /> (3) Disclosure</li>
                    </PolicySection>

                    {/* Section 6 */}
                    <PolicySection title="Third-Party Services" sectionRef={sectionRefs.sectionRef6}>
                        <li>All the services, which are not directly and exclusively provided by the Company are third party services. Unless the service provided is classified as being provided by the Company, it is deemed to be a third party service. The Company, for the sake of convenience of the user, may provide links/information of third party websites, services or resources available on the Internet. All transactions of the user with the third party resources on the Internet, shall be at the own risk of the user and no liability/claim shall be made to the Company for any deficiency, loss or harm caused to the user due to the use of such third party services.</li>
                        <li>The user acknowledges that these third party resources are not under the control of the Company, and the License acknowledges that Company is not responsible or liable for the content, functions, accuracy, legality, appropriateness or any other aspect of such websites or resources. The inclusion of any such link on the website of the Company does not imply its endorsement or any association between the Company and any third party operators.</li>
                        <li>Including but not limited to the services mentioned below, the following shall be considered to be third party services and Rectification of any fault in Third Party Services such as Wifi, Lift, Electricity, Water Supply, Water Tanker, DG Fuel,,Inverter, repair or replacement of electrical appliances - TV, AC, Induction stove, Microwave oven, Geyser, Kitchen inventories etc, shall be carried out as per the TAT policy of Stayease. However, no request for waiver in the rent will be entertained for the non-availability of any of such services.</li>
                    </PolicySection>
                </section>
            </div>
        </div>
    )
}

export default memo(PrivacyPolicy)