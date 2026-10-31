import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { ExchangeTransaction } from '../types';
import { exchangeService } from '../services/exchangeService';
import { useAuth } from './AuthContext';

interface ExchangeContextType {
  exchanges: ExchangeTransaction[];
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  actionRequiredTotal: number;
  actionRequiredLending: number;
  actionRequiredBorrowing: number;
  acceptRequest: (exchangeId: string) => Promise<void>;
  declineRequest: (exchangeId: string, reason?: string) => Promise<void>;
  cancelRequest: (exchangeId: string) => Promise<void>;
  confirmPickupHandover: (exchangeId: string, role: 'lender' | 'borrower') => Promise<void>;
  sendHandoverReminder: (exchangeId: string, role: 'lender' | 'borrower') => Promise<void>;
  reportHandoverDispute: (exchangeId: string, reason: string) => Promise<void>;
  initiateReturn: (
    exchangeId: string,
    details: { date: string; time: string; spot: string; note: string; trackingCode: string }
  ) => Promise<void>;
  confirmReturnHandedBack: (exchangeId: string) => Promise<void>;
  confirmReturnReceipt: (
    exchangeId: string,
    conditionVerified: 'Like New' | 'Good' | 'Minor Wear' | 'Damaged',
    conditionNotes?: string
  ) => Promise<void>;
  submitRating: (exchangeId: string, role: 'lender' | 'borrower', rating: number, feedback: string) => Promise<void>;
  addDonationToPrivateCollection: (exchange: ExchangeTransaction) => Promise<void>;
  createBorrowRequest: (params: any) => Promise<ExchangeTransaction>;
  createGiftClaim: (params: any) => Promise<ExchangeTransaction>;
  cancelPendingRequestsForBook: (bookId: string, reason: string) => Promise<number>;
  isBookInActiveExchange: (bookId: string) => {
    isLocked: boolean;
    hasPendingRequests: boolean;
    pendingCount: number;
    reason?: string;
    borrower?: string;
  };
  refreshExchanges: () => Promise<void>;
}

const ExchangeContext = createContext<ExchangeContextType | undefined>(undefined);

export const ExchangeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [exchanges, setExchanges] = useState<ExchangeTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = currentUser?.id || 'demo-user';
  const currentUserDisplayName = currentUser?.displayName || 'Maya Lin';

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await exchangeService.getExchanges(currentUserId, currentUserDisplayName);
      setExchanges(data);
    } catch (err: any) {
      console.error('Failed to load exchanges:', err);
      setError(err?.message || 'Failed to connect to exchange database');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId, currentUserDisplayName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper to update a single transaction in state immutably
  const updateExchangeInState = useCallback((updated: ExchangeTransaction) => {
    setExchanges((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }, []);

  // Dynamic Action Required Badge Counts
  const badgeCounts = useMemo(() => {
    return exchangeService.getActionRequiredCount(currentUserId, currentUserDisplayName, exchanges);
  }, [currentUserId, currentUserDisplayName, exchanges]);

  const acceptRequest = async (exchangeId: string) => {
    setError(null);
    try {
      await exchangeService.acceptRequest(exchangeId, currentUserId);
      // Reload all exchanges to reflect the accepted request and auto-declined competing requests
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to accept request');
      throw err;
    }
  };

  const declineRequest = async (exchangeId: string, reason?: string) => {
    setError(null);
    try {
      const updated = await exchangeService.declineRequest(exchangeId, reason, currentUserId);
      updateExchangeInState(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to decline request');
      throw err;
    }
  };

  const cancelRequest = async (exchangeId: string) => {
    setError(null);
    try {
      const updated = await exchangeService.cancelRequest(exchangeId, currentUserId);
      updateExchangeInState(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to cancel request');
      throw err;
    }
  };

  const confirmPickupHandover = async (exchangeId: string, role: 'lender' | 'borrower') => {
    setError(null);
    try {
      const updated = await exchangeService.confirmPickupHandover(exchangeId, role, currentUserId);
      updateExchangeInState(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to confirm handover');
      throw err;
    }
  };

  const sendHandoverReminder = async (exchangeId: string, role: 'lender' | 'borrower') => {
    setError(null);
    try {
      const updated = await exchangeService.sendHandoverReminder(exchangeId, role);
      updateExchangeInState(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reminder');
      throw err;
    }
  };

  const reportHandoverDispute = async (exchangeId: string, reason: string) => {
    setError(null);
    try {
      const updated = await exchangeService.reportHandoverDispute(exchangeId, currentUserId, reason);
      updateExchangeInState(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to report dispute');
      throw err;
    }
  };

  const initiateReturn = async (
    exchangeId: string,
    details: { date: string; time: string; spot: string; note: string; trackingCode: string }
  ) => {
    setError(null);
    try {
      const updated = await exchangeService.initiateReturn(exchangeId, details);
      updateExchangeInState(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to schedule return');
      throw err;
    }
  };

  const confirmReturnHandedBack = async (exchangeId: string) => {
    setError(null);
    try {
      const updated = await exchangeService.confirmReturnHandedBack(exchangeId);
      updateExchangeInState(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to confirm return handover');
      throw err;
    }
  };

  const confirmReturnReceipt = async (
    exchangeId: string,
    conditionVerified: 'Like New' | 'Good' | 'Minor Wear' | 'Damaged',
    conditionNotes?: string
  ) => {
    setError(null);
    try {
      const updated = await exchangeService.confirmReturnReceipt(
        exchangeId,
        conditionVerified,
        conditionNotes,
        currentUserId
      );
      updateExchangeInState(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to confirm return receipt');
      throw err;
    }
  };

  const submitRating = async (
    exchangeId: string,
    role: 'lender' | 'borrower',
    rating: number,
    feedback: string
  ) => {
    setError(null);
    try {
      const updated = await exchangeService.submitRating(exchangeId, role, rating, feedback, currentUserId);
      updateExchangeInState(updated);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit rating');
      throw err;
    }
  };

  const addDonationToPrivateCollection = async (exchange: ExchangeTransaction) => {
    setError(null);
    try {
      await exchangeService.addDonationToPrivateCollection(exchange, currentUserId);
    } catch (err: any) {
      setError(err?.message || 'Failed to add donation to private collection');
      throw err;
    }
  };

  const createBorrowRequest = async (params: any) => {
    setError(null);
    try {
      const newEx = await exchangeService.createBorrowRequest(params);
      setExchanges((prev) => [newEx, ...prev]);
      return newEx;
    } catch (err: any) {
      setError(err?.message || 'Failed to submit borrow request');
      throw err;
    }
  };

  const createGiftClaim = async (params: any) => {
    setError(null);
    try {
      const newEx = await exchangeService.createGiftClaim(params);
      setExchanges((prev) => [newEx, ...prev]);
      return newEx;
    } catch (err: any) {
      setError(err?.message || 'Failed to claim gift');
      throw err;
    }
  };

  const cancelPendingRequestsForBook = async (bookId: string, reason: string) => {
    setError(null);
    try {
      const cancelledCount = await exchangeService.cancelPendingRequestsForBook(bookId, reason);
      if (cancelledCount > 0) {
        await loadData();
      }
      return cancelledCount;
    } catch (err: any) {
      setError(err?.message || 'Failed to cancel requests');
      throw err;
    }
  };

  const isBookInActiveExchange = useCallback(
    (bookId: string) => {
      return exchangeService.isBookInActiveExchange(bookId, exchanges);
    },
    [exchanges]
  );

  const value = {
    exchanges,
    isLoading,
    error,
    clearError,
    actionRequiredTotal: badgeCounts.total,
    actionRequiredLending: badgeCounts.lending,
    actionRequiredBorrowing: badgeCounts.borrowing,
    acceptRequest,
    declineRequest,
    cancelRequest,
    confirmPickupHandover,
    sendHandoverReminder,
    reportHandoverDispute,
    initiateReturn,
    confirmReturnHandedBack,
    confirmReturnReceipt,
    submitRating,
    addDonationToPrivateCollection,
    createBorrowRequest,
    createGiftClaim,
    cancelPendingRequestsForBook,
    isBookInActiveExchange,
    refreshExchanges: loadData,
  };

  return <ExchangeContext.Provider value={value}>{children}</ExchangeContext.Provider>;
};

export const useExchanges = () => {
  const context = useContext(ExchangeContext);
  if (!context) {
    throw new Error('useExchanges must be used within an ExchangeProvider');
  }
  return context;
};
