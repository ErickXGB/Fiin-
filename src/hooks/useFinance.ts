import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Budget, BudgetPeriod, Transaction } from '../types/finance';
import {
  createBudget, createTransaction as createTransactionDoc, deleteTransaction as deleteTransactionDoc,
  subscribeBudgets, subscribeTransactions, updateBudget, type NewBudget, type NewTransaction,
} from '../services/financeService';
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
  const [loading, setLoading] = useState<boolean>(Boolean(uid));
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  useEffect(() => {
    if (!uid) {
      setTransactions([]); setBudgets([]); setLoading(false);
      return;
    }
    setLoading(true);
    let active = true;
    const pending = { transactions: true, budgets: true };
    const settle = (key: keyof typeof pending) => {
      if (!active || !pending[key]) return;
      pending[key] = false;
      if (!pending.transactions && !pending.budgets) setLoading(false);
    };
    const unsubTx = subscribeTransactions(uid, (d) => { setTransactions(d); settle('transactions'); }, () => settle('transactions'));
    const unsubBg = subscribeBudgets(uid, (d) => { setBudgets(d); settle('budgets'); }, () => settle('budgets'));
    return () => { active = false; unsubTx(); unsubBg(); };
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

  const weeklyStats = useMemo(() => toStats(weeklyTransactions, pickBudget(budgets, 'weekly', todayKey)), [weeklyTransactions, budgets, todayKey]);
  const monthlyStats = useMemo(() => toStats(monthlyTransactions, pickBudget(budgets, 'monthly', selectedKey)), [monthlyTransactions, budgets, selectedKey]);

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

  const removeTransaction = useCallback((id: string) => {
    if (!uid) throw new Error('Usuario no autenticado');
    return deleteTransactionDoc(uid, id);
  }, [uid]);

  const saveBudget = useCallback(async (data: NewBudget, id?: string) => {
    if (!uid) throw new Error('Usuario no autenticado');
    const targetId = id ?? budgets.find((b) => b.period === data.period && b.startDate === data.startDate)?.id;
    if (targetId) { await updateBudget(uid, targetId, data); return targetId; }
    return createBudget(uid, data);
  }, [uid, budgets]);

  return {
    loading, weeklyStats, monthlyStats, weeklyIncome, monthlyIncome, netBalance,
    annualIncome, annualExpense, annualBalance,
    weeklyTransactions, monthlyTransactions, annualTransactions, selectedDate, isCurrentMonth,
    prevMonth, nextMonth, createTransaction, removeTransaction, saveBudget,
  };
}
