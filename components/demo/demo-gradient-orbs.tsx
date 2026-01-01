export const DemoGradientOrbs = () => {
  return (
    <div className='hidden md:block pointer-events-none fixed inset-0 z-0'>
      <div className='absolute -top-24 right-0 h-80 w-80 rounded-full bg-blue-400/20 dark:bg-blue-500/15 mix-blend-multiply dark:mix-blend-screen blur-3xl animate-float' />
      <div
        className='absolute top-1/4 -left-24 h-96 w-96 rounded-full bg-orange-400/7 dark:bg-orange-500/15 mix-blend-multiply dark:mix-blend-screen blur-3xl animate-float'
        style={{ animationDelay: '0.6s' }}
      />
      <div
        className='absolute top-1/2 right-1/4 h-72 w-72 rounded-full bg-sky-400/20 dark:bg-sky-500/15 mix-blend-multiply dark:mix-blend-screen blur-3xl animate-float'
        style={{ animationDelay: '1.1s' }}
      />
      <div
        className='absolute bottom-24 left-1/3 h-80 w-80 rounded-full bg-amber-400/9 dark:bg-amber-500/15 mix-blend-multiply dark:mix-blend-screen blur-3xl animate-float'
        style={{ animationDelay: '1.6s' }}
      />
      <div
        className='absolute top-20 left-1/4 h-96 w-96 rounded-full bg-blue-300/20 dark:bg-blue-400/15 mix-blend-multiply dark:mix-blend-screen blur-3xl animate-float'
        style={{ animationDelay: '1.8s' }}
      />
      <div
        className='absolute -bottom-24 right-8 h-96 w-96 rounded-full bg-blue-300/20 dark:bg-blue-400/15 mix-blend-multiply dark:mix-blend-screen blur-3xl animate-float'
        style={{ animationDelay: '2.2s' }}
      />
    </div>
  );
};
