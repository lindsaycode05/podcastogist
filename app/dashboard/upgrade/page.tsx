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
  ArrowBigUpDash
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { PODCASTOGIST_USER_PLANS } from '@/lib/tier-config';
import { capitalize } from '@/lib/utils/utils';
import { PricingTable } from '@/components/home/pricing-table';

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
        icon: HardDrive
      };
    case 'duration':
      return {
        title: 'Upgrade for Longer Podcasts',
        description:
          "Your podcast exceeds your plan's duration limit. Upgrade to Plus for 2-hour podcasts or Max for unlimited duration.",
        icon: Clock3
      };
    case 'projects':
      return {
        title: "You've Reached Your Project Limit",
        description:
          'Upgrade to create more projects. Plus: 30 projects, Max: unlimited projects.',
        icon: FolderKanban
      };
    case 'feature':
      return {
        title: `Unlock ${feature || 'Premium Features'}`,
        description:
          'Access advanced AI features like social posts, YouTube timestamps, and highlight moments by upgrading your plan.',
        icon: Star
      };
    default:
      return {
        title: 'Upgrade Your Plan',
        description:
          'Get access to more projects, larger files, and advanced AI features.',
        icon: Rocket
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
            className='inline-flex items-center text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <div className='container mx-auto px-4 py-16'>
        <div className='max-w-3xl mx-auto text-center mb-16'>
          <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800/70 mb-6'>
            <Icon className='h-10 w-10 text-gray-700 dark:text-slate-200' />
          </div>
          <h1 className='text-5xl font-extrabold mb-6'>
            <span className='gradient-sunrise-text'>{message.title}</span>
          </h1>
          <p className='text-xl text-gray-600 dark:text-slate-300 mb-8 leading-relaxed'>
            {message.description}
          </p>

          <div className='flex items-center justify-center gap-2 text-base text-gray-600 dark:text-slate-300'>
            <span>Current plan:</span>
            <Badge
              className={
                currentPlan === PODCASTOGIST_USER_PLANS.MAX
                  ? 'gradient-sunrise text-white px-4 py-1.5'
                  : 'bg-gray-200 text-gray-700 px-4 py-1.5 dark:bg-slate-800 dark:text-slate-100'
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
        <PricingTable />
      </div>
    </div>
  );
};

export default UpgradePage;
