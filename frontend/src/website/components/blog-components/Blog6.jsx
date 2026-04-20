import React from 'react'

function Blog6() {
    let publicUrl = process.env.PUBLIC_URL + '/'

    return (
        <div className='bg-white text-black px-[1rem] md:px-[8rem] pb-[3rem] pt-[8rem]'>
            <h1 className='text-xl md:text-3xl lg:text-5xl font-semibold my-3 md:my-5'>Rent Right or Regret Later: Why a Rental Agreement is a Must-Have!</h1>

            <h6 className='font-semibold pt-[3rem]'>Uma Ghosh</h6>

            <div className='flex gap-7'>
                <p>Feb 22, 2025</p>
                <ul className='list-disc'>
                    <li>3 min read</li>
                </ul>
            </div>

            <hr className="my-8" />

            <ul>
                <li className='pb-8'>
                    <p>Whether you are the landlord or the renter, renting a property is a big commitment
                        with rights and obligations. However, in the absence of a formal rental agreement,
                        both parties can encounter a number of difficulties that could result in monetary and
                        legal issues. By outlining the terms and circumstances of the rental relationship, a
                        rental agreement acts as a safeguard and makes sure that both landlords and
                        tenants are aware of their responsibilities.</p>
                </li>
            </ul>

            <div className='flex justify-center pb-8'>
                <img src={publicUrl + "static/img/blog/blog_img7.jpg"} alt={`Blog_Image`} className="h-[35vh] md:w-[60vw] md:h-[70vh] mt-5" />
            </div>

            <ul className='pb-10'>
                <li className='pb-8'>
                    <h3 className='text-lg md:text-xl lg:text-2xl font-semibold'>Consequences of Not Having a Rental Agreement</h3>
                    <p>Failing to have a written rental agreement can lead to misunderstandings, conflicts,
                        and legal disputes. Here are some key issues that may arise in the absence of a
                        rental contract:</p>
                </li>

                <li className='pb-8'>
                    <h3 className='font-semibold'>1. Unregulated Rent Increases</h3>
                    <p>Tenants are left exposed financially since landlords can raise rent at any time without
                        a rental agreement. In order to give tenants certainty and stability, a written contract
                        usually contains provisions that control the frequency and percentage of rent
                        increases.</p>
                </li>

                <li className='pb-8'>
                    <h3 className='font-semibold'>2. Unclear Eviction Rules</h3>
                    <p>The terms under which a landlord may evict a tenant are outlined in a rental
                        agreement. Without one, landlords can find it difficult to get rid of troublesome
                        tenants who break verbal agreements, or tenants might face the possibility of an
                        unexpected eviction. The absence of a written agreement might impede legal
                        processes.</p>
                </li>

                <li className='pb-8'>
                    <h3 className='font-semibold'>3. Property Damage Liability</h3>
                    <p>Without a formal agreement defining the tenant&#39;s obligations, the landlord may find it
                        difficult to recoup repair costs if a renter destroys the property. Such costs are
                        typically covered by a security deposit clause in a rental agreement.</p>
                </li>

                <li className='pb-8'>
                    <h3 className='font-semibold'>4. Legal Uncertainty in Disputes</h3>
                    <p>It may be difficult for either side to substantiate their claims in court if the rental
                        agreement is unregistered or missing. A rental agreement is an essential piece of
                        legal documentation in any dispute involving unpaid rent, property damage, or other
                        issues.
                    </p>
                </li>

                <li className='pb-8'>
                    <h3 className='font-semibold'>5. Loss of Tax Benefits</h3>
                    <p>Rental agreements are frequently used by tenants to obtain tax exemptions for the
                        House Rent Allowance (HRA). They might not be able to receive these financial
                        benefits without a legal contract, which would increase their tax obligations.
                    </p>
                </li>

                <li className='pb-8'>
                    <h3 className='font-semibold'>6. Lack of Clarity on Notice Periods and Moving Out</h3>
                    <p>Tenants may vacate at any moment without giving advance warning if there is no
                        agreement in place, leaving landlords with empty homes and monetary losses. The
                        notice period needed to vacate the property is specified in a rental agreement, giving
                        both parties enough time to make the necessary preparations.
                    </p>
                </li>

                <li className='pb-8'>
                    <h3 className='font-semibold'>Conclusion</h3>
                    <p>To protect the rights of both landlords and tenants, a rental agreement is necessary.
                        It guarantees responsibility for property damage, guards against arbitrary eviction,
                        helps control rent hikes, and provides legal evidence in court. Landlords can obtain a
                        steady rental income, and tenants can receive tax benefits.
                        <br /><br />
                        Both parties should make sure they develop and sign a rental agreement that
                        precisely describes the terms and circumstances before leasing or renting out a
                        property. A document that is legally enforceable can be created with the assistance
                        of a legal expert, giving everyone concerned piece of mind and protection.
                    </p>
                </li>
            </ul>

            <h6 className='font-semibold'>Uma Ghosh</h6>

            <div className='flex gap-7'>
                <p>Feb 22, 2025</p>
                <ul className='list-disc'>
                    <li>3 min read</li>
                </ul>
            </div>

            <hr className="my-8" />

            {/* <div className='flex gap-8'>
                <div><Link to="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.mystayease.com%2Fpost%2Ftop-benefits-of-co-living-or-sharing-accommodation-for-millennials-in-bangalore" target='_blank' title="Facebook"><i className="text-lg fab fa-facebook" /></Link></div>
                <div><Link to="https://www.linkedin.com/feed/?linkOrigin=LI_BADGE&shareActive=true&shareUrl=https%3A%2F%2Fwww.mystayease.com%2Fpost%2Ftop-benefits-of-co-living-or-sharing-accommodation-for-millennials-in-bangalore" target='_blank' title="LinkedIn"><i className="text-lg fab fa-linkedin" /></Link></div>
                <div><Link to="https://www.pinterest.com/pin/create/button/?url=https://www.mystayease.com/post/top-benefits-of-co-living-or-sharing-accommodation-for-millennials-in-bangalore" target='_blank' title="Pinterest"><i className="text-lg fab fa-pinterest" /></Link></div>
                <div><Link to="https://x.com/intent/post?url=https%3A%2F%2Fwww.mystayease.com%2Fpost%2Ftop-benefits-of-co-living-or-sharing-accommodation-for-millennials-in-bangalore" target='_blank' title="Twitter"><i className="text-lg fab fa-twitter" /></Link></div>
            </div> */}
        </div>
    )
}

export default Blog6