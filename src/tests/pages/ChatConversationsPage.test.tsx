import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ChatConversationsPage from '@/pages/chat-conversations/ChatConversationsPage'

vi.mock('@/hooks/api/useAdminChat', () => ({
  useAdminChatConversations: () => ({
    data: { start: '', end: '', total: 0, page: 0, size: 20, items: [] },
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
  useAdminChatMessages: () => ({
    data: undefined,
    error: null,
    isError: false,
    isLoading: false,
    refetch: vi.fn(),
  }),
  fetchAdminChatMessages: vi.fn(),
}))

describe('ChatConversationsPage', () => {
  it('renders header, controls, empty list, and select prompt', () => {
    render(
      <MemoryRouter>
        <ChatConversationsPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Chat Conversations' })).toBeInTheDocument()
    expect(screen.getByLabelText('start-date')).toBeInTheDocument()
    expect(screen.getByLabelText('end-date')).toBeInTheDocument()
    expect(screen.getByLabelText('Search conversations')).toBeInTheDocument()
    expect(screen.getByText('Total conversations:')).toBeInTheDocument()
    expect(screen.getByText('No conversations in range.')).toBeInTheDocument()
    expect(screen.getByText('Select a conversation')).toBeInTheDocument()
  })
})
