import { useQuery } from '@tanstack/react-query'
import { adminClient } from '@/api/client'
import { adminEndpoints } from '@/api/endpoints'
import { cleanQueryParams } from '@/api/params'
import type {
  AdminChatConversationSearchResponse,
  AdminChatMessagesResponse,
  ChatConversationsFilters,
  ChatMessagesFilters,
} from '@/api/types'

export function useAdminChatConversations(filters: ChatConversationsFilters) {
  return useQuery({
    queryKey: ['chat', 'conversations', filters],
    queryFn: async () => {
      const response = await adminClient.get<AdminChatConversationSearchResponse>(
        adminEndpoints.chat.conversations,
        {
          params: cleanQueryParams(filters),
        },
      )
      return response.data
    },
  })
}

export async function fetchAdminChatMessages(
  matchId: string,
  filters: ChatMessagesFilters = {},
): Promise<AdminChatMessagesResponse> {
  const response = await adminClient.get<AdminChatMessagesResponse>(
    adminEndpoints.chat.messages(matchId),
    {
      params: cleanQueryParams(filters),
    },
  )
  return response.data
}

export function useAdminChatMessages(
  matchId: string | null | undefined,
  filters: ChatMessagesFilters = { order: 'asc', size: 50 },
) {
  return useQuery({
    queryKey: ['chat', 'messages', matchId, filters],
    queryFn: async () => fetchAdminChatMessages(matchId ?? '', filters),
    enabled: Boolean(matchId),
  })
}
