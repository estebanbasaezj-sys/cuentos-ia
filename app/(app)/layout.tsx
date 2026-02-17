import Navbar from "@/components/layout/Navbar";
import BottomNav from "@/components/layout/BottomNav";
import { UsageProvider } from "@/components/UsageProvider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UsageProvider>
      <Navbar />
      <div className="fixed inset-0 -z-10 bg-mesh" />
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24 md:py-8 md:pb-8">
        {children}
      </main>
      <BottomNav />
    </UsageProvider>
  );
}
