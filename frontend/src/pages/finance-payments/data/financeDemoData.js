export const financeUsers = [
  { id: "user-1", name: "Ayesha Perera", role: "USER", communityId: "community-1" },
  { id: "user-2", name: "Nimal Silva", role: "USER", communityId: "community-1" },
  { id: "user-3", name: "Kavindu Fernando", role: "USER", communityId: "community-2" },
  { id: "officer-1", name: "Saman Wijesinghe", role: "OFFICER", communityId: "community-1" },
  { id: "admin-1", name: "Madhavi Senaratne", role: "ADMIN", communityId: "community-1" },
];

export const communities = [
  { id: "community-1", name: "Moratuwa Community", location: "Moratuwa" },
  { id: "community-2", name: "Galle Coastal Community", location: "Galle" },
];

export const projects = [
  {
    id: "project-1",
    name: "Moratuwa Solar Rooftop",
    type: "Solar",
    communityId: "community-1",
    targetAmount: 1200000,
    minimumRequiredAmount: 1200000,
    officerApprovalStatus: "Pending Officer Review",
    approvedAt: null,
    activeAt: null,
  },
  {
    id: "project-2",
    name: "Community Hydro Upgrade",
    type: "Hydro",
    communityId: "community-1",
    targetAmount: 800000,
    minimumRequiredAmount: 800000,
    officerApprovalStatus: "Approved by Officer",
    approvedAt: "2026-02-10",
    activeAt: null,
  },
  {
    id: "project-3",
    name: "Galle Wind Storage Link",
    type: "Wind",
    communityId: "community-2",
    targetAmount: 1500000,
    minimumRequiredAmount: 1500000,
    officerApprovalStatus: "Pending Officer Review",
    approvedAt: null,
    activeAt: null,
  },
];

export const fundingSources = [
  {
    id: "source-1",
    fundName: "Government Green Grant",
    fundType: "GRANT",
    contactPhone: "+94 11 234 5566",
    description: "National renewable development allocation",
    isActive: true,
  },
  {
    id: "source-2",
    fundName: "Community Development Bank",
    fundType: "LOAN",
    contactPhone: "+94 41 998 8800",
    description: "Bridge financing for infrastructure purchase",
    isActive: true,
  },
  {
    id: "source-3",
    fundName: "Member Community Fund",
    fundType: "COMMUNITY FUND",
    contactPhone: "+94 77 456 2231",
    description: "Reserved fund for community energy expansion",
    isActive: true,
  },
];

export const fundingRecords = [
  {
    id: "record-1",
    projectId: "project-1",
    sourceId: "source-1",
    amount: 500000,
    status: "RECEIVED",
    date: "2026-03-05",
    note: "Initial disbursement released",
  },
  {
    id: "record-2",
    projectId: "project-1",
    sourceId: "source-2",
    amount: 200000,
    status: "PENDING",
    date: "2026-03-15",
    note: "Awaiting bank board approval",
  },
  {
    id: "record-3",
    projectId: "project-2",
    sourceId: "source-3",
    amount: 250000,
    status: "RECEIVED",
    date: "2026-02-02",
    note: "Community fund release",
  },
  {
    id: "record-4",
    projectId: "project-3",
    sourceId: "source-2",
    amount: 450000,
    status: "RECEIVED",
    date: "2026-03-09",
    note: "First financing tranche",
  },
];

export const memberPayments = [
  {
    id: "payment-1",
    memberId: "user-1",
    projectId: "project-1",
    paymentType: "JOINING",
    method: "BANK",
    amount: 30000,
    month: "2026-03",
    date: "2026-03-11",
    note: "Initial member contribution",
  },
  {
    id: "payment-2",
    memberId: "user-2",
    projectId: "project-1",
    paymentType: "MONTHLY_MAINTENANCE",
    method: "TRANSFER",
    amount: 12000,
    month: "2026-03",
    date: "2026-03-18",
    note: "Monthly contribution",
  },
  {
    id: "payment-3",
    memberId: "user-1",
    projectId: "project-2",
    paymentType: "OTHER",
    method: "CASH",
    amount: 18000,
    month: "2026-02",
    date: "2026-02-23",
    note: "Special contribution",
  },
  {
    id: "payment-4",
    memberId: "user-3",
    projectId: "project-3",
    paymentType: "JOINING",
    method: "BANK",
    amount: 50000,
    month: "2026-03",
    date: "2026-03-21",
    note: "Joining payment",
  },
];

export const maintenanceExpenses = [
  {
    id: "expense-1",
    projectId: "project-1",
    amount: 8000,
    category: "SERVICE",
    date: "2026-03-22",
    description: "Preventive maintenance visit",
  },
  {
    id: "expense-2",
    projectId: "project-2",
    amount: 15000,
    category: "REPAIR",
    date: "2026-02-27",
    description: "Hydro inlet repair",
  },
];
