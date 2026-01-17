'use client';

import { useState } from 'react';
import { MoreHorizontal, Flag, Share2, CheckCircle } from 'lucide-react';
import { Post, ReactionType, SportLevel } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
}

const levelLabels: Record<SportLevel, string> = {
  school: 'School',
  district: 'District',
  state: 'State',
  national: 'National',
};

const reactionIcons: Record<ReactionType, string> = {
  clap: '👏',
  strong: '💪',
  medal: '🏅',
};

export function PostCard({ post }: PostCardProps) {
  const [reactions, setReactions] = useState(post.reactions);
  const [userReaction, setUserReaction] = useState<ReactionType | undefined>(post.userReaction);
  const [showMenu, setShowMenu] = useState(false);

  const handleReaction = (type: ReactionType) => {
    if (userReaction === type) {
      setReactions(prev => ({ ...prev, [type]: prev[type] - 1 }));
      setUserReaction(undefined);
    } else {
      if (userReaction) {
        setReactions(prev => ({ ...prev, [userReaction]: prev[userReaction] - 1 }));
      }
      setReactions(prev => ({ ...prev, [type]: prev[type] + 1 }));
      setUserReaction(type);
    }
  };

  return (
    <article className="bg-card rounded-2xl card-shadow p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={post.userAvatar || '/placeholder.svg'}
              alt={post.userName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-background"
            />
            {post.isVerified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-success rounded-full flex items-center justify-center ring-2 ring-card">
                <CheckCircle className="w-3 h-3 text-success-foreground" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{post.userName}</h3>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-muted-foreground">{post.userSport}</span>
              <span className="text-muted-foreground">•</span>
              <Badge variant={post.userLevel} className="text-[10px] px-1.5 py-0">
                {levelLabels[post.userLevel]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="relative">
          <Button 
            variant="ghost" 
            size="iconSm"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
          </Button>
          
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 bg-card rounded-xl shadow-lg border border-border p-1 min-w-[140px] z-10">
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                <Flag className="w-4 h-4" />
                Report Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <p className="text-foreground leading-relaxed mb-3">{post.content}</p>

      {/* Media */}
      {post.media && (
        <div className="rounded-xl overflow-hidden mb-3 -mx-1">
          <img
            src={post.media}
            alt="Post media"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {/* Timestamp & Type */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-muted-foreground">{post.timestamp}</span>
        <span className="text-muted-foreground">•</span>
        <Badge variant="soft" className="text-[10px] capitalize">
          {post.type}
        </Badge>
      </div>

      {/* Reactions */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1">
          {(Object.entries(reactionIcons) as [ReactionType, string][]).map(([type, icon]) => (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200",
                userReaction === type
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <span className={cn(
                "text-base transition-transform duration-200",
                userReaction === type && "animate-bounce-subtle"
              )}>
                {icon}
              </span>
              <span className="font-medium">{reactions[type]}</span>
            </button>
          ))}
        </div>

        <Button variant="ghost" size="iconSm">
          <Share2 className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
    </article>
  );
}
