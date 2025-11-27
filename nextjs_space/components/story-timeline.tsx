'use client';

import { Calendar } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  displayOrder: number;
}

interface StoryTimelineProps {
  milestones: Milestone[];
}

export function StoryTimeline({ milestones }: StoryTimelineProps) {
  if (!milestones || milestones.length === 0) {
    return null;
  }

  // Sort milestones by date (oldest first)
  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-8">
        <Calendar className="w-6 h-6 text-orange-500" />
        <h3 className="text-2xl font-bold">Journey Timeline</h3>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-6 bottom-6 w-1 bg-gradient-to-b from-orange-500 via-orange-400 to-teal-500" />

        {/* Milestones */}
        <div className="space-y-8">
          {sortedMilestones.map((milestone, index) => (
            <div key={milestone.id} className="relative flex gap-6">
              {/* Numbered circle */}
              <div className="relative z-10 flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                  {index + 1}
                </div>
              </div>

              {/* Content card */}
              <div className="flex-1 bg-white rounded-lg border-2 border-gray-100 p-6 hover:border-orange-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="text-xl font-bold text-gray-900">{milestone.title}</h4>
                  <time className="text-sm font-semibold text-orange-600 whitespace-nowrap">
                    {new Date(milestone.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </time>
                </div>
                <p className="text-gray-700 leading-relaxed">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
