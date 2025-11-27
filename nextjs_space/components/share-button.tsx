'use client';

import { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Instagram, MessageCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonProps {
  title: string;
  url: string;
}

export function ShareButton({ title, url }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;

  const shareToTwitter = () => {
    const text = `${title} via @ImpactusAll`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}`,
      '_blank'
    );
    trackShare('twitter');
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      '_blank'
    );
    trackShare('facebook');
  };

  const shareToLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
      '_blank'
    );
    trackShare('linkedin');
  };

  const shareToWhatsApp = () => {
    const text = `${title} - ${fullUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    trackShare('whatsapp');
  };

  const copyToInstagram = () => {
    navigator.clipboard.writeText(fullUrl);
    toast.success('Link copied! Paste it in your Instagram post or story');
    trackShare('instagram');
  };

  const trackShare = async (platform: string) => {
    // Track share analytics
    try {
      await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, platform }),
      });
    } catch (error) {
      // Silent fail for analytics
    }
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-full font-semibold hover:border-gray-400 transition-colors"
      >
        <Share2 className="w-5 h-5" />
        <span>Share Story</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Share This Story</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={shareToTwitter}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Twitter className="w-6 h-6 text-blue-500" />
                </div>
                <span className="font-semibold text-gray-900">Twitter</span>
              </button>

              <button
                onClick={shareToFacebook}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Facebook className="w-6 h-6 text-blue-600" />
                </div>
                <span className="font-semibold text-gray-900">Facebook</span>
              </button>

              <button
                onClick={shareToLinkedIn}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Linkedin className="w-6 h-6 text-blue-700" />
                </div>
                <span className="font-semibold text-gray-900">LinkedIn</span>
              </button>

              <button
                onClick={copyToInstagram}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-pink-600" />
                </div>
                <span className="font-semibold text-gray-900">Instagram</span>
              </button>

              <button
                onClick={shareToWhatsApp}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="font-semibold text-gray-900">WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
