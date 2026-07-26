"use client";

import React from "react";

function OTP({ maxLength = 6, value, onChange, ...props }) {
  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;
    const newValue = value.split("");
    newValue[index] = val.slice(-1);
    const trimmed = newValue.join("").slice(0, maxLength);
    onChange(trimmed);
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  return (
    <div {...props} className={["flex gap-2", props.className].filter(Boolean).join(" ")}>
      {Array.from({ length: maxLength }).map((_, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-10 h-12 text-center text-lg border border-carbon/15 rounded-lg focus:outline-none focus:border-persimmon"
        />
      ))}
    </div>
  );
}

function InputOTPGroup({ children }) {
  return <>{children}</>;
}

function InputOTPSlot({ index }) {
  return null;
}

export { OTP as InputOTP, InputOTPGroup, InputOTPSlot };
