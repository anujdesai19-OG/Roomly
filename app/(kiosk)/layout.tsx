// This layout wraps all kiosk flow pages.
// Pages render their own StepProgress client-side.
export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-10 border-b bg-background/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto max-w-lg">
          {/* Step progress is rendered client-side per page */}
        </div>
      </div>
      <div className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-lg">
          {children}
        </div>
      </div>
    </div>
  )
}
