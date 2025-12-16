"use client";

interface HamburgerButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  fieldCount: number;
}

export default function HamburgerButton({
  isOpen,
  onToggle,
  fieldCount,
}: HamburgerButtonProps) {
  return (
    <button
      className="hamburger-btn"
      onClick={onToggle}
      title="My Fields"
    >
      <span className="hamburger-icon">{isOpen ? "✕" : "☰"}</span>
      {!isOpen && fieldCount > 0 && (
        <span className="hamburger-badge">{fieldCount}</span>
      )}

      <style jsx>{`
        .hamburger-btn {
          width: 44px;
          height: 44px;
          background: rgba(10, 22, 40, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .hamburger-btn:hover {
          background: rgba(10, 22, 40, 1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .hamburger-icon {
          line-height: 1;
        }

        .hamburger-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #0ea5e9;
          color: #fff;
          font-size: 10px;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
        }
      `}</style>
    </button>
  );
}
