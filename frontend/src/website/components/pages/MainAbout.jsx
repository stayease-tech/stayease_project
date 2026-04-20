import PageHeader from '../global-components/PageHeader'
import About from '../section-components/About'

const MainAbout = () => {
    return <div>
        <PageHeader headertitle="About Us" />
        <About property="hidden" marginBottom = 'mt-[3rem] md:mt-[3rem] lg:mt-[6rem] mb-[15rem] md:mb-[0rem] lg:mb-[5.5rem]' />
    </div>
}

export default MainAbout
