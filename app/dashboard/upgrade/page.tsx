/**
 * Upgrade Page
 *
 * Displays pricing table with contextual messaging based on why user is upgrading.
 * Uses Clerk's PricingTable component to handle subscriptions.
 *
 * Query Parameters:
 * - reason: file_size | duration | projects | feature
 * - feature: (optional) specific feature name if reason=feature
 *
 * Examples:
 * - /dashboard/upgrade?reason=file_size
 * - /dashboard/upgrade?reason=projects
 * - /dashboard/upgrade?reason=feature
 */

import { auth } from '@clerk/nextjs/server';
import {
  ArrowLeft,
  HardDrive,
  Clock3,
  FolderKanban,
  Star,
  Rocket,
  Loader2,
  ArrowBigUpDash,
} from 'lucide-react';
import Link from 'next/link';
import { PricingTable } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { PODCASTOGIST_USER_PLANS } from '@/lib/tier-config';
import { capitalize } from '@/lib/utils/utils';

interface UpgradePageProps {
  searchParams: Promise<{
    reason?: string;
    feature?: string;
  }>;
}

/**
 * Get contextual messaging based on upgrade reason
 */
const getUpgradeMessage = (reason?: string, feature?: string) => {
  switch (reason) {
    case 'file_size':
      return {
        title: 'Upgrade for Larger Files',
        description:
          "Your file exceeds your plan's size limit. Upgrade to Plus for 200MB uploads or Max for 3GB uploads.",
        icon: HardDrive,
      };
    case 'duration':
      return {
        title: 'Upgrade for Longer Podcasts',
        description:
          "Your podcast exceeds your plan's duration limit. Upgrade to Plus for 2-hour podcasts or Max for unlimited duration.",
        icon: Clock3,
      };
    case 'projects':
      return {
        title: "You've Reached Your Project Limit",
        description:
          'Upgrade to create more projects. Plus: 30 projects, Max: unlimited projects.',
        icon: FolderKanban,
      };
    case 'feature':
      return {
        title: `Unlock ${feature || 'Premium Features'}`,
        description:
          'Access advanced AI features like social posts, YouTube timestamps, and highlight moments by upgrading your plan.',
        icon: Star,
      };
    default:
      return {
        title: 'Upgrade Your Plan',
        description:
          'Get access to more projects, larger files, and advanced AI features.',
        icon: Rocket,
      };
  }
};

/**
 * Detect current plan using Clerk's has() method
 */
const getCurrentPlan = (authObj: Awaited<ReturnType<typeof auth>>) => {
  const { has } = authObj;
  if (has?.({ plan: PODCASTOGIST_USER_PLANS.MAX }))
    return PODCASTOGIST_USER_PLANS.MAX;
  if (has?.({ plan: PODCASTOGIST_USER_PLANS.PLUS }))
    return PODCASTOGIST_USER_PLANS.PLUS;
  return PODCASTOGIST_USER_PLANS.FREE;
};

const UpgradePage = async ({ searchParams }: UpgradePageProps) => {
  const { reason, feature } = await searchParams;
  const message = getUpgradeMessage(reason, feature);
  const Icon = message.icon;

  const authObj = await auth();
  const currentPlan = getCurrentPlan(authObj);

  return (
    <div className='min-h-screen mesh-background-subtle'>
      <div className='glass-nav border-b'>
        <div className='container mx-auto px-4 py-6'>
          <Link
            href='/dashboard/projects'
            className='inline-flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-3xl mx-auto text-center mb-16'>
          <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6'>
            <Icon className='h-10 w-10 text-gray-700' />
          </div>
          <h1 className='text-5xl font-extrabold mb-6'>
            <span className='gradient-sunrise-text'>{message.title}</span>
          </h1>
          <p className='text-xl text-gray-600 mb-8 leading-relaxed'>
            {message.description}
          </p>

          <div className='flex items-center justify-center gap-2 text-base text-gray-600'>
            <span>Current plan:</span>
            <Badge
              className={
                currentPlan === PODCASTOGIST_USER_PLANS.MAX
                  ? 'gradient-sunrise text-white px-4 py-1.5'
                  : 'bg-gray-200 text-gray-700 px-4 py-1.5'
              }
            >
              {currentPlan === PODCASTOGIST_USER_PLANS.MAX && (
                <ArrowBigUpDash className='h-4 w-4 mr-1' />
              )}
              {currentPlan === PODCASTOGIST_USER_PLANS.FREE &&
                capitalize(PODCASTOGIST_USER_PLANS.FREE)}
              {currentPlan === PODCASTOGIST_USER_PLANS.PLUS &&
                capitalize(PODCASTOGIST_USER_PLANS.PLUS)}
              {currentPlan === PODCASTOGIST_USER_PLANS.MAX &&
                capitalize(PODCASTOGIST_USER_PLANS.MAX)}
            </Badge>
          </div>
        </div>

        <div className='flex justify-center w-full'>
          <div className='max-w-6xl w-full'>
            <PricingTable
              appearance={{
                elements: {
                  pricingTableCardHeader: {
                    background:
                      'linear-gradient(135deg, rgb(59 130 246), rgb(249 115 22))',
                    color: 'white',
                    borderRadius: '1rem 1rem 0 0',
                    padding: '2.5rem',
                  },
                  pricingTableCardTitle: {
                    fontSize: '2.25rem',
                    fontWeight: '800',
                    color: 'white',
                    marginBottom: '0.5rem',
                  },
                  pricingTableCardDescription: {
                    fontSize: '1.1rem',
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontWeight: '500',
                  },
                  pricingTableCardFee: {
                    color: 'white',
                    fontWeight: '800',
                    fontSize: '3rem',
                  },
                  pricingTableCardFeePeriod: {
                    color: 'rgba(255, 255, 255, 0.85)',
                    fontSize: '1.1rem',
                  },
                  pricingTableCard: {
                    borderRadius: '1rem',
                    border: '2px solid rgb(59 130 246 / 0.2)',
                    boxShadow: '0 10px 40px rgba(59, 130, 246, 0.15)',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                  },
                  pricingTableCardBody: {
                    padding: '2.5rem',
                  },
                  pricingTableCardFeatures: {
                    marginTop: '2rem',
                    gap: '1rem',
                  },
                  pricingTableCardFeature: {
                    fontSize: '1.05rem',
                    padding: '0.75rem 0',
                    fontWeight: '500',
                  },
                  pricingTableCardButton: {
                    marginTop: '2rem',
                    borderRadius: '0.75rem',
                    fontWeight: '700',
                    padding: '1rem 2.5rem',
                    transition: 'all 0.2s ease',
                    fontSize: '1.1rem',
                    background:
                      'linear-gradient(135deg, rgb(59 130 246), rgb(249 115 22))',
                    border: 'none',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  },
                  pricingTableCardFeePeriodNotice: {
                    color: 'white',
                  },
                },
              }}
              fallback={
                <div className='flex items-center justify-center py-20'>
                  <div className='text-center space-y-4 glass-card p-12 rounded-2xl'>
                    <Loader2 className='h-16 w-16 animate-spin text-blue-600 mx-auto' />
                    <p className='text-gray-600 text-lg font-medium'>
                      Loading pricing options...
                    </p>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePage;
