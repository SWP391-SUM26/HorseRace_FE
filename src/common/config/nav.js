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
  BarChart3
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
      { label: "Inspection", to: "/referee/pre-race-inspection", icon: ShieldCheck },
      { label: "Live Monitor", to: "/referee/live-monitor", icon: Radio },
      { label: "Results", to: "/referee/race-result-recording", icon: Flag },
      { label: "Violations", to: "/referee/violations", icon: ClipboardList },
      { label: "Registrations", to: "/referee/registration", icon: Users }
    ],
    topbar: []
  },
  ADMIN: {
    sidebar: [
      { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
      { label: "User Management", to: "/admin/users", icon: Users },
      { label: "Tournaments", to: "/admin/tournaments", icon: Trophy },
      { label: "Race Management", to: "/admin/races", icon: Flag },
      { label: "Race Approval", to: "/admin/race-approval", icon: ClipboardList },
      { label: "Results & Predictions", to: "/admin/results", icon: BarChart3 },
      { label: "Settings", to: "/admin/settings", icon: UserCog }
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
      { label: "Live Races", to: "/spectator/live-races", icon: Radio }
    ],
    topbar: []
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
