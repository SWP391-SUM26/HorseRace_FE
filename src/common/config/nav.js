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
      { label: "Overview", to: "/owner-dashboard", icon: LayoutDashboard },
      { label: "Stable Management", to: "/owner-dashboard/stable", icon: HorseIcon },
      { label: "Jockey Market", to: "/owner-dashboard/jockeys", icon: Users },
      { label: "Invitations", to: "/owner/invitations", icon: Mail },
      { label: "Race Calendar", to: "/owner-dashboard/calendar", icon: CalendarDays },
      { label: "Financials", to: "/owner-dashboard/financials", icon: Wallet },
      { label: "Profile", to: "/profile", icon: UserCog }
    ],
    topbar: [
      { label: "Dashboard", to: "/owner-dashboard" },
      { label: "Stable", to: "/owner-dashboard/stable" },
      { label: "Marketplace", to: "/owner-dashboard/jockeys" },
      { label: "Schedule", to: "/owner-dashboard/calendar" }
    ],
    primaryAction: { label: "Register Horse", to: "/owner-dashboard/stable" }
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
      { label: "Overview", to: "/admin", icon: LayoutDashboard },
      { label: "Tournaments", to: "/admin/tournaments", icon: Trophy },
      { label: "Users", to: "/admin/users", icon: Users },
      { label: "Staffing", to: "/admin/staffing", icon: UserCog },
      { label: "Races", to: "/admin/races", icon: Flag },
      { label: "Registrations", to: "/admin/registrations", icon: ClipboardList },
      { label: "Horses", to: "/admin/horses", icon: HorseIcon },
      { label: "Jockeys", to: "/admin/jockeys", icon: Users },
      { label: "Oversight", to: "/admin/oversight", icon: Eye }
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

function roleWord(role) {
  return ROLE_LABELS[role];
}

export {
  ROLE_NAV,
  roleWord
};
