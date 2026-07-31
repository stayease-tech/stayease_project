import PageHeader from '../global-components/PageHeader';
import FeaturedProperties from '../section-components/FeaturedProperties';
import { useProperties } from '../contexts/PropertyContext';

const Properties = () => {
  const { properties } = useProperties();

  return (
    <div>
      <PageHeader headertitle="Our Properties" />
      <FeaturedProperties
        marginTop="!my-[3rem] lg:my-10"
        properties={properties}
      />
    </div>
  );
};

export default Properties;
