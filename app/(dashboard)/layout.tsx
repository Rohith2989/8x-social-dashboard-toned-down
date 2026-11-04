import { Shell } from "@/components/shell/shell";

// every page of the dashboard sits in the one window: moving between them keeps the window, the aura and the sidebar
export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <Shell>{children}</Shell>;
}
