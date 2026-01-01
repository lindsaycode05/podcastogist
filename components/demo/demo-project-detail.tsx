'use client';

import { useState } from 'react';
import { DemoGradientOrbs } from '@/components/demo/demo-gradient-orbs';
import { DemoNoticeBanner } from '@/components/demo/demo-notice-banner';
import { DemoProcessingFlow } from '@/components/demo/demo-processing-flow';
import { TabContent } from '@/components/project-detail/tab-content';
import {
  DesktopTabTrigger,
  MobileTabItem
} from '@/components/project-detail/tab-triggers';
import { HashtagsTab } from '@/components/project-tabs/hashtags-tab';
import { HighlightMomentsTab } from '@/components/project-tabs/highlight-moments-tab';
import { RecapsTab } from '@/components/project-tabs/recaps-tab';
import { SocialPostsTab } from '@/components/project-tabs/social-posts-tab';
import { TitlesTab } from '@/components/project-tabs/titles-tab';
import { TranscriptTab } from '@/components/project-tabs/transcript-tab';
import { YouTubeTimestampsTab } from '@/components/project-tabs/youtube-timestamps-tab';
import { ProjectStatusCard } from '@/components/projects/project-status-card';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import type { Doc } from '@/convex/_generated/dataModel';
import { PROJECT_TABS } from '@/lib/tab-config';

interface DemoProjectDetailProps {
  project: Doc<'projects'>;
}

const DEMO_MODE_KEY = 'demo';

export const DemoProjectDetail = ({ project }: DemoProjectDetailProps) => {
  const [activeTab, setActiveTab] = useState('recaps');
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className='min-h-screen container max-w-6xl mx-auto py-10 px-4'>
      <DemoNoticeBanner />

      <div className='mt-6 mb-8 space-y-3'>
        <p className='text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-300 font-semibold'>
          Instant preview
        </p>
        <h1 className='text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-100 wrap-break-word'>
          {project.displayName || project.fileName}
        </h1>
        <p className='text-lg text-gray-600 dark:text-slate-300 max-w-3xl leading-relaxed'>
          {project.recaps?.tldr}
        </p>
      </div>

      <div className='grid gap-6'>
        <ProjectStatusCard
          project={project}
          features={{ showDemoCreationDate: true, showFileName: false }}
        />

        {!isRevealed && (
          <DemoProcessingFlow onComplete={() => setIsRevealed(true)} />
        )}

        {isRevealed && (
          <div className='animate-in fade-in-0 slide-in-from-bottom-2 duration-500'>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className='w-full'
            >
              {/* Mobile Dropdown */}
              <div className='glass-card rounded-2xl p-4 mb-6 lg:hidden'>
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger className='w-full px-4 py-3 rounded-xl bg-linear-to-r from-blue-500 to-orange-400 text-white font-semibold text-base border-none outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-400/40 transition-all h-auto'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_TABS.map((tab) => (
                      <MobileTabItem
                        key={tab.value}
                        tab={tab}
                        project={project}
                        showLocks={false}
                      />
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop Tabs */}
              <div className='glass-card rounded-2xl p-2 mb-6 hidden lg:block'>
                <TabsList className='flex flex-wrap gap-2 bg-transparent min-w-max w-full'>
                  {PROJECT_TABS.map((tab) => (
                    <DesktopTabTrigger
                      key={tab.value}
                      tab={tab}
                      project={project}
                      showLocks={false}
                    />
                  ))}
                </TabsList>
              </div>

              <TabsContent value='recaps' className='space-y-4'>
                <TabContent
                  mode={DEMO_MODE_KEY}
                  isLoading={false}
                  data={project.recaps}
                  error={project.jobErrors?.recaps}
                  projectId={project._id}
                  jobName='recaps'
                  emptyMessage='No recaps available'
                >
                  <RecapsTab recaps={project.recaps} />
                </TabContent>
              </TabsContent>

              <TabsContent value='moments' className='space-y-4'>
                <TabContent
                  mode={DEMO_MODE_KEY}
                  isLoading={false}
                  data={project.highlightMoments}
                  error={project.jobErrors?.highlightMoments}
                  projectId={project._id}
                  jobName='highlightMoments'
                  emptyMessage='No highlight moments detected'
                >
                  <HighlightMomentsTab
                    highlightMoments={project.highlightMoments}
                  />
                </TabContent>
              </TabsContent>

              <TabsContent value='youtube-timestamps' className='space-y-4'>
                <TabContent
                  mode={DEMO_MODE_KEY}
                  isLoading={false}
                  data={project.youtubeTimestamps}
                  error={project.jobErrors?.youtubeTimestamps}
                  projectId={project._id}
                  jobName='youtubeTimestamps'
                  emptyMessage='No YouTube timestamps available'
                >
                  <YouTubeTimestampsTab
                    timestamps={project.youtubeTimestamps}
                  />
                </TabContent>
              </TabsContent>

              <TabsContent value='social' className='space-y-4'>
                <TabContent
                  mode={DEMO_MODE_KEY}
                  isLoading={false}
                  data={project.socialPosts}
                  error={project.jobErrors?.socialPosts}
                  projectId={project._id}
                  jobName='socialPosts'
                  emptyMessage='No social posts available'
                >
                  <SocialPostsTab socialPosts={project.socialPosts} />
                </TabContent>
              </TabsContent>

              <TabsContent value='hashtags' className='space-y-4'>
                <TabContent
                  mode={DEMO_MODE_KEY}
                  isLoading={false}
                  data={project.hashtags}
                  error={project.jobErrors?.hashtags}
                  projectId={project._id}
                  jobName='hashtags'
                  emptyMessage='No hashtags available'
                >
                  <HashtagsTab hashtags={project.hashtags} />
                </TabContent>
              </TabsContent>

              <TabsContent value='titles' className='space-y-4'>
                <TabContent
                  mode={DEMO_MODE_KEY}
                  isLoading={false}
                  data={project.titles}
                  error={project.jobErrors?.titles}
                  projectId={project._id}
                  jobName='titles'
                  emptyMessage='No titles available'
                >
                  <TitlesTab titles={project.titles} />
                </TabContent>
              </TabsContent>

              <TabsContent value='speakers' className='space-y-4'>
                <TabContent
                  mode={DEMO_MODE_KEY}
                  isLoading={false}
                  data={project.transcript}
                >
                  {project.transcript && (
                    <TranscriptTab
                      mode={DEMO_MODE_KEY}
                      projectId={project._id}
                      transcript={project.transcript}
                    />
                  )}
                </TabContent>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      <DemoGradientOrbs />
    </div>
  );
};
