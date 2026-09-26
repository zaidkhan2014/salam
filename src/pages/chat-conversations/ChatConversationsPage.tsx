import { useEffect, useMemo, useState } from 'react'
import type { AdminChatMessageItem } from '@/api/types'
import { ChatConversationList } from '@/components/chat/ChatConversationList'
import { ChatTranscriptPanel } from '@/components/chat/ChatTranscriptPanel'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { QueryFeedback } from '@/components/common/QueryFeedback'
import { DateGranularityControls } from '@/components/metrics/DateGranularityControls'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  fetchAdminChatMessages,
  useAdminChatConversations,
  useAdminChatMessages,
} from '@/hooks/api/useAdminChat'
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters'
import { formatNumber } from '@/utils/format'

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const
const MESSAGE_PAGE_SIZE = 50

export default function ChatConversationsPage() {
  const { filters, setFilters } = useAnalyticsFilters()
  const [queryDraft, setQueryDraft] = useState('')
  const [queryApplied, setQueryApplied] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  const [messages, setMessages] = useState<AdminChatMessageItem[]>([])
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState<unknown>(null)

  const listFilters = useMemo(
    () => ({
      start: filters.start,
      end: filters.end,
      query: queryApplied.trim() || undefined,
      page,
      size: pageSize,
    }),
    [filters.end, filters.start, page, pageSize, queryApplied],
  )

  const conversationsQuery = useAdminChatConversations(listFilters)
  const messagesQuery = useAdminChatMessages(selectedMatchId, {
    order: 'asc',
    size: MESSAGE_PAGE_SIZE,
  })

  const selectedConversation =
    conversationsQuery.data?.items.find((item) => item.matchId === selectedMatchId) ?? null

  useEffect(() => {
    if (!selectedMatchId) {
      setMessages([])
      setNextPageToken(null)
      setLoadMoreError(null)
      return
    }
    if (messagesQuery.data) {
      setMessages(messagesQuery.data.items)
      setNextPageToken(messagesQuery.data.nextPageToken)
      setLoadMoreError(null)
    }
  }, [messagesQuery.data, selectedMatchId])

  const totalPages = useMemo(() => {
    const total = conversationsQuery.data?.total ?? 0
    return Math.max(1, Math.ceil(total / pageSize))
  }, [conversationsQuery.data?.total, pageSize])

  function applySearch() {
    setQueryApplied(queryDraft.trim())
    setPage(0)
    setSelectedMatchId(null)
  }

  async function handleLoadMore() {
    if (!selectedMatchId || !nextPageToken) return
    setIsLoadingMore(true)
    setLoadMoreError(null)
    try {
      const next = await fetchAdminChatMessages(selectedMatchId, {
        order: 'asc',
        size: MESSAGE_PAGE_SIZE,
        pageToken: nextPageToken,
      })
      setMessages((current) => [...current, ...next.items])
      setNextPageToken(next.nextPageToken)
    } catch (error) {
      setLoadMoreError(error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  return (
    <section className="space-y-4">
      <PageHeader
        title="Chat Conversations"
        description="Browse matches with Twilio conversations by match date and read full transcripts."
      />

      <Card>
        <CardContent className="grid gap-3 p-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="md:col-span-2 xl:col-span-2">
            <DateGranularityControls
              start={filters.start}
              end={filters.end}
              granularity={filters.granularity}
              onChange={(next) => {
                setFilters(next)
                setPage(0)
                setSelectedMatchId(null)
              }}
              showGranularity={false}
            />
          </div>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block">Search</span>
            <div className="flex gap-2">
              <Input
                aria-label="Search conversations"
                placeholder="Member / phone / name / userId"
                value={queryDraft}
                onChange={(event) => setQueryDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    applySearch()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={applySearch}>
                Search
              </Button>
            </div>
          </label>
          <label className="text-sm text-slate-600">
            <span className="mb-1 block">Page size</span>
            <Select
              aria-label="Page size"
              value={String(pageSize)}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setPage(0)
                setSelectedMatchId(null)
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </label>
        </CardContent>
      </Card>

      <p className="text-sm text-slate-600">
        Total conversations:{' '}
        <span className="font-semibold text-slate-900">
          {conversationsQuery.data ? formatNumber(conversationsQuery.data.total) : '—'}
        </span>
      </p>

      {conversationsQuery.isError ? (
        <QueryFeedback
          loading={false}
          error={conversationsQuery.error}
          onRetry={() => void conversationsQuery.refetch()}
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-3 py-2 text-sm font-medium text-slate-800">
            Match list
          </div>
          {conversationsQuery.isLoading ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={`chat-list-${index + 1}`} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          ) : null}
          {!conversationsQuery.isLoading && !conversationsQuery.isError && !conversationsQuery.data?.items.length ? (
            <div className="p-3">
              <EmptyState
                title="No conversations in range."
                subtitle="Widen the date range or clear search."
              />
            </div>
          ) : null}
          {!conversationsQuery.isLoading && conversationsQuery.data && conversationsQuery.data.items.length > 0 ? (
            <>
              <ChatConversationList
                items={conversationsQuery.data.items}
                selectedMatchId={selectedMatchId}
                onSelect={(matchId) => {
                  setSelectedMatchId(matchId)
                  setMessages([])
                  setNextPageToken(null)
                  setLoadMoreError(null)
                }}
              />
              <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-2">
                <p className="text-xs text-slate-600">
                  Page {page + 1} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={page <= 0}
                    onClick={() => {
                      setPage((current) => Math.max(0, current - 1))
                      setSelectedMatchId(null)
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={page + 1 >= totalPages}
                    onClick={() => {
                      setPage((current) => current + 1)
                      setSelectedMatchId(null)
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <div className="space-y-2">
          <ChatTranscriptPanel
            conversation={selectedConversation}
            messages={messages}
            isLoading={Boolean(selectedMatchId) && messagesQuery.isLoading}
            error={selectedMatchId ? messagesQuery.error ?? loadMoreError : null}
            onRetry={() => void messagesQuery.refetch()}
            nextPageToken={nextPageToken}
            isLoadingMore={isLoadingMore}
            onLoadMore={() => void handleLoadMore()}
          />
        </div>
      </div>
    </section>
  )
}
