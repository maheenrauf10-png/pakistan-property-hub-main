import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import CityShowcase from '@/components/home/CityShowcase';
import CategorySection from '@/components/home/CategorySection';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedProperties />
      <CategorySection />
      <CityShowcase />
    </Layout>
  );
};

export default Index;
