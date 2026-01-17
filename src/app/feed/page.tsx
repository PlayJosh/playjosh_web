'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { FeedFilters } from '@/components/feed/FeedFilters';
import { PostCard } from '@/components/feed/PostCard';
import { mockPosts } from '@/data/mockData';

export default function FeedPage() {
  const [filter, setFilter] = useState('all');

  const filteredPosts = filter === 'all' 
    ? mockPosts 
    : mockPosts.filter(post => post.type === filter);

  return (
    <AppLayout title="PlayJosh">
      <div className="bg-muted">
        <FeedFilters onFilterChange={setFilter} />
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Inspirational tagline */}
        <div className="text-center py-2">
          <p className="text-sm text-muted-foreground italic">
            "Every athlete deserves visibility"
          </p>
        </div>

        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts in this category yet</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
