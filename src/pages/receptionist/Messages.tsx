import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessageSquare, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ConversationList from '@/components/shared/messaging/ConversationList'
import MessageThread from '@/components/shared/messaging/MessageThread'
import SendMessageForm from '@/components/shared/messaging/SendMessageForm'
import EmptyState from '@/components/patient/EmptyState'
import NewMessageDialog from '@/components/shared/messaging/NewMessageDialog'
import AppHeader from '@/components/shared/AppHeader'
import { messagesApi } from '@/lib/api'

/**
 * Receptionist Messages Page
 * Secure messaging interface for reception staff
 * Features:
 * - Communication with patients about appointments
 * - Coordination with healthcare providers
 * - Real-time message updates
 * - HIPAA-compliant secure messaging
 */
export default function ReceptionistMessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [isNewMessageDialogOpen, setIsNewMessageDialogOpen] = useState(false)

  // Fetch conversations with automatic refresh
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesApi.getConversations(),
    refetchInterval: 30000, // Refresh every 30 seconds for new messages
  })

  const conversations = conversationsData?.data || []

  // Get selected conversation
  const selectedConversation = conversations.find((c) => c.id === selectedConversationId)

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* App Header */}
      <AppHeader title="Messages" showBackButton backPath="/receptionist/dashboard" />

      {/* Page Subheader */}
      <div className="border-b border-neutral-blue-gray/10 bg-white px-6 py-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-blue-gray/70">
            Appointment scheduling and patient communication
          </p>
          <Button onClick={() => setIsNewMessageDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
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
                      selectedConversation?.participants[0]?.role === 'patient'
                        ? 'bg-info'
                        : selectedConversation?.participants[0]?.role === 'doctor'
                          ? 'bg-primary'
                          : selectedConversation?.participants[0]?.role === 'nurse'
                            ? 'bg-wellness'
                            : 'bg-secondary'
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
                description="Choose a conversation to communicate about appointments and scheduling."
              />
            </div>
          )}
        </main>
      </div>

      {/* New Message Dialog */}
      <NewMessageDialog open={isNewMessageDialogOpen} onOpenChange={setIsNewMessageDialogOpen} />
    </div>
  )
}
