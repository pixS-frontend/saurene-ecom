import { useEffect, useState } from "react";

let hasShownPopupThisLoad = false;

export default function FirstAffairPopup() {
  const [isOpen, setIsOpen] = useState(() => !hasShownPopupThisLoad);
  const [isUnwrapped, setIsUnwrapped] = useState(false);

  useEffect(() => {
    if (isOpen) {
      hasShownPopupThisLoad = true;
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
    return undefined;
  }, [isOpen]);

  function handleClose() {
    setIsOpen(false);
  }

  function handleUnwrap() {
    setIsUnwrapped(true);
  }

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" role="dialog" aria-modal="true" aria-label="Welcome offer popup">
      <div className={`popup-card ${isUnwrapped ? "popup-card-unwrapped" : ""}`}>
        <button onClick={handleClose} className="popup-close" aria-label="Close offer popup">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="popup-sparkles" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        <img src="/logo-saurene.png" alt="Saurene" className="popup-logo" />
        <p className="popup-eyebrow">Welcome To Saurene</p>
        <h2 className="popup-title">For your first affair with elegance - unwrap it.</h2>

        {!isUnwrapped ? (
          <button onClick={handleUnwrap} className="btn-like popup-unwrap">
            Unwrap
          </button>
        ) : (
          <div className="popup-reveal">
            <p className="popup-reveal-text">10% off on your first order</p>
            <p className="popup-coupon">Use Code: SAURENE10</p>
            <button onClick={handleClose} className="btn-like popup-continue">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
