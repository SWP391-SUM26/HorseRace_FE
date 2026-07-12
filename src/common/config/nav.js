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
  BarChart3,
  FileText,
  Radio,
  UserSquare
} from "lucide-react";

const HorseIcon = Rabbit;

const ROLE_NAV = {
  HORSE_OWNER: {
    sidebar: [
      { label: "Overview", to: "/owner/overview", icon: LayoutDashboard },
      { label: "Stable Management", to: "/owner/stable", icon: HorseIcon },
      { label: "Jockey Market", to: "/owner/jockey-market", icon: Users },
      { label: "Race Calendar", to: "/owner/race-schedule", icon: CalendarDays },
      { label: "My Documents", to: "/owner/documents", icon: FileText },
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
      { label: "Pre-Race Inspection", to: "/referee/pre-race-inspection", icon: ShieldCheck },
      { label: "Document Review", to: "/referee/document-review", icon: FileText },
      { label: "Results", to: "/referee/race-result-recording", icon: Flag },
      { label: "Violations", to: "/referee/violations", icon: ClipboardList },
      { label: "Race Reports", to: "/referee/reports", icon: FileText },
      { label: "Live Monitor", to: "/referee/live-monitor", icon: Radio }
    ],
    topbar: []
  },
  ADMIN: {
    sidebar: [
      { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
      { label: "User Management", to: "/admin/users", icon: Users },
      { label: "Horses", to: "/admin/horses", icon: HorseIcon },
      { label: "Jockeys", to: "/admin/jockeys", icon: UserSquare },
      { label: "Tournaments", to: "/admin/tournaments", icon: Trophy },
      { label: "Race Management", to: "/admin/races", icon: CalendarDays },
      { label: "Race Approval", to: "/admin/race-approval", icon: ClipboardList },
      { label: "Results & Predictions", to: "/admin/results", icon: FileText },
      { label: "Staffing", to: "/admin/staffing", icon: UserCog },
      { label: "Settings", to: "/admin/settings", icon: UserCog }
    ],
    topbar: []
  },
  SPECTATOR: {
    sidebar: [
      { label: "Live Races", to: "/spectator/live-races", icon: LayoutDashboard },
      { label: "Predictions", to: "/spectator/predictions", icon: Coins },
      { label: "Rewards", to: "/spectator/rewards", icon: Trophy }
    ],
    topbar: [
      { label: "Live Races", to: "/spectator/live-races" },
      { label: "Predictions", to: "/spectator/predictions" },
      { label: "Rewards", to: "/spectator/rewards" }
    ]
  }
};

function roleWord(role) {
  return role === "HORSE_OWNER" ? "Owner" : ROLE_LABELS[role];
}

export { ROLE_NAV, roleWord };
