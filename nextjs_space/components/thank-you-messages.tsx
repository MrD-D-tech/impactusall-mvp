'use client';

import { Heart, Quote } from 'lucide-react';

interface ThankYouMessage {
  id: string;
  authorName: string;
  message: string;
  authorPhotoUrl?: string | null;
}

interface ThankYouMessagesProps {
  messages: ThankYouMessage[];
}

export function ThankYouMessages({ messages }: ThankYouMessagesProps) {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-8">
        <Heart className="w-6 h-6 text-orange-500" fill="currentColor" />
        <h3 className="text-2xl font-bold">Thank You Messages</h3>
      </div>

      <div className="grid gap-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className="relative bg-gradient-to-br from-orange-50 via-white to-teal-50 rounded-2xl p-8 md:p-10 border-2 border-orange-100 shadow-lg"
          >
            {/* Quote icon */}
            <Quote className="absolute top-6 right-6 w-12 h-12 text-orange-200" />

            <div className="relative z-10">
              {/* Message */}
              <p className="text-lg md:text-xl text-gray-800 leading-relaxed mb-6 font-medium italic">
                &ldquo;{message.message}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-4">
                {message.authorPhotoUrl ? (
                  <img
                    src={message.authorPhotoUrl}
                    alt={message.authorName}
                    className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {message.authorName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-gray-900">{message.authorName}</p>
                  <p className="text-sm text-gray-500">Beneficiary</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
