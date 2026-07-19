const financeOverviewMock = {
  kpis: {
    totalEarnings: 1245800,
    season: "2023-2024",
    earningsTrend: 12.4,
    pendingPayouts: 42500,
    pendingCount: 3,
    pendingEtaDays: 5,
    totalExpenses: 612400,
    expensesTrend: 4.2,
    netProfit: 633400,
    margin: 50.8
  },
  horses: [
    { id: "h1", name: "Thunderbolt Dash", earnings: 45e4, percent: 100 },
    { id: "h2", name: "Golden Mane", earnings: 32e4, percent: 71 },
    { id: "h3", name: "Emerald Queen", earnings: 285e3, percent: 63 },
    { id: "h4", name: "Sapphire Breeze", earnings: 19e4, percent: 42 }
  ],
  transactions: [
    {
      id: "t1",
      date: "2023-10-24",
      description: "Derby Winner Payout",
      horse: "Thunderbolt Dash",
      category: "INCOME",
      amount: 12e4
    },
    {
      id: "t2",
      date: "2023-10-22",
      description: "Monthly Medical Check",
      horse: "Emerald Queen",
      category: "EXPENSE",
      amount: 4200
    },
    {
      id: "t3",
      date: "2023-10-18",
      description: "Kentucky Cup Entry Fee",
      horse: "Golden Mane",
      category: "EXPENSE",
      amount: 25e3
    },
    {
      id: "t4",
      date: "2023-10-15",
      description: "Stable Training Fees",
      horse: "All Horses",
      category: "EXPENSE",
      amount: 12500
    },
    {
      id: "t5",
      date: "2023-10-12",
      description: "Sponsorship Installment",
      horse: "N/A",
      category: "INCOME",
      amount: 45e3
    },
    {
      id: "t6",
      date: "2023-10-10",
      description: "Specialized Feed Supply",
      horse: "Thunderbolt Dash",
      category: "EXPENSE",
      amount: 3150
    }
  ],
  totalTransactions: 142
};
export {
  financeOverviewMock
};
