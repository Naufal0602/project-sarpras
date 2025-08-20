import React, { useEffect, useState } from "react";

const SuccessFullScreen = ({ show, message = "Berhasil!", onDone }) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDone) onDone(); // panggil callback navigate
      }, 2000); // tampil 2 detik lalu navigate
      return () => clearTimeout(timer);
    }
  }, [show, onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* SVG Check Animation */}
      <div className="mb-6">
        <svg
          className="checkmark w-24 h-24"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 52 52"
        >
          <circle
            className="checkmark__circle"
            cx="26"
            cy="26"
            r="25"
            fill="none"
          />
          <path
            className="checkmark__check"
            fill="none"
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
          />
        </svg>
      </div>

      {/* Pesan */}
      <p className="text-lg font-semibold text-green-600">{message}</p>

      <style>{`
        .checkmark {
          border-radius: 50%;
          stroke-width: 2;
          stroke: #4bb71b;
          stroke-miterlimit: 10;
          box-shadow: inset 0px 0px 0px #4bb71b;
          animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
        }
        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #4bb71b;
          fill: #fff;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          stroke: #4bb71b;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }
        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }
        @keyframes scale {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.1, 1.1, 1); }
        }
        @keyframes fill {
          100% { box-shadow: inset 0px 0px 0px 30px #4bb71b; }
        }
      `}</style>
    </div>
  );
};

export default SuccessFullScreen;
