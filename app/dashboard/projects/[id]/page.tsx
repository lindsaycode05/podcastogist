'use client';

import { useAuth } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { SquarePen, Loader2, Save, Trash2, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  deleteProjectAction,
  updateDisplayNameAction,
} from '@/actions/projects';
import { ProcessingFlow } from '@/components/projects/processing-flow';
import { TabContent } from '@/components/project-detail/tab-content';
import {
  MobileTabItem,
  DesktopTabTrigger,
} from '@/components/project-detail/tab-triggers';
import { ProjectStatusCard } from '@/components/projects/project-status-card';
import { HashtagsTab } from '@/components/project-tabs/hashtags-tab';
import { HighlightMomentsTab } from '@/components/project-tabs/highlight-moments-tab';
import { SocialPostsTab } from '@/components/project-tabs/social-posts-tab';
import { RecapsTab } from '@/components/project-tabs/recaps-tab';
import { TitlesTab } from '@/components/project-tabs/titles-tab';
import { TranscriptTab } from '@/components/project-tabs/transcript-tab';
import { YouTubeTimestampsTab } from '@/components/project-tabs/youtube-timestamps-tab';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import type { PhaseStatus } from '@/lib/types';
import { FEATURES } from '@/lib/tier-config';
import { PROJECT_TABS } from '@/lib/tab-config';
import { PODCAST_PROCESSING_PHASE_STATUS } from '@/lib/constants';

const ProjectDetailPage = () => {
  const { userId } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const projectId = id as Id<'projects'>;

  // Convex is the single source of truth - real-time updates via subscription
  const project = useQuery(api.projects.getProject, { projectId });

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Tab state for mobile dropdown
  const [activeTab, setActiveTab] = useState('recaps');

  // Get status from Convex jobStatus (initialized on project creation)
  const transcriptionStatus: PhaseStatus =
    project?.jobStatus?.transcription ||
    PODCAST_PROCESSING_PHASE_STATUS.PENDING;
  const generationStatus: PhaseStatus =
    project?.jobStatus?.contentGeneration ||
    PODCAST_PROCESSING_PHASE_STATUS.PENDING;

  // Handle edit title
  const handleStartEdit = () => {
    setEditedName(project?.displayName || project?.fileName || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName('');
  };

  const handleSaveEdit = async () => {
    if (!editedName.trim()) {
      toast.error('Project name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      await updateDisplayNameAction(projectId, editedName);
      toast.success('Project name updated');
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update name'
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProjectAction(projectId);
      toast.success('Project deleted');
      router.push('/dashboard/projects');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete project'
      );
      setIsDeleting(false);
    }
  };

  if (!project) {
    return (
      <div className='container max-w-6xl mx-auto py-10 px-4'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
        </div>
      </div>
    );
  }

  if (project.userId !== userId) {
    return (
      <div className='container max-w-6xl mx-auto py-10 px-4'>
        <Card>
          <CardContent className='pt-6'>
            <p className='text-center text-muted-foreground'>
              You don't have access to this project.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isProcessing = project.status === 'processing';
  const isCompleted = project.status === 'completed';
  const hasFailed = project.status === 'failed';
  const showGenerating =
    isProcessing &&
    generationStatus === PODCAST_PROCESSING_PHASE_STATUS.RUNNING;

  return (
    <div className='container max-w-6xl mx-auto py-10 px-4 '>
      {/* Header with title and actions */}
      <div className='mb-8 flex items-start justify-between gap-4'>
        <div className='flex-1 min-w-0'>
          {isEditing ? (
            <div className='flex items-center gap-2'>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className='text-2xl font-bold h-auto py-2'
                placeholder='Project name'
                autoFocus
                disabled={isSaving}
              />
              <Button size='sm' onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <Save className='h-4 w-4' />
                )}
              </Button>
              <Button
                size='sm'
                variant='outline'
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <h1 className='text-3xl font-bold wrap-break-word'>
                {project.displayName || project.fileName}
              </h1>
            </div>
          )}
        </div>
        <div className='flex items-center gap-3 shrink-0'>
          {!isEditing && (
            <Button
              variant='outline'
              size='lg'
              onClick={handleStartEdit}
              className='glass-card hover-lift border-2 border-blue-200 hover:border-blue-400 px-6 bg-white'
            >
              <SquarePen className='h-4 w-4 mr-2 text-blue-600' />
              <span className='font-semibold text-blue-700'>Edit</span>
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size='lg'
                disabled={isDeleting}
                className='gradient-sunrise text-white hover-glow px-6 transition-all'
              >
                {isDeleting ? (
                  <Loader2 className='h-4 w-4 animate-spin mr-2' />
                ) : (
                  <Trash2 className='h-4 w-4 mr-2' />
                )}
                <span className='font-semibold'>Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes &ldquo;
                  {project.displayName || project.fileName}
                  &rdquo; and all generated outputs. This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className='bg-destructive text-white hover:bg-destructive/90'
                  onClick={handleDelete}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className='grid gap-6'>
        <ProjectStatusCard project={project} />

        {isProcessing && (
          <ProcessingFlow
            transcriptionStatus={transcriptionStatus}
            generationStatus={generationStatus}
            fileDuration={project.fileDuration}
            createdAt={project.createdAt}
          />
        )}

        {hasFailed && project.error && (
          <Card className='border-destructive'>
            <CardHeader>
              <CardTitle className='text-destructive'>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm'>{project.error.message}</p>
              {project.error.step && (
                <p className='text-sm text-muted-foreground mt-2'>
                  Failed at: {project.error.step}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {(showGenerating || isCompleted) && (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            {/* Mobile Dropdown */}
            <div className='glass-card rounded-2xl p-4 mb-6 lg:hidden'>
              <Select value={activeTab} onValueChange={setActiveTab}>
                <SelectTrigger className='w-full px-4 py-3 rounded-xl bg-linear-to-r from-blue-500 to-orange-400 text-white font-semibold text-base border-none outline-none focus:ring-2 focus:ring-blue-300 transition-all h-auto'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_TABS.map((tab) => (
                    <MobileTabItem
                      key={tab.value}
                      tab={tab}
                      project={project}
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
                  />
                ))}
              </TabsList>
            </div>

            <TabsContent value='recaps' className='space-y-4'>
              <TabContent
                isLoading={showGenerating}
                data={project.recaps}
                error={project.jobErrors?.recaps}
                projectId={projectId}
                jobName='recaps'
                emptyMessage='No recaps available'
              >
                <RecapsTab recaps={project.recaps} />
              </TabContent>
            </TabsContent>

            <TabsContent value='moments' className='space-y-4'>
              <TabContent
                isLoading={showGenerating}
                data={project.highlightMoments}
                error={project.jobErrors?.highlightMoments}
                projectId={projectId}
                feature={FEATURES.HIGHLIGHT_MOMENTS}
                featureName='Highlight Moments'
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
                isLoading={showGenerating}
                data={project.youtubeTimestamps}
                error={project.jobErrors?.youtubeTimestamps}
                projectId={projectId}
                feature={FEATURES.YOUTUBE_TIMESTAMPS}
                featureName='YouTube Timestamps'
                jobName='youtubeTimestamps'
                emptyMessage='No YouTube timestamps available'
              >
                <YouTubeTimestampsTab timestamps={project.youtubeTimestamps} />
              </TabContent>
            </TabsContent>

            <TabsContent value='social' className='space-y-4'>
              <TabContent
                isLoading={showGenerating}
                data={project.socialPosts}
                error={project.jobErrors?.socialPosts}
                projectId={projectId}
                feature={FEATURES.SOCIAL_POSTS}
                featureName='Social Posts'
                jobName='socialPosts'
                emptyMessage='No social posts available'
              >
                <SocialPostsTab socialPosts={project.socialPosts} />
              </TabContent>
            </TabsContent>

            <TabsContent value='hashtags' className='space-y-4'>
              <TabContent
                isLoading={showGenerating}
                data={project.hashtags}
                error={project.jobErrors?.hashtags}
                projectId={projectId}
                feature={FEATURES.HASHTAGS}
                featureName='Hashtags'
                jobName='hashtags'
                emptyMessage='No hashtags available'
              >
                <HashtagsTab hashtags={project.hashtags} />
              </TabContent>
            </TabsContent>

            <TabsContent value='titles' className='space-y-4'>
              <TabContent
                isLoading={showGenerating}
                data={project.titles}
                error={project.jobErrors?.titles}
                projectId={projectId}
                feature={FEATURES.TITLES}
                featureName='Podcast Titles'
                jobName='titles'
                emptyMessage='No titles available'
              >
                <TitlesTab titles={project.titles} />
              </TabContent>
            </TabsContent>

            <TabsContent value='speakers' className='space-y-4'>
              <TabContent isLoading={showGenerating} data={project.transcript}>
                {project.transcript && (
                  <TranscriptTab
                    projectId={projectId}
                    transcript={project.transcript}
                  />
                )}
              </TabContent>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
