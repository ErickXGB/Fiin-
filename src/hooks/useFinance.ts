import { useCallback, useEffect, useMemo, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import type { Account, Budget, BudgetPeriod, Transaction } from '../types/finance';
import {
  createBudget, createTransaction as createTransactionDoc, deleteTransaction as deleteTransactionDoc,
  subscribeBudgets, subscribeTransactions, updateBudget, type NewBudget, type NewTransaction,
} from '../services/financeService';
import {
  createAccount, deleteAccount, ensureDefaultAccount,
  subscribeAccounts, updateAccount, type NewAccount,
} from '../services/accountService';
import { getMonthRange, getWeekRange, isDateInRange } from '../utils/dateUtils';

export interface PeriodStats {
  spent: number; limit: number; remaining: number;
  percentage: number; isWarning: boolean; isOver: boolean;
}

const toDateKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const addMonths = (date: Date, delta: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + delta, 1);

const pickBudget = (budgets: Budget[], period: BudgetPeriod, todayKey: string): Budget | undefined => {
  const candidates = budgets
    .filter((b) => b.period === period)
    .sort((a, b) => b.startDate.localeCompare(a.startDate));
  return candidates.find((b) => b.startDate <= todayKey) ?? candidates[0];
};

const toStats = (transactions: Transaction[], budget?: Budget): PeriodStats => {
  const spent = transactions.reduce((tot, tx) => (tx.type === 'expense' ? tot + tx.amount : tot), 0);
  const limit = budget?.limitAmount ?? 0;
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  return { spent, limit, remaining: limit - spent, percentage, isWarning: percentage >= 80, isOver: percentage > 100 };
};

const incomeOf = (txs: Transaction[]): number =>
  txs.reduce((tot, tx) => (tx.type === 'income' ? tot + tx.amount : tot), 0);

export function useFinance(uid: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(Boolean(uid));
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  useEffect(() => {
    if (!uid) {
      setTransactions([]); setBudgets([]); setAccounts([]); setLoading(false);
      return;
    }
    setLoading(true);
    let active = true;
    const pending = { transactions: true, budgets: true, accounts: true };
    const settle = (key: keyof typeof pending) => {
      if (!active || !pending[key]) return;
      pending[key] = false;
      if (!pending.transactions && !pending.budgets && !pending.accounts) setLoading(false);
    };
    void ensureDefaultAccount(uid);
    const unsubTx = subscribeTransactions(uid, (d) => { setTransactions(d); settle('transactions'); }, () => settle('transactions'));
    const unsubBg = subscribeBudgets(uid, (d) => { setBudgets(d); settle('budgets'); }, () => settle('budgets'));
    const unsubAc = subscribeAccounts(uid, (d) => { setAccounts(d); settle('accounts'); }, () => settle('accounts'));
    return () => { active = false; unsubTx(); unsubBg(); unsubAc(); };
  }, [uid]);

  const todayKey = toDateKey(new Date());
  const selectedKey = toDateKey(selectedDate);
  const yearStr = String(selectedDate.getFullYear());

  const weeklyTransactions = useMemo(() => {
    const { start, end } = getWeekRange();
    return transactions.filter((tx) => isDateInRange(tx.date, start, end));
  }, [transactions]);

  const monthlyTransactions = useMemo(() => {
    const { start, end } = getMonthRange(selectedDate);
    return transactions
      .filter((tx) => isDateInRange(tx.date, start, end))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedDate]);

  const annualTransactions = useMemo(
    () => transactions.filter((tx) => tx.date.startsWith(yearStr)),
    [transactions, yearStr],
  );

  const currentWeeklyBudget = useMemo(() => pickBudget(budgets, 'weekly', todayKey), [budgets, todayKey]);
  const currentMonthlyBudget = useMemo(() => pickBudget(budgets, 'monthly', selectedKey), [budgets, selectedKey]);

  const weeklyStats = useMemo(() => toStats(weeklyTransactions, currentWeeklyBudget), [weeklyTransactions, currentWeeklyBudget]);
  const monthlyStats = useMemo(() => toStats(monthlyTransactions, currentMonthlyBudget), [monthlyTransactions, currentMonthlyBudget]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    const values: [string, string][] = [
      ['weekly_spent', usd.format(weeklyStats.spent)], ['weekly_limit', usd.format(weeklyStats.limit)],
      ['weekly_remaining', usd.format(weeklyStats.remaining)],
      ['weekly_percent', String(Math.max(0, Math.min(100, Math.round(weeklyStats.percentage))))],
    ];
    values.forEach(([key, value]) => void Preferences.set({ key, value }));
  }, [weeklyStats]);

  const weeklyIncome = useMemo(() => incomeOf(weeklyTransactions), [weeklyTransactions]);
  const monthlyIncome = useMemo(() => incomeOf(monthlyTransactions), [monthlyTransactions]);
  const netBalance = useMemo(() => monthlyIncome - monthlyStats.spent, [monthlyIncome, monthlyStats.spent]);

  const annualIncome = useMemo(() => incomeOf(annualTransactions), [annualTransactions]);
  const annualExpense = useMemo(
    () => annualTransactions.reduce((acc, tx) => (tx.type === 'expense' ? acc + tx.amount : acc), 0),
    [annualTransactions],
  );
  const annualBalance = useMemo(() => annualIncome - annualExpense, [annualIncome, annualExpense]);

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return selectedDate.getFullYear() === now.getFullYear() && selectedDate.getMonth() === now.getMonth();
  }, [selectedDate]);

  const prevMonth = useCallback(() => setSelectedDate((d) => addMonths(d, -1)), []);
  const nextMonth = useCallback(() => setSelectedDate((d) => {
    const next = addMonths(d, 1);
    const now = new Date();
    return next > new Date(now.getFullYear(), now.getMonth(), 1) ? d : next;
  }), []);

  const createTransaction = useCallback((data: NewTransaction) => {
    if (!uid) throw new Error('Usuario no autenticado');
    return createTransactionDoc(uid, data);
  }, [uid]);

  const totalWalletBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + a.balance, 0),
    [accounts],
  );

  const removeTransaction = useCallback((id: string, tx?: Pick<Transaction, 'accountId' | 'toAccountId' | 'type' | 'amount'>) => {
    if (!uid) throw new Error('Usuario no autenticado');
    return deleteTransactionDoc(uid, id, tx);
  }, [uid]);

  const addAccount = useCallback((data: NewAccount) => {
    if (!uid) throw new Error('Usuario no autenticado');
    return createAccount(uid, data);
  }, [uid]);

  const editAccount = useCallback((id: string, data: Partial<NewAccount>) => {
    if (!uid) throw new Error('Usuario no autenticado');
    return updateAccount(uid, id, data);
  }, [uid]);

  const removeAccount = useCallback((id: string) => {
    if (!uid) throw new Error('Usuario no autenticado');
    return deleteAccount(uid, id);
  }, [uid]);

  const saveBudget = useCallback(async (data: NewBudget, id?: string) => {
    if (!uid) throw new Error('Usuario no autenticado');
    const targetId = id ?? budgets.find((b) => b.period === data.period && b.startDate === data.startDate)?.id;
    if (targetId) { await updateBudget(uid, targetId, data); return targetId; }
    return createBudget(uid, data);
  }, [uid, budgets]);

  return {
    loading, accounts, totalWalletBalance, weeklyStats, monthlyStats, weeklyIncome, monthlyIncome, netBalance,
    annualIncome, annualExpense, annualBalance,
    currentWeeklyBudget, currentMonthlyBudget,
    weeklyTransactions, monthlyTransactions, annualTransactions, selectedDate, isCurrentMonth,
    prevMonth, nextMonth, createTransaction, removeTransaction, saveBudget,
    addAccount, editAccount, removeAccount,
  };
}
