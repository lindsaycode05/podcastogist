import type { Doc } from '@/convex/_generated/dataModel';
import { formatDuration, formatFileSize, formatSmartDate } from '@/lib/format';
import { Calendar1, Database, FileAudio2, Clock3 } from 'lucide-react';

interface ProjectStatusCardProps {
  project: Doc<'projects'>;
}

export const ProjectStatusCard = ({ project }: ProjectStatusCardProps) => {
  return (
    <div className='glass-card-strong rounded-2xl p-8 hover-lift'>
      <div className='flex flex-col md:flex-row md:items-start gap-6'>
        <div className='flex-1 min-w-0'>
          <h2 className='text-2xl font-bold wrap-break-words mb-4 text-gray-900 dark:text-slate-100'>
            {project.fileName}
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20'>
                <Calendar1 className='h-5 w-5 text-blue-600 dark:text-blue-300' />
              </div>
              <div>
                <p className='text-xs text-gray-500 dark:text-slate-400 font-medium'>
                  Created
                </p>
                <p className='text-sm font-semibold text-gray-900 dark:text-slate-100'>
                  {formatSmartDate(project.createdAt)}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20'>
                <Database className='h-5 w-5 text-blue-600 dark:text-blue-300' />
              </div>
              <div>
                <p className='text-xs text-gray-500 dark:text-slate-400 font-medium'>
                  File Size
                </p>
                <p className='text-sm font-semibold text-gray-900 dark:text-slate-100'>
                  {formatFileSize(project.fileSize)}
                </p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20'>
                <FileAudio2 className='h-5 w-5 text-blue-600 dark:text-blue-300' />
              </div>
              <div>
                <p className='text-xs text-gray-500 dark:text-slate-400 font-medium'>
                  Format
                </p>
                <p className='text-sm font-semibold text-gray-900 dark:text-slate-100 uppercase'>
                  {project.fileFormat}
                </p>
              </div>
            </div>
            {project.fileDuration && (
              <div className='flex items-center gap-3'>
                <div className='p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20'>
                  <Clock3 className='h-5 w-5 text-blue-600 dark:text-blue-300' />
                </div>
                <div>
                  <p className='text-xs text-gray-500 dark:text-slate-400 font-medium'>
                    Duration
                  </p>
                  <p className='text-sm font-semibold text-gray-900 dark:text-slate-100'>
                    {formatDuration(project.fileDuration)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
