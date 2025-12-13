'use client';

interface RecapsTabProps {
  recaps?: {
    tldr: string;
    full: string;
    bullets: string[];
    insights: string[];
  };
}

export const RecapsTab = ({ recaps }: RecapsTabProps) => {
  // TabContent ensures this is never undefined at runtime
  if (!recaps) return null;

  return (
    <div className='space-y-6'>
      <div className='glass-card rounded-2xl p-8'>
        <h3 className='text-2xl font-bold mb-4 gradient-sunrise-text'>TL;DR</h3>
        <p className='text-lg text-gray-700 leading-relaxed wrap-break-word'>
          {recaps.tldr}
        </p>
      </div>

      <div className='glass-card rounded-2xl p-8'>
        <h3 className='text-2xl font-bold mb-4 gradient-sunrise-text'>
          Full Summary & Recaps
        </h3>
        <p className='text-gray-700 leading-relaxed wrap-break-word'>
          {recaps.full}
        </p>
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        <div className='glass-card rounded-2xl p-8'>
          <h3 className='text-2xl font-bold mb-6 text-gray-900'>Key Points</h3>
          <ul className='space-y-3'>
            {recaps.bullets.map((bullet, idx) => (
              <li
                key={`${idx}-${bullet}`}
                className='p-4 rounded-xl bg-linear-to-r from-blue-50 to-orange-50 border border-blue-100'
              >
                <span className='text-gray-700 leading-relaxed wrap-break-word'>
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className='glass-card rounded-2xl p-8'>
          <h3 className='text-2xl font-bold mb-6 text-gray-900'>Insights</h3>
          <ul className='space-y-3'>
            {recaps.insights.map((insight, idx) => (
              <li
                key={`${idx}-${insight}`}
                className='p-4 rounded-xl bg-linear-to-r from-teal-50 to-green-50 border border-green-100'
              >
                <span className='text-gray-700 leading-relaxed wrap-break-word'>
                  {insight}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
