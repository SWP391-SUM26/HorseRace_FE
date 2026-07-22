import { ROLE_LABELS } from "@/common/config/roles";
import {
  LayoutDashboard,
  Rabbit,
  Users,
  Trophy,
  Flag,
  ClipboardList,
  Wallet,
  Mail,
  UserCog,
  ShieldCheck,
  CalendarDays,
  Coins,
  Radio,
  BarChart3,
  FileText
} from "lucide-react";
const HorseIcon = Rabbit;

const ROLE_NAV = {
  HORSE_OWNER: {
    sidebar: [
      { label: "Tournaments", to: "/owner/tournaments", icon: Trophy },
      { label: "Stable Management", to: "/owner/stable", icon: HorseIcon },
      { label: "Jockey Market", to: "/owner/jockey-market", icon: Users },
      { label: "Race Schedule", to: "/owner/race-schedule", icon: CalendarDays },
      { label: "Race Results", to: "/owner/results", icon: Flag },
      { label: "Financials", to: "/owner/financials", icon: BarChart3 },
      { label: "Wallet", to: "/wallet", icon: Wallet },
      { label: "Profile", to: "/profile", icon: UserCog }
    ],
    topbar: [
      { label: "Dashboard", to: "/owner/tournaments" },
      { label: "Stable", to: "/owner/stable" },
      { label: "Marketplace", to: "/owner/jockey-market" },
      { label: "Schedule", to: "/owner/race-schedule" }
    ],
    primaryAction: { label: "Register Horse", to: "/owner/stable/new" }
  },
  JOCKEY: {
    sidebar: [
      { label: "Dashboard", to: "/jockey-dashboard", icon: LayoutDashboard },
      { label: "Invitations", to: "/jockey/invitations", icon: Mail },
      { label: "Race Schedule", to: "/jockey/schedule", icon: CalendarDays },
      { label: "Performance", to: "/jockey/performance", icon: BarChart3 },
      { label: "Wallet", to: "/wallet", icon: Wallet },
      { label: "Profile", to: "/jockey/profile", icon: UserCog }
    ],
    topbar: []
  },
  RACE_REFEREE: {
    sidebar: [
      { label: "Dashboard", to: "/referee/dashboard", icon: LayoutDashboard },
      { label: "Pre-Race Inspection", to: "/referee/inspection", icon: ShieldCheck },
      { label: "Results", to: "/referee/race-result-recording", icon: Flag },
      { label: "Violations", to: "/referee/violations", icon: ClipboardList },
      { label: "Race Reports", to: "/referee/reports", icon: FileText },
      { label: "Applicant Approval", to: "/referee/applications", icon: ClipboardList },
      { label: "Tournament Invitations", to: "/referee/invitations", icon: Mail },
      { label: "My Race Assignments", to: "/referee/race-assignments", icon: CalendarDays },
    ],
    topbar: []
  },
  ADMIN: {
    sidebar: [
      { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
      { label: "User Management", to: "/admin/users", icon: Users },
      { label: "Horses", to: "/admin/horses", icon: HorseIcon },
      { label: "Jockeys", to: "/admin/jockeys", icon: Users },
      { label: "Tournaments", to: "/admin/tournaments", icon: Trophy },
      { label: "Race Calendar", to: "/admin/races", icon: CalendarDays },
      { label: "Race Reports", to: "/admin/reports", icon: FileText },
      { label: "Registration Approval", to: "/admin/registrations", icon: ClipboardList },
      { label: "Withdrawals", to: "/admin/withdrawals", icon: Wallet },
      { label: "Predictions", to: "/admin/predictions", icon: Coins }
    ],
    topbar: []
  },
  SPECTATOR: {
    sidebar: [
      // "Race Schedule" (/spectator/schedule) and "Tournaments" (/spectator/tournaments) used to
      // sit here, but neither route has ever been defined — both were dead links.
      { label: "Lobby", to: "/spectator-dashboard", icon: LayoutDashboard },
      { label: "Predictions", to: "/spectator/predictions", icon: Coins },
      { label: "Rewards", to: "/spectator/rewards", icon: Trophy },
      { label: "Live Races", to: "/spectator/live-races", icon: Radio },
      { label: "Wallet", to: "/wallet", icon: Wallet }
    ],
    topbar: [
      { label: "Live Races", to: "/spectator-dashboard" },
      { label: "Predictions", to: "/spectator/predictions" },
      { label: "Rewards", to: "/spectator/rewards" },
      { label: "Wallet", to: "/wallet" }
    ]
  }
};

ROLE_NAV.OWNER = ROLE_NAV.HORSE_OWNER;

function roleWord(role) {
  return ROLE_LABELS[role] || ROLE_LABELS.HORSE_OWNER;
}

export {
  ROLE_NAV,
  roleWord
};
