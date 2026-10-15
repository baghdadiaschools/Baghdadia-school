import {
  BookOpen,
  CalendarDays,
  Sparkles,
  Video,
  CalendarRange,
  MessagesSquare,
  ClipboardCheck,
  Megaphone,
} from "lucide-react";
export const categories = [
  { id: "homework", icon: BookOpen, color: "blue" },
  { id: "timetable", icon: CalendarDays, color: "teal" },
  { id: "tutor", icon: Sparkles, color: "violet" },
  { id: "classes", icon: Video, color: "coral" },
  { id: "planner", icon: CalendarRange, color: "gold" },
  { id: "teachers", icon: MessagesSquare, color: "green" },
  { id: "exams", icon: ClipboardCheck, color: "pink" },
  { id: "announcements", icon: Megaphone, color: "indigo" },
] as const;
