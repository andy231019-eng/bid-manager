"use client";

type Props = {
  right?: React.ReactNode;
};

export default function AppHeader({ right }: Props) {
  return (
    <header className="bg-white border-b border-[#d8d5cc] sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo + Title */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: "#1a1916" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="1" y="1" width="5" height="5" rx="0.5" fill="#e8c840" />
              <rect x="8" y="1" width="5" height="5" rx="0.5" fill="white" opacity="0.6" />
              <rect x="1" y="8" width="5" height="5" rx="0.5" fill="white" opacity="0.6" />
              <rect x="8" y="8" width="5" height="5" rx="0.5" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: "#1a1916", fontFamily: "var(--font-epilogue)" }}
          >
            投標管理系統
          </span>
        </div>

        {/* Right slot */}
        {right && <div>{right}</div>}
      </div>
    </header>
  );
}
