interface NavbarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function Navbar({ title, showBack = false, onBack }: NavbarProps) {
  return (
    <nav className="w-full bg-white/5 backdrop-blur-md border-b border-white/10 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              onClick={onBack}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>
          )}
          <h1 className="text-xl font-semibold text-white">{title}</h1>
        </div>
      </div>
    </nav>
  );
}
