import type { LucideIcon } from 'lucide-react';
import { Clock3, Database, FileAudio2, FileVolume } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { Doc } from '@/convex/_generated/dataModel';
import { formatDuration, formatFileSize } from '@/lib/format';

interface DemoProjectCardProps {
  project: Doc<'projects'>;
}

export const DemoProjectCard = ({ project }: DemoProjectCardProps) => {
  if (!project.demoSlug) return null;

  const metaItems = [
    {
      icon: Clock3,
      // biome-ignore lint: it's ensured the curated demo projects have a file duration value set in DB
      label: formatDuration(project.fileDuration!)
    },
    {
      icon: FileAudio2,
      label: project.fileFormat.toUpperCase()
    },
    {
      icon: Database,
      label: formatFileSize(project.fileSize)
    }
  ] as { icon: LucideIcon; label: string }[];

  return (
    <Link href={`/demo/${project.demoSlug}`} className='group block'>
      <div className='glass-card rounded-2xl p-6 md:p-7 hover-lift transition-all border border-transparent group-hover:border-blue-200 dark:group-hover:border-blue-500/40'>
        <div className='flex items-start gap-4'>
          <div className='rounded-2xl gradient-sunrise p-4 shadow-lg shrink-0 group-hover:scale-110 transition-transform'>
            <FileVolume className='h-10 w-10 text-white' />
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2 mb-2'>
              <Badge className='gradient-sunrise text-white border-0 shadow-sm text-xs'>
                Sample project
              </Badge>
            </div>
            <h3 className='text-xl md:text-2xl font-bold text-gray-900 dark:text-slate-100 wrap-break-word mb-3'>
              {project.displayName || project.fileName}
            </h3>
            <p className='text-sm text-gray-600 dark:text-slate-300 leading-relaxed mb-5'>
              {project.recaps?.tldr}
            </p>

            <div className='flex flex-wrap gap-2 mb-6'>
              {metaItems.map((item) => (
                <Badge
                  key={item.label}
                  className='flex items-center gap-2 text-xs font-semibold bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/40'
                >
                  <item.icon className='h-3.5 w-3.5' />
                  {item.label}
                </Badge>
              ))}
            </div>

            <div className='flex flex-col-reverse items-start gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <p className='text-xs text-gray-500 dark:text-slate-400'>
                Ready instantly, no upload required.
              </p>
              <div className='gradient-sunrise text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg group-hover:shadow-xl transition-all'>
                Generate content pack
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
