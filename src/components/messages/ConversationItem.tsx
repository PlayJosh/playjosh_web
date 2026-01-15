'use client';

import { CheckCircle } from 'lucide-react';
import { Conversation } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConversationItemProps {
  conversation: Conversation;
  onClick: () => void;
}

export function ConversationItem({ conversation, onClick }: ConversationItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <img
          src={conversation.participantAvatar || '/placeholder.svg'}
          alt={conversation.participantName}
          className="w-14 h-14 rounded-full object-cover"
        />
        {conversation.participantRole === 'coach' && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-success rounded-full flex items-center justify-center ring-2 ring-card">
            <CheckCircle className="w-3 h-3 text-success-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              "font-semibold truncate",
              conversation.unreadCount > 0 ? "text-foreground" : "text-muted-foreground"
            )}>
              {conversation.participantName}
            </h3>
            <Badge variant="soft" className="text-[10px] capitalize">
              {conversation.participantRole}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {conversation.lastMessageTime}
          </span>
        </div>
        <p className={cn(
          "text-sm truncate mt-1",
          conversation.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
        )}>
          {conversation.lastMessage}
        </p>
      </div>

      {/* Unread Badge */}
      {conversation.unreadCount > 0 && (
        <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-accent-foreground">
            {conversation.unreadCount}
          </span>
        </div>
      )}
    </button>
  );
}
