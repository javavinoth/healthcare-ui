import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ConversationList from '@/components/patient/ConversationList'
import MessageThread from '@/components/patient/MessageThread'
import SendMessageForm from '@/components/patient/SendMessageForm'
import EmptyState from '@/components/patient/EmptyState'
import NewMessageDialog from '@/components/patient/NewMessageDialog'
import { messagesApi } from '@/lib/api'

/**
 * Messages Page
 * Main page for secure patient-provider messaging
 * Features:
 * - Conversation list with unread counts
 * - Message thread with real-time updates
 * - Message composition with attachments
 * - HIPAA-compliant secure messaging
 */
export default function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false)

  // Fetch conversations with automatic refresh
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
  } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesApi.getConversations(),
    refetchInterval: 30000, // Refresh every 30 seconds for new messages
  })

  const conversations = conversationsData?.data || []

  // Get selected conversation
  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  )

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Page Header */}
      <div className="border-b border-neutral-blue-gray/10 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-h1 text-neutral-blue-gray">Messages</h1>
              <p className="text-body text-neutral-blue-gray/70 mt-1">
                Secure communication with your healthcare providers
              </p>
            </div>
            <Button onClick={() => setIsNewMessageDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content: Split Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Conversation List (30%) */}
        <aside className="w-full md:w-1/3 lg:w-1/4 border-r border-neutral-blue-gray/10 flex flex-col">
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversationId}
            onSelect={setSelectedConversationId}
            isLoading={conversationsLoading}
          />
        </aside>

        {/* Right Panel: Message Thread + Compose (70%) */}
        <main className="flex-1 flex flex-col bg-neutral-light">
          {selectedConversationId ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b border-neutral-blue-gray/10 bg-white">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      selectedConversation?.participants[0]?.role === 'doctor'
                        ? 'bg-primary'
                        : selectedConversation?.participants[0]?.role === 'nurse'
                        ? 'bg-info'
                        : 'bg-wellness'
                    }`}
                  >
                    {selectedConversation?.participants[0]?.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-h3 text-neutral-blue-gray truncate">
                      {selectedConversation?.participants[0]?.name || 'Unknown'}
                    </h2>
                    <p className="text-caption text-neutral-blue-gray/60 capitalize">
                      {selectedConversation?.participants[0]?.role || 'Unknown role'}
                    </p>
                  </div>
                </div>
                {selectedConversation?.subject && (
                  <p className="text-small text-neutral-blue-gray/80 mt-2 truncate">
                    Subject: {selectedConversation.subject}
                  </p>
                )}
              </div>

              {/* Message Thread */}
              <MessageThread conversationId={selectedConversationId} />

              {/* Message Compose Form */}
              <SendMessageForm conversationId={selectedConversationId} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <EmptyState
                icon={MessageSquare}
                title="Select a conversation"
                description="Choose a conversation from the list to view and send messages to your healthcare provider."
              />
            </div>
          )}
        </main>
      </div>

      {/* New Message Dialog */}
      <NewMessageDialog
        open={isNewMessageDialogOpen}
        onOpenChange={setIsNewMessageDialogOpen}
      />
    </div>
  )
}
