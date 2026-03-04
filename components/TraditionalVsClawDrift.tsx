"use client";

const TRADITIONAL_STEPS = [
  { label: "Purchasing a VPS", time: "15 min" },
  { label: "Setting up server environment", time: "10 min" },
  { label: "Installing bot framework", time: "10 min" },
  { label: "Configuring AI model & API keys", time: "10 min" },
  { label: "Setting up channel webhooks", time: "10 min" },
  { label: "Debugging connections", time: "5 min" },
] as const;

const TOTAL_MINUTES = TRADITIONAL_STEPS.reduce(
  (sum, s) => sum + parseInt(s.time),
  0
);

export function TraditionalVsClawDrift() {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-6 md:p-8">
      <div className="flex justify-center mb-3">
        <span className="inline-block px-3 py-1 rounded-full bg-gray-100 border border-gray-200/60 text-gray-500 text-[11px] font-semibold tracking-wider uppercase">
          Comparison
        </span>
      </div>

      <h2 className="text-center text-[24px] md:text-[30px] font-extrabold tracking-tight leading-[1.1] mb-8 text-gray-900">
        Traditional Method vs{" "}
        <span className="text-orange-600">OpenClaw</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0">
        {/* Traditional */}
        <div className="md:border-r border-gray-200 md:pr-8">
          <h3 className="text-gray-900 text-[18px] font-bold mb-5">
            Traditional
          </h3>
          <ul className="space-y-3">
            {TRADITIONAL_STEPS.map(({ label, time }) => (
              <li
                key={label}
                className="flex items-center justify-between text-gray-600 text-[14px]"
              >
                <span>{label}</span>
                <span className="font-semibold text-gray-900 shrink-0 ml-3 tabular-nums">
                  {time}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-gray-900 font-extrabold text-[16px]">
              Total
            </span>
            <span className="text-gray-900 font-extrabold text-[16px] tabular-nums">
              {TOTAL_MINUTES} min
            </span>
          </div>
          <p className="mt-3 text-gray-400 text-[12px] italic">
            If you&apos;re non-technical, multiply these times by 10.
          </p>
        </div>

        {/* OpenClaw */}
        <div className="md:pl-8 flex flex-col items-center justify-center text-center py-4">
          <h3 className="text-gray-900 text-[18px] font-bold mb-4">
            OpenClaw
          </h3>
          <p className="text-gray-900 text-[56px] md:text-[72px] font-extrabold leading-none tracking-tighter">
            &lt;1
          </p>
          <p className="text-gray-700 text-[15px] font-semibold mt-2 mb-5">
            minute to deploy
          </p>
          <p className="text-gray-500 text-[13px] leading-relaxed max-w-[260px]">
            Choose your model, pick a channel, and deploy. We handle
            infrastructure, keys, and webhooks automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
