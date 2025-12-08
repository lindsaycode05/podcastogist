import { Header } from '@/components/header';
import { HeroSection } from '@/components/home/hero-section';
import { FeaturesSection } from '@/components/home/features-section';

export default function Home() {
  return (
    <div>
      <Header />
      <HeroSection />
      <FeaturesSection />
    </div>
  );
}
