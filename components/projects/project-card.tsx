'use client';

import { FileVolume, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteProjectAction } from '@/actions/projects';
import { CompactProgress } from '@/components/projects/compact-progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import type { Doc } from '@/convex/_generated/dataModel';
import { formatDuration, formatFileSize, formatSmartDate } from '@/lib/format';
import {
  getProcessingPhaseLabel,
  getStatusIcon,
  getStatusVariant
} from '@/lib/utils/status-utils';
import { cn } from '@/lib/utils/utils';

interface ProjectCardProps {
  project: Doc<'projects'>;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const StatusIcon = getStatusIcon(project.status);
  const processingPhase = getProcessingPhaseLabel(project);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteProjectAction(project._id);
      toast.success('Project deleted');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete project'
      );
      setIsDeleting(false);
    }
  };

  return (
    <Link href={`/dashboard/projects/${project._id}`} className='block'>
      <div
        className={cn(
          'glass-card rounded-2xl group relative hover-lift cursor-pointer overflow-hidden transition-all',
          project.status === 'processing' &&
            'ring-2 ring-blue-400 shadow-blue-200 shadow-lg dark:ring-blue-500/60 dark:shadow-blue-500/30',
          project.status === 'failed' &&
            'ring-2 ring-red-400 dark:ring-red-400/70'
        )}
      >
        <div className='p-6 md:p-7'>
          <div className='flex items-start gap-5'>
            <div className='rounded-2xl gradient-sunrise p-4 md:p-5 shrink-0 group-hover:scale-110 transition-transform shadow-lg'>
              <FileVolume className='h-10 w-10 md:h-12 md:w-12 text-white' />
            </div>

            <div className='flex-1 min-w-0 overflow-hidden'>
              <div className='flex flex-col gap-3 md:flex-row md:flex-wrap md:items-start md:justify-between'>
                <div className='flex-1 min-w-0 overflow-hidden order-1 md:order-1'>
                  <h3 className='font-extrabold text-lg md:text-xl lg:text-2xl wrap-break-word hyphens-auto group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug'>
                    {project.displayName || project.fileName}
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-slate-300 mt-2 font-medium'>
                    {formatSmartDate(project.createdAt)}
                  </p>
                </div>
                <div className='flex flex-wrap items-center gap-3 order-3 md:order-2 md:shrink-0 w-full md:w-auto'>
                  {project.status !== 'completed' && (
                    <Badge
                      variant={getStatusVariant(project.status)}
                      className={cn(
                        'flex items-center gap-2 h-9 md:h-10 text-sm md:text-base px-4 whitespace-normal md:whitespace-nowrap font-bold shadow-md text-center',
                        project.status === 'processing' &&
                          'gradient-sunrise text-white animate-pulse-sunrise'
                      )}
                    >
                      <StatusIcon
                        className={`h-4 w-4 md:h-5 md:w-5 ${
                          project.status === 'processing' ? 'animate-spin' : ''
                        }`}
                      />
                      <span>{processingPhase}</span>
                    </Badge>
                  )}
                  <AlertDialog
                    open={isConfirmOpen}
                    onOpenChange={setIsConfirmOpen}
                  >
                    <button
                      type='button'
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setIsConfirmOpen(true);
                      }}
                      disabled={isDeleting}
                      className='h-10 w-auto md:w-10 px-3 md:px-0 rounded-full bg-red-50 hover:bg-red-100 dark:bg-red-500/15 dark:hover:bg-red-500/25 flex items-center justify-center gap-2 transition-all hover:scale-110 disabled:opacity-50 cursor-pointer'
                    >
                      {isDeleting ? (
                        <Loader2 className='h-5 w-5 animate-spin text-red-600 dark:text-red-300' />
                      ) : (
                        <Trash2 className='h-5 w-5 text-red-600 dark:text-red-300' />
                      )}
                      <span className='text-sm font-semibold text-red-700 dark:text-red-200 md:hidden'>
                        Delete
                      </span>
                    </button>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Delete this project?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This permanently removes &ldquo;
                          {project.displayName || project.fileName}
                          &rdquo; and all generated outputs. This action cannot
                          be undone.
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

                <div className='flex items-center gap-3 flex-wrap order-2 md:order-3 md:basis-full'>
                  <Badge className='text-xs font-semibold bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/40'>
                    {formatFileSize(project.fileSize)}
                  </Badge>
                  <Badge className='text-xs font-semibold bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/40 uppercase'>
                    {project.fileFormat}
                  </Badge>
                  {project.fileDuration && (
                    <Badge className='text-xs font-semibold bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/40'>
                      {formatDuration(project.fileDuration)}
                    </Badge>
                  )}
                </div>
              </div>

              {project.status === 'processing' && project.jobStatus && (
                <div className='pt-2'>
                  <CompactProgress
                    jobStatus={project.jobStatus}
                    fileDuration={project.fileDuration}
                    createdAt={project.createdAt}
                  />
                </div>
              )}

              {project.status === 'failed' && project.error && (
                <div className='mt-2 p-4 rounded-xl bg-red-50 border-2 border-red-200 dark:bg-red-500/15 dark:border-red-500/30'>
                  <p className='text-sm text-red-700 dark:text-red-200 font-semibold'>
                    {project.error.message}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
