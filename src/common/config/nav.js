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
  Eye,
  CalendarDays,
  Coins,
  Radio,
  BarChart3,
  FileText,
  UserSquare
} from "lucide-react";
const HorseIcon = Rabbit;

const ROLE_NAV = {
  HORSE_OWNER: {
    sidebar: [
      { label: "Overview", to: "/owner/overview", icon: LayoutDashboard },
      { label: "Stable Management", to: "/owner/stable", icon: HorseIcon },
      { label: "Jockey Market", to: "/owner/jockey-market", icon: Users },
      { label: "Race Schedule", to: "/owner/race-schedule", icon: CalendarDays },
      { label: "Profile", to: "/profile", icon: UserCog }
    ],
    topbar: [
      { label: "Dashboard", to: "/owner/overview" },
      { label: "Stable", to: "/owner/stable" },
      { label: "Marketplace", to: "/owner/jockey-market" },
      { label: "Schedule", to: "/owner/race-schedule" }
    ],
    primaryAction: { label: "Register Horse", to: "/owner/stable" }
  },
  JOCKEY: {
    sidebar: [
      { label: "Dashboard", to: "/jockey-dashboard", icon: LayoutDashboard },
      { label: "Invitations", to: "/jockey/invitations", icon: Mail },
      { label: "Race Schedule", to: "/jockey/schedule", icon: CalendarDays },
      { label: "Performance", to: "/jockey/performance", icon: BarChart3 },
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
      { label: "Tournament Invitations", to: "/referee/invitations", icon: Mail },
      { label: "My Race Assignments", to: "/referee/race-assignments", icon: CalendarDays },
      { label: "Live Monitor", to: "/referee/live-monitor", icon: Radio }
    ],
    topbar: []
  },
  ADMIN: {
    sidebar: [
      { label: "Dashboard", to: "/app/admin", icon: LayoutDashboard },
      { label: "User Management", to: "/app/admin/users", icon: Users },
      { label: "Horses", to: "/app/admin/horses", icon: HorseIcon },
      { label: "Jockeys", to: "/app/admin/jockeys", icon: UserSquare },
      { label: "Tournaments", to: "/app/admin/tournaments", icon: Trophy },
      { label: "Race Calendar", to: "/app/admin/races", icon: CalendarDays },
      { label: "Race Reports", to: "/app/admin/reports", icon: FileText },
      { label: "Registration Approval", to: "/app/admin/registrations", icon: ClipboardList },
      { label: "Staffing", to: "/app/admin/staffing", icon: UserCog },
      { label: "Withdrawals", to: "/app/admin/withdrawals", icon: Wallet }
    ],
    topbar: []
  },
  SPECTATOR: {
    sidebar: [
      { label: "Lobby", to: "/spectator-dashboard", icon: LayoutDashboard },
      { label: "Race Schedule", to: "/spectator/schedule", icon: CalendarDays },
      { label: "Predictions", to: "/spectator/predictions", icon: Coins },
      { label: "Rewards", to: "/spectator/rewards", icon: Trophy },
      { label: "Tournaments", to: "/spectator/tournaments", icon: Trophy },
      { label: "Live Races", to: "/spectator/live-races", icon: Radio },
      { label: "Wallet", to: "/wallet", icon: Wallet }
    ],
    topbar: [
      { label: "Live Races", to: "/spectator-dashboard" },
      { label: "Predictions", to: "/spectator/predictions" },
      { label: "Rewards", to: "/spectator/rewards" },
      { label: "Wallet", to: "/app/wallet" }
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
