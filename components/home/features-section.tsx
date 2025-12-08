import {
  BrainCircuit,
  ScrollText,
  Share2,
  Tags,
  Clapperboard,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: BrainCircuit,
    title: 'AI-Driven Insights',
    description:
      'AssemblyAI-powered audio intelligence that deeply understands your episodes and powers every AI workflow.',
  },
  {
    icon: ScrollText,
    title: 'Intelligent Summaries',
    description:
      'Create rich episode overviews packed with key takeaways and actionable insights from your podcast.',
  },
  {
    icon: Share2,
    title: 'Social Content Generation',
    description:
      'Auto-generate channel-ready social copy for Twitter, LinkedIn, Instagram, TikTok, YouTube, Facebook, and more.',
  },
  {
    icon: Tags,
    title: 'Titles & Tags',
    description:
      'Automatically craft SEO-friendly titles and platform-specific tags and hashtags to maximize discoverability.',
  },
  {
    icon: Clapperboard,
    title: 'Highlights & Chapters',
    description:
      'Detect highlight-worthy segments and generate YouTube-ready chapters and timestamps for better engagement.',
  },
  {
    icon: UsersRound,
    title: 'Speaker-Level Transcript',
    description:
      'Full transcript with clear speaker labels so you can see who said what and when (Max tier only).',
  },
];

export const FeaturesSection = () => {
  return (
    <section className='container mx-auto px-4 py-24 md:py-32'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl md:text-5xl font-bold mb-4'>
            All the Tools You Need in{' '}
            <span className='gradient-sunrise-text'>One Workspace</span>
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            AI-native tools to boost your podcast&apos;s reach and listener
            engagement
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className='glass-card rounded-2xl hover-lift p-8 group'
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className='rounded-2xl gradient-sunrise p-4 w-fit mb-6 group-hover:animate-pulse-sunrise transition-all'>
                  <Icon className='h-8 w-8 text-white' />
                </div>
                <h3 className='text-2xl font-bold mb-3 group-hover:text-blue-500/80 transition-colors'>
                  {feature.title}
                </h3>
                <p className='text-gray-600 leading-relaxed'>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
