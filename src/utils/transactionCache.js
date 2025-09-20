// src/utils/transactionCache.js

export const getCachedTransactions = (empCode, rangeKey) => {
  const saved = localStorage.getItem("transactionCache");
  if (!saved) return null;
  const cache = JSON.parse(saved);
  return cache[empCode]?.[rangeKey] || null;
};

export const saveTransactionsToCache = (empCode, rangeKey, txList) => {
  const saved = localStorage.getItem("transactionCache");
  const cache = saved ? JSON.parse(saved) : {};
  if (!cache[empCode]) cache[empCode] = {};
  cache[empCode][rangeKey] = txList;
  localStorage.setItem("transactionCache", JSON.stringify(cache));
};
