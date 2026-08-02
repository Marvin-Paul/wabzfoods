"use client";

import { useEffect, useState } from "react";

export default function SplashScreen() {
  const [stage, setStage] = useState("show");

  useEffect(() => {
    document.body.classList.add("splash-active");
    const t = setTimeout(() => {
      setStage("done");
      document.body.classList.remove("splash-active");
    }, 4100);
    return () => {
      clearTimeout(t);
      document.body.classList.remove("splash-active");
    };
  }, []);

  if (stage === "done") return null;

  return (
    <div id="wabz-splash" aria-label="Wabz Foods is loading">
      <div className="splash-particles" aria-hidden="true">
        <span className="particle p1">🍔</span>
        <span className="particle p2">🍟</span>
        <span className="particle p3">🍗</span>
        <span className="particle p4">🥤</span>
        <span className="particle p5">🍕</span>
        <span className="particle p6">🌮</span>
        <span className="particle p7">🥗</span>
        <span className="particle p8">🍜</span>
      </div>

      <div className="splash-center">
        <div className="splash-logo-ring">
          <div className="splash-ring-outer" />
          <div className="splash-ring-inner" />
          <div className="splash-logo-icon">🍔</div>
        </div>

        <div className="splash-brand">
          <span className="splash-brand-wabz">WABZ</span>
          <span className="splash-brand-foods"> FOODS</span>
        </div>

        <div className="splash-tagline">Kampala&apos;s Favourite Meals</div>

        <div className="splash-progress-track">
          <div className="splash-progress-bar" />
        </div>

        <div className="splash-loading-text">Loading deliciousness…</div>
      </div>
    </div>
  );
}
