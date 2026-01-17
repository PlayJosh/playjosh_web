'use client';

import { AppLayout } from '@/components/layout/AppLayout';
import { ConversationItem } from '@/components/messages/ConversationItem';
import { mockConversations } from '@/data/mockData';
import { useRouter } from 'next/navigation';
import { Search, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function MessagesPage() {
  const router = useRouter();

  const handleConversationClick = (conversationId: string) => {
    // In a real app, this would navigate to the conversation detail
    console.log('Opening conversation:', conversationId);
  };

  return (
    <AppLayout title="Messages">
      {/* Search */}
      <div className="p-4 bg-card border-b border-border sticky top-14 z-30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            className="pl-10 bg-muted border-0 rounded-xl"
          />
        </div>
      </div>

      {/* Safety notice */}
      <div className="mx-4 mt-4 p-3 bg-success/10 rounded-xl flex items-start gap-3">
        <Shield className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-success">Safe Messaging</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            All messages are monitored for safety. Report any inappropriate content.
          </p>
        </div>
      </div>

      {/* Conversations list */}
      <div className="divide-y divide-border mt-4">
        {mockConversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            onClick={() => handleConversationClick(conversation.id)}
          />
        ))}

        {mockConversations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No conversations yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Connect with coaches and training partners
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
