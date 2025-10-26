import { MessageSquare, Search } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import EmptyState from './EmptyState'
import type { Conversation } from '@/types'
import { cn } from '@/lib/utils'

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (id: string) => void
  isLoading?: boolean
}

/**
 * ConversationList Component
 * Displays a list of conversations with search and filtering
 */
export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  isLoading = false,
}: ConversationListProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implement search functionality
    console.log('Search:', e.target.value)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-neutral-blue-gray/10">
          <h2 className="text-h2 text-neutral-blue-gray mb-3">Messages</h2>
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Loading Skeletons */}
        <div className="flex-1 p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-neutral-blue-gray/10">
          <h2 className="text-h2 text-neutral-blue-gray mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-blue-gray/50" />
            <Input
              type="text"
              placeholder="Search conversations..."
              className="pl-10"
              onChange={handleSearchChange}
            />
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-4">
          <EmptyState
            icon={MessageSquare}
            title="No conversations"
            description="Start a conversation with your healthcare provider to see it here."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-neutral-blue-gray/10">
        <h2 className="text-h2 text-neutral-blue-gray mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-blue-gray/50" />
          <Input
            type="text"
            placeholder="Search conversations..."
            className="pl-10"
            onChange={handleSearchChange}
            aria-label="Search conversations"
          />
        </div>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-neutral-blue-gray/10">
          {conversations.map((conversation) => {
            const isSelected = conversation.id === selectedId
            const hasUnread = conversation.unreadCount > 0

            // Get the other participant (not the current user)
            const otherParticipant = conversation.participants[0]

            return (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation.id)}
                className={cn(
                  'w-full p-4 text-left transition-colors hover:bg-neutral-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
                  isSelected && 'bg-primary/5 border-l-4 border-l-primary',
                  hasUnread && !isSelected && 'bg-info/5'
                )}
                aria-label={`Conversation with ${otherParticipant?.name}`}
                aria-current={isSelected ? 'true' : 'false'}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold',
                        otherParticipant?.role === 'doctor' && 'bg-primary',
                        otherParticipant?.role === 'nurse' && 'bg-info',
                        otherParticipant?.role === 'patient' && 'bg-wellness'
                      )}
                    >
                      {otherParticipant?.name
                        ?.split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase() || '?'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-body truncate',
                            hasUnread
                              ? 'font-semibold text-neutral-blue-gray'
                              : 'font-medium text-neutral-blue-gray'
                          )}
                        >
                          {otherParticipant?.name || 'Unknown'}
                        </p>
                        <p className="text-caption text-neutral-blue-gray/60 capitalize">
                          {otherParticipant?.role || 'Unknown role'}
                        </p>
                      </div>
                      {hasUnread && (
                        <Badge
                          variant="default"
                          className="bg-primary text-white ml-2"
                        >
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>

                    {/* Subject */}
                    <p
                      className={cn(
                        'text-small truncate mb-1',
                        hasUnread
                          ? 'font-medium text-neutral-blue-gray'
                          : 'text-neutral-blue-gray/80'
                      )}
                    >
                      {conversation.subject}
                    </p>

                    {/* Last Message Preview */}
                    {conversation.lastMessage && (
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-caption text-neutral-blue-gray/60 truncate flex-1">
                          {conversation.lastMessage.content}
                        </p>
                        <p className="text-caption text-neutral-blue-gray/50 flex-shrink-0">
                          {formatDistanceToNow(
                            new Date(conversation.lastMessage.sentAt),
                            { addSuffix: true }
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
