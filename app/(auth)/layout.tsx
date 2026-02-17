import Navbar from "@/components/layout/Navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="fixed inset-0 -z-10 bg-mesh" />
      {/* Decorative blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-brand-300/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-accent-teal/15 rounded-full blur-3xl animate-blob" style={{ animationDelay: "2s" }} />
      </div>
      <div className="min-h-[calc(100vh-4.25rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </>
  );
}
