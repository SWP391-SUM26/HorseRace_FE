import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTransactions, getVnPayReturn, getWallet, topup, withdraw } from "./api";

export function useWallet() {
  return useQuery({ queryKey: ["wallet", "balance"], queryFn: getWallet });
}

export function useTransactions(query = {}) {
  return useQuery({
    queryKey: ["wallet", "transactions", query],
    queryFn: () => getTransactions(query)
  });
}

export function useTopup() {
  return useMutation({ mutationFn: (amount) => topup(amount) });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (amount) => withdraw(amount),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wallet"] })
  });
}

export function useVnPayReturn(queryString) {
  return useQuery({
    queryKey: ["wallet", "vnpay-return", queryString],
    queryFn: () => getVnPayReturn(queryString),
    retry: false
  });
}
