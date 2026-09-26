import type {
  AdminChatConversationSummary,
  AdminChatMessageItem,
  AdminChatParticipantCard,
} from '@/api/types'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { UserLink } from '@/components/common/UserLink'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/utils/format'

function participantLabel(participant: AdminChatParticipantCard) {
  return participant.fullName ?? participant.memberId ?? participant.userId
}

function authorLabel(conversation: AdminChatConversationSummary, authorUserId: string | null) {
  if (!authorUserId) return 'Unknown'
  if (conversation.participantA.userId === authorUserId) {
    return participantLabel(conversation.participantA)
  }
  if (conversation.participantB.userId === authorUserId) {
    return participantLabel(conversation.participantB)
  }
  return authorUserId
}

interface ChatTranscriptPanelProps {
  conversation: AdminChatConversationSummary | null
  messages: AdminChatMessageItem[]
  isLoading: boolean
  error: unknown
  onRetry: () => void
  nextPageToken: string | null
  isLoadingMore: boolean
  onLoadMore: () => void
}

export function ChatTranscriptPanel({
  conversation,
  messages,
  isLoading,
  error,
  onRetry,
  nextPageToken,
  isLoadingMore,
  onLoadMore,
}: ChatTranscriptPanelProps) {
  if (!conversation) {
    return (
      <div className="flex h-full min-h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
        Select a conversation
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-[280px] flex-col rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-semibold text-slate-900">
          <UserLink
            userId={conversation.participantA.userId}
            label={participantLabel(conversation.participantA)}
          />
          <span className="mx-1 text-slate-400">↔</span>
          <UserLink
            userId={conversation.participantB.userId}
            label={participantLabel(conversation.participantB)}
          />
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          Match {conversation.matchId.slice(0, 8)}… · {conversation.chatStatus ?? '—'}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={`chat-msg-${index + 1}`} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : null}

        {!isLoading && error ? (
          <QueryFeedback loading={false} error={error} onRetry={onRetry} />
        ) : null}

        {!isLoading && !error && messages.length === 0 ? (
          <p className="text-sm text-slate-500">No messages in this conversation.</p>
        ) : null}

        {!isLoading && !error
          ? messages.map((message) => {
              const isA = message.authorUserId === conversation.participantA.userId
              return (
                <div
                  key={message.sid}
                  className={cn('flex', isA ? 'justify-start' : 'justify-end')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                      isA ? 'bg-slate-100 text-slate-900' : 'bg-sky-50 text-slate-900',
                    )}
                  >
                    <p className="text-xs font-medium text-slate-600">
                      {authorLabel(conversation, message.authorUserId)}
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap break-words">
                      {message.body ?? '(empty)'}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">{formatDateTime(message.sentAt)}</p>
                  </div>
                </div>
              )
            })
          : null}
      </div>

      {nextPageToken ? (
        <div className="border-t border-slate-100 px-4 py-3">
          <Button variant="outline" disabled={isLoadingMore} onClick={onLoadMore}>
            {isLoadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
