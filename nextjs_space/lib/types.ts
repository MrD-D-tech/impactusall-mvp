import { UserRole } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string | null;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImageUrl: string | null;
  impactMetrics: any;
  status: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  charity: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  donor?: {
    id: string;
    name: string;
    logoUrl: string | null;
  } | null;
  _count?: {
    likes: number;
    media: number;
  };
}

export interface ImpactMetrics {
  [key: string]: string | number;
}
