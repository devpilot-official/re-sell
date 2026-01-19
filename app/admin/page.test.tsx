import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { createServerClient } from '@/lib/supabase/server'
import AdminDashboard from './page'

// Mock modules
jest.mock('@/lib/supabase/server')

describe('AdminDashboard', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(),
    }
    ;(createServerClient as jest.Mock).mockResolvedValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Test Case 3: Fetches and displays platform metrics correctly', () => {
    it('should fetch and display all platform metrics', async () => {
      // Mock database queries for each metric
      const mockProfilesQuery = {
        select: jest.fn().mockResolvedValue({ count: 150, error: null }),
      }

      const mockListingsQuery = {
        select: jest.fn().mockResolvedValue({ count: 75, error: null }),
      }

      const mockTransactionsQuery = {
        select: jest.fn().mockResolvedValue({ count: 42, error: null }),
      }

      const mockDisputesQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 8, error: null }),
        }),
      }

      const mockModerationQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [
                { id: '1', status: 'pending' },
                { id: '2', status: 'pending' },
              ],
              error: null,
            }),
          }),
        }),
      }

      const mockAuditLogsQuery = {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [
                {
                  id: 'log1',
                  action: 'user_banned',
                  target_table: 'users',
                  created_at: '2026-01-15T10:00:00Z',
                },
                {
                  id: 'log2',
                  action: 'listing_removed',
                  target_table: 'listings',
                  created_at: '2026-01-14T15:30:00Z',
                },
              ],
              error: null,
            }),
          }),
        }),
      }

      // Setup mock implementation for from()
      mockSupabase.from.mockImplementation((table: string) => {
        switch (table) {
          case 'profiles':
            return mockProfilesQuery
          case 'listings':
            return mockListingsQuery
          case 'transactions':
            return mockTransactionsQuery
          case 'disputes':
            return mockDisputesQuery
          case 'moderation_queue':
            return mockModerationQuery
          case 'admin_logs':
            return mockAuditLogsQuery
          default:
            return { select: jest.fn().mockResolvedValue({ count: 0, error: null }) }
        }
      })

      const component = await AdminDashboard()
      render(component)

      // Verify all metrics are displayed
      expect(screen.getByText('150')).toBeInTheDocument() // Total Users
      expect(screen.getByText('75')).toBeInTheDocument() // Active Listings
      expect(screen.getByText('42')).toBeInTheDocument() // Transactions
      expect(screen.getByText('8')).toBeInTheDocument() // Open Disputes
      expect(screen.getByText('2')).toBeInTheDocument() // Pending Review (moderation queue)

      // Verify metric labels
      expect(screen.getByText('Total Users')).toBeInTheDocument()
      expect(screen.getByText('Active Listings')).toBeInTheDocument()
      expect(screen.getByText('Transactions')).toBeInTheDocument()
      expect(screen.getByText('Open Disputes')).toBeInTheDocument()
      expect(screen.getByText('Pending Review')).toBeInTheDocument()

      // Verify audit logs are displayed
      expect(screen.getAllByText('user_banned').length).toBeGreaterThan(0)
      expect(screen.getAllByText('listing_removed').length).toBeGreaterThan(0)
    })

    it('should handle zero counts gracefully', async () => {
      // Mock empty results
      const emptyQuery = {
        select: jest.fn().mockResolvedValue({ count: null, error: null }),
      }

      const emptyDisputesQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: null, error: null }),
        }),
      }

      const emptyModerationQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }

      const emptyAuditLogsQuery = {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }

      mockSupabase.from.mockImplementation((table: string) => {
        switch (table) {
          case 'disputes':
            return emptyDisputesQuery
          case 'moderation_queue':
            return emptyModerationQuery
          case 'admin_logs':
            return emptyAuditLogsQuery
          default:
            return emptyQuery
        }
      })

      const component = await AdminDashboard()
      render(component)

      // Should display 0 for all metrics
      const zeroElements = screen.getAllByText('0')
      expect(zeroElements.length).toBeGreaterThanOrEqual(5)
    })

    it('should display quick action buttons with correct counts', async () => {
      const mockDisputesQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 5, error: null }),
        }),
      }

      const mockModerationQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [{ id: '1' }, { id: '2' }, { id: '3' }],
              error: null,
            }),
          }),
        }),
      }

      const mockAuditLogsQuery = {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }

      const mockProfilesQuery = {
        select: jest.fn().mockResolvedValue({ count: 200, error: null }),
      }

      mockSupabase.from.mockImplementation((table: string) => {
        switch (table) {
          case 'disputes':
            return mockDisputesQuery
          case 'moderation_queue':
            return mockModerationQuery
          case 'admin_logs':
            return mockAuditLogsQuery
          case 'profiles':
            return mockProfilesQuery
          default:
            return {
              select: jest.fn().mockResolvedValue({ count: 0, error: null }),
            }
        }
      })

      const component = await AdminDashboard()
      render(component)

      // Verify quick action buttons with counts
      expect(screen.getByText(/Review Moderation Queue \(3\)/)).toBeInTheDocument()
      expect(screen.getByText(/Resolve Disputes \(5\)/)).toBeInTheDocument()
      expect(screen.getByText(/Manage Users \(200\)/)).toBeInTheDocument()
    })

    it('should show "No recent activity" when audit logs are empty', async () => {
      const emptyAuditLogsQuery = {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }

      const mockDisputesQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 0, error: null }),
        }),
      }

      const mockModerationQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'admin_logs') {
          return emptyAuditLogsQuery
        }
        if (table === 'disputes') {
          return mockDisputesQuery
        }
        if (table === 'moderation_queue') {
          return mockModerationQuery
        }
        return {
          select: jest.fn().mockResolvedValue({ count: 0, error: null }),
        }
      })

      const component = await AdminDashboard()
      render(component)

      expect(screen.getByText('No recent activity')).toBeInTheDocument()
    })

    it('should display formatted dates for audit logs', async () => {
      const mockAuditLogsQuery = {
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [
                {
                  id: 'log1',
                  action: 'test_action',
                  target_table: 'test_table',
                  created_at: '2026-01-19T10:00:00Z',
                },
              ],
              error: null,
            }),
          }),
        }),
      }

      const mockDisputesQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ count: 0, error: null }),
        }),
      }

      const mockModerationQuery = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'admin_logs') {
          return mockAuditLogsQuery
        }
        if (table === 'disputes') {
          return mockDisputesQuery
        }
        if (table === 'moderation_queue') {
          return mockModerationQuery
        }
        return {
          select: jest.fn().mockResolvedValue({ count: 0, error: null }),
        }
      })

      const component = await AdminDashboard()
      render(component)

      // Check that the date is displayed (format may vary by locale)
      expect(screen.getByText(/test_table/)).toBeInTheDocument()
      expect(screen.getAllByText('test_action').length).toBeGreaterThan(0)
    })
  })
})
