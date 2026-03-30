import { useState } from "react";

export default function BrandLogo() {
  const [logoFailed, setLogoFailed] = useState(false);

  if (!logoFailed) {
    return (
      <img
        src="/logo-saurene.png"
        alt="Saurene"
        className="h-9 w-auto max-w-[180px] object-contain sm:h-10 sm:max-w-[220px] md:h-12 md:max-w-[280px]"
        onError={() => setLogoFailed(true)}
      />
    );
  }

  return (
    <div className="leading-tight text-brand-wine">
      <p className="font-heading text-2xl font-semibold tracking-wide sm:text-3xl">Saurene</p>
      <p className="hidden text-[9px] uppercase tracking-[0.2em] md:block">
        A touch of elegance, a tale of you
      </p>
    </div>
  );
}
