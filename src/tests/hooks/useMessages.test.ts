import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMessages } from '../../hooks/useMessages';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import type { Message } from '../../types';

type MockQuery = {
  _table: string;
  _opts?: { head?: boolean };
  _single?: boolean;
  _select?: string;
  select: (columns: string, opts?: unknown) => MockQuery;
  eq: (...args: unknown[]) => MockQuery;
  order: (...args: unknown[]) => MockQuery;
  update: (value: unknown) => MockQuery;
  insert: (value: unknown) => MockQuery;
  then: <T>(resolve: (value: unknown) => T) => Promise<T>;
  catch: (reject: (error: unknown) => unknown) => Promise<unknown>;
};

const inboxMessages: Message[] = [
  { id: 'm1', isi: 'Halo', is_read: false, from_user: 'u2', to_user: 'u1', created_at: '2026-04-14T08:00:00Z' } as Message,
];
const sentMessages: Message[] = [
  { id: 'm2', isi: 'Siap', is_read: true, from_user: 'u1', to_user: 'u2', created_at: '2026-04-14T08:01:00Z' } as Message,
];

const mockSupabase = supabase as unknown as {
  from: (table: string) => MockQuery;
  channel: () => { on: () => unknown; subscribe: () => unknown };
  removeChannel: (channel: unknown) => Promise<unknown>;
};

function queryResult(q: MockQuery) {
  if (q._table !== 'messages') {
    return { data: null, error: null };
  }
  if (q._select?.includes('sender:from_user(id,nama,nrp,pangkat)')) {
    return { data: inboxMessages, error: null };
  }
  if (q._select?.includes('receiver:to_user(id,nama,nrp,pangkat)')) {
    return { data: sentMessages, error: null };
  }
  return { data: [], error: null };
}

function buildQuery(table: string) {
  const q = {
    _table: table,
    _single: false,
    _select: undefined,
  } as MockQuery;

  const chain = () => q;
  q.select = (columns: string, opts?: unknown) => {
    q._select = columns;
    q._opts = opts as { head?: boolean };
    return q;
  };
  q.eq = chain;
  q.order = chain;
  q.update = vi.fn(() => q);
  q.insert = vi.fn(() => q);
  q.then = (resolve) => Promise.resolve(queryResult(q)).then(resolve);
  q.catch = (reject) => Promise.resolve(queryResult(q)).catch(reject);
  return q;
}

describe('useMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'u1', nrp: '11111', nama: 'Prajurit A', role: 'prajurit', satuan: 'Satuan X', is_active: true, is_online: true, login_attempts: 0, created_at: '2026-04-14T00:00:00Z', updated_at: '2026-04-14T00:00:00Z' },
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
    mockSupabase.from = vi.fn((table: string) => buildQuery(table));
    mockSupabase.channel = vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() }));
    mockSupabase.removeChannel = vi.fn().mockResolvedValue(undefined);
  });

  it('loads inbox, sent, and unread count on mount', async () => {
    const { result } = renderHook(() => useMessages());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.inbox).toHaveLength(1);
    expect(result.current.sent).toHaveLength(1);
    expect(result.current.unreadCount).toBe(1);
  });

  it('sends a message and refreshes the inbox', async () => {
    const { result } = renderHook(() => useMessages());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.sendMessage('u2', 'Tugas sudah diterima');
    });

    expect(mockSupabase.from).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('marks a message as read and decrements unread count', async () => {
    const { result } = renderHook(() => useMessages());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.markAsRead('m1');
    });

    expect(result.current.unreadCount).toBe(0);
  });

  it('marks all messages as read', async () => {
    const { result } = renderHook(() => useMessages());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.inbox[0].is_read).toBe(true);
  });
});
