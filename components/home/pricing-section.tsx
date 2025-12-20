import { PricingTable } from './pricing-table';

export const PricingSection = () => {
  return (
    <section className='relative py-24 md:py-32 overflow-hidden'>
      {/* Gradient background */}
      <div className='absolute inset-0 mesh-background-subtle'></div>

      <div className='container mx-auto px-4 relative z-10'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl md:text-5xl font-bold mb-6'>
              Clear, <span className='gradient-sunrise-text'>Honest</span>{' '}
              Pricing
            </h2>
            <p className='text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto'>
              Pick the plan that works for you. Upgrade, switch, or cancel
              whenever you need.
            </p>
          </div>
          <PricingTable />
        </div>
      </div>
    </section>
  );
};
