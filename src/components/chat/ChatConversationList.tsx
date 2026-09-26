import type { AdminChatConversationSummary, AdminChatParticipantCard } from '@/api/types'
import { cn } from '@/lib/cn'
import { formatDateTime } from '@/utils/format'

function participantLabel(participant: AdminChatParticipantCard) {
  return participant.fullName ?? participant.memberId ?? participant.userId
}

interface ChatConversationListProps {
  items: AdminChatConversationSummary[]
  selectedMatchId: string | null
  onSelect: (matchId: string) => void
}

export function ChatConversationList({ items, selectedMatchId, onSelect }: ChatConversationListProps) {
  return (
    <ul className="divide-y divide-slate-100 overflow-y-auto">
      {items.map((item) => {
        const selected = item.matchId === selectedMatchId
        return (
          <li key={item.matchId}>
            <button
              type="button"
              className={cn(
                'w-full px-3 py-3 text-left transition hover:bg-slate-50',
                selected ? 'bg-sky-50' : 'bg-white',
              )}
              onClick={() => onSelect(item.matchId)}
            >
              <p className="text-sm font-medium text-slate-900">
                {participantLabel(item.participantA)} ↔ {participantLabel(item.participantB)}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Matched {formatDateTime(item.matchedAt)}
                {item.chatStatus ? ` · ${item.chatStatus}` : ''}
              </p>
              {item.lastMessageText ? (
                <p className="mt-1 line-clamp-2 text-xs text-slate-600">{item.lastMessageText}</p>
              ) : (
                <p className="mt-1 text-xs text-slate-400">No snippet</p>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
