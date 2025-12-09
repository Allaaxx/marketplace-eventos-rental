import { Hero } from '@/components/home/Hero';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { HowItWorks } from '@/components/home/HowItWorks';
import { Categories } from '@/components/home/Categories';

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <HowItWorks />
    </>
  );
}
