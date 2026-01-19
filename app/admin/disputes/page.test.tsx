import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createClient } from '@/lib/supabase/client'
import DisputesPage from './page'

// Mock modules
jest.mock('@/lib/supabase/client')

describe('DisputesPage', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn(),
    }
    ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Test Case 4: Resolves disputes and refreshes list', () => {
    const mockDisputes = [
      {
        id: 'dispute-1',
        status: 'open',
        reason: 'Item not as described',
        dispute_type: 'quality',
        created_at: '2026-01-15T10:00:00Z',
        transaction: {
          id: 'txn-1',
          buyer: { full_name: 'John Doe' },
          seller: { full_name: 'Jane Smith' },
        },
      },
      {
        id: 'dispute-2',
        status: 'open',
        reason: 'Item never arrived',
        dispute_type: 'delivery',
        created_at: '2026-01-16T14:30:00Z',
        transaction: {
          id: 'txn-2',
          buyer: { full_name: 'Bob Wilson' },
          seller: { full_name: 'Alice Brown' },
        },
      },
    ]

    it('should resolve dispute and refresh the list', async () => {
      // Initial fetch
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockDisputes,
          error: null,
        }),
      })

      // Mock update for resolution
      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'disputes') {
          return {
            select: mockSelect,
            update: mockUpdate,
          }
        }
        return { select: jest.fn() }
      })

      render(<DisputesPage />)

      // Wait for disputes to load
      await waitFor(() => {
        expect(screen.getByText('Item not as described')).toBeInTheDocument()
      })

      // Select a dispute
      const disputeButton = screen.getByText('Item not as described')
      fireEvent.click(disputeButton)

      // Wait for dispute details to show
      await waitFor(() => {
        expect(screen.getByText('Dispute Details')).toBeInTheDocument()
      })

      // Fill resolution notes
      const textarea = screen.getByPlaceholderText(/Document your resolution/i)
      fireEvent.change(textarea, {
        target: { value: 'Resolved after reviewing evidence' },
      })

      // Setup mock for refresh after resolution
      const mockSelectAfterUpdate = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: [mockDisputes[1]], // Only second dispute remains
          error: null,
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'disputes') {
          return {
            select: mockSelectAfterUpdate,
            update: mockUpdate,
          }
        }
        return { select: jest.fn() }
      })

      // Click resolve button
      const resolveButton = screen.getByRole('button', { name: /^Resolve$/i })
      fireEvent.click(resolveButton)

      // Verify update was called with correct parameters
      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({
          status: 'resolved',
          resolved_at: expect.any(String),
          resolution_notes: 'Resolved after reviewing evidence',
        })
      })

      // Verify fetchDisputes was called again (refresh)
      await waitFor(() => {
        expect(mockSelectAfterUpdate).toHaveBeenCalled()
      })
    })

    it('should issue refund and refresh the list', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockDisputes,
          error: null,
        }),
      })

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'disputes') {
          return {
            select: mockSelect,
            update: mockUpdate,
          }
        }
        return { select: jest.fn() }
      })

      render(<DisputesPage />)

      await waitFor(() => {
        expect(screen.getByText('Item never arrived')).toBeInTheDocument()
      })

      // Select a dispute
      fireEvent.click(screen.getByText('Item never arrived'))

      // Fill resolution notes
      const textarea = screen.getByPlaceholderText(/Document your resolution/i)
      fireEvent.change(textarea, {
        target: { value: 'Issuing full refund to buyer' },
      })

      // Click refund button
      const refundButton = screen.getByRole('button', { name: /Issue Refund/i })
      fireEvent.click(refundButton)

      // Verify update was called with refunded status
      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({
          status: 'refunded',
          resolved_at: expect.any(String),
          resolution_notes: 'Issuing full refund to buyer',
        })
      })
    })

    it('should clear selected dispute and notes after resolution', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockDisputes,
          error: null,
        }),
      })

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: null,
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'disputes') {
          return {
            select: mockSelect,
            update: mockUpdate,
          }
        }
        return { select: jest.fn() }
      })

      render(<DisputesPage />)

      await waitFor(() => {
        expect(screen.getByText('Item not as described')).toBeInTheDocument()
      })

      // Select dispute and add notes
      fireEvent.click(screen.getByText('Item not as described'))

      const textarea = screen.getByPlaceholderText(/Document your resolution/i)
      fireEvent.change(textarea, { target: { value: 'Test notes' } })

      // Resolve
      const resolveButton = screen.getByRole('button', { name: /^Resolve$/i })
      fireEvent.click(resolveButton)

      // After resolution, should show "Select a dispute to review"
      await waitFor(() => {
        expect(screen.getByText('Select a dispute to review')).toBeInTheDocument()
      })
    })

    it('should display open disputes count correctly', async () => {
      const mixedDisputes = [
        ...mockDisputes,
        {
          id: 'dispute-3',
          status: 'resolved',
          reason: 'Already resolved',
          dispute_type: 'other',
          created_at: '2026-01-10T10:00:00Z',
          transaction: {
            id: 'txn-3',
            buyer: { full_name: 'Test Buyer' },
            seller: { full_name: 'Test Seller' },
          },
        },
      ]

      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mixedDisputes,
          error: null,
        }),
      })

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      })

      render(<DisputesPage />)

      await waitFor(() => {
        // Should show 2 open disputes (filtering out resolved)
        expect(screen.getByText(/Disputes \(2\)/i)).toBeInTheDocument()
      })

      // Verify only open disputes are shown in the list
      expect(screen.getByText('Item not as described')).toBeInTheDocument()
      expect(screen.getByText('Item never arrived')).toBeInTheDocument()
      expect(screen.queryByText('Already resolved')).not.toBeInTheDocument()
    })

    it('should handle errors during dispute resolution gracefully', async () => {
      const mockSelect = jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockDisputes,
          error: null,
        }),
      })

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          error: { message: 'Update failed' },
        }),
      })

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'disputes') {
          return {
            select: mockSelect,
            update: mockUpdate,
          }
        }
        return { select: jest.fn() }
      })

      render(<DisputesPage />)

      await waitFor(() => {
        expect(screen.getByText('Item not as described')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Item not as described'))

      const textarea = screen.getByPlaceholderText(/Document your resolution/i)
      fireEvent.change(textarea, { target: { value: 'Test' } })

      const resolveButton = screen.getByRole('button', { name: /^Resolve$/i })
      fireEvent.click(resolveButton)

      // Even with error, fetchDisputes should not be called (since error occurred)
      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalled()
      })

      // Selected dispute should still be there since update failed
      expect(screen.getByText('Dispute Details')).toBeInTheDocument()
    })
  })
})
