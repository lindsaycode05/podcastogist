'use client';

import { PricingTable as ClerkPricingTable } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import { isMockAuthClient } from '@/lib/_tests_/mock-flags-client';

export const PricingTable = () => {
  if (isMockAuthClient()) {
    return (
      <div className='flex justify-center w-full'>
        <div className='max-w-5xl w-full glass-card rounded-3xl p-10 text-center'>
          <h2 className='text-3xl font-extrabold mb-4'>Pricing</h2>
          <p className='text-gray-600 dark:text-slate-300 mb-8'>
            Mock auth is enabled. Billing UI is disabled in test mode.
          </p>
          <div className='grid gap-6 md:grid-cols-3'>
            {['Free', 'Plus', 'Max'].map((plan) => (
              <div
                key={plan}
                className='rounded-2xl border border-border p-6 bg-white/70 dark:bg-slate-900/60'
              >
                <p className='text-xl font-bold mb-2'>{plan}</p>
                <p className='text-sm text-muted-foreground'>
                  Plan preview placeholder
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex justify-center w-full'>
      <div className='max-w-6xl w-full'>
        <ClerkPricingTable
          appearance={{
            elements: {
              pricingTableCardHeader: {
                background: 'var(--gradient-sunrise)',
                color: 'white',
                borderRadius: '1rem 1rem 0 0',
                padding: '2.5rem'
              },
              pricingTableCardTitle: {
                fontSize: '2.25rem',
                fontWeight: '800',
                color: 'white',
                marginBottom: '0.5rem'
              },
              pricingTableCardDescription: {
                fontSize: '1.1rem',
                color: 'rgba(255, 255, 255, 0.95)',
                fontWeight: '500'
              },
              pricingTableCardFee: {
                color: 'white',
                fontWeight: '800',
                fontSize: '3rem'
              },
              pricingTableCardFeePeriod: {
                color: 'rgba(255, 255, 255, 0.85)',
                fontSize: '1.1rem'
              },
              pricingTableCard: {
                borderRadius: '1rem',
                border: '1px solid var(--border)',
                boxShadow: '0 10px 40px rgba(59, 130, 246, 0.15)',
                transition: 'all 0.3s ease',
                overflow: 'hidden',
                background: 'var(--card)',
                backdropFilter: 'blur(10px)'
              },
              pricingTableCardBody: {
                padding: '2.5rem',
                '> div:nth-child(2)': {
                  backgroundColor: 'var(--card)'
                }
              },
              pricingTableCardFeatures: {
                marginTop: '2rem',
                gap: '1rem',
                background: 'var(--card)',
                color: 'var(--card-foreground)',
                borderTopColor: 'var(--passive-border)'
              },
              pricingTableCardFeature: {
                fontSize: '1.05rem',
                padding: '0.75rem 0',
                fontWeight: '500',
                color: 'var(--card-foreground)'
              },
              pricingTableCardFeaturesListItemTitle: {
                color: 'var(--card-foreground)'
              },
              pricingTableCardFeaturesListItem: {
                '> svg': { color: 'var(--card-foreground)' }
              },
              pricingTableCardButton: {
                marginTop: '2rem',
                borderRadius: '0.75rem',
                fontWeight: '700',
                padding: '1rem 2.5rem',
                transition: 'all 0.2s ease',
                fontSize: '1.1rem',
                background: 'var(--gradient-sunrise)',
                border: 'none',
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
              },
              pricingTableCardFeePeriodNotice: {
                color: 'white'
              },
              pricingTableCardFooter: {
                borderTopColor: 'var(--passive-border)'
              }
            }
          }}
          fallback={
            <div className='flex items-center justify-center py-20'>
              <div className='text-center space-y-4 glass-card p-12 rounded-2xl'>
                <Loader2 className='h-16 w-16 animate-spin text-blue-600 dark:text-blue-400 mx-auto' />
                <p className='text-gray-600 dark:text-slate-300 text-lg font-medium'>
                  Loading pricing options...
                </p>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};
