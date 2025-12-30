"use client";

import FarmMap from "@/components/ui/farm-map";
import { TrendingUp, IndianRupee, Sprout, Activity } from "lucide-react";

/* ------------------ DYNAMIC DATA MODEL ------------------ */
const farmScoreData = {
  region: "India Region",
  overallScore: 7.8,
  advice: "Increase irrigation in Field 3 due to local heat wave.",
  trend: {
    label: "Stable",
    change: "+0.3 WoW",
  },
  seasonOutlook: {
    yield: {
      value: 18.5,
      unit: "q/ac",
    },
    profit: {
      value: "₹84.2k",
    },
  },
  metrics: [
    {
      label: "Soil Health",
      value: "8.1",
      color: "emerald",
    },
    {
      label: "Risk Score",
      value: "2.4",
      color: "orange",
    },
  ],
};

/* ------------------ COMPONENT ------------------ */
export default function FarmScoreCard() {
  return (
    <section className="mb-4 flex-1 font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 pb-2 h-full items-stretch">

        {/* LEFT PANEL */}
        <div className="lg:col-span-1 md:col-span-2 sm:col-span-2 bg-white border-8 border-white rounded-[2.5rem] shadow-xl flex flex-col overflow-hidden max-h-[620px]">

          {/* HEADER */}
          <div className="px-3 py-2 flex justify-between items-center border-b border-slate-50">
            <div>
              <h2 className="text-lg font-black text-slate-800 leading-none tracking-tight">
                Farm Balance
              </h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                Scorecard • {farmScoreData.region}
              </p>
            </div>
            <Activity size={14} className="text-emerald-500" />
          </div>

          {/* CONTENT */}
          <div className="px-2 pt-2 pb-3 space-y-2 flex-1 bg-white overflow-hidden">

            {/* MAIN SCORE */}
            <div className="relative rounded-[1.8rem] bg-gradient-to-br from-emerald-500 to-emerald-600 p-3 text-white shadow-lg shadow-emerald-100/30 animate-[fadeUp_0.6s_ease-out]">
              <div className="flex flex-col items-center">

                <div className="w-16 h-16 mb-1 flex items-center justify-center rounded-full border-[3px] border-white/40 bg-white/10 backdrop-blur-md animate-[softPulse_3s_ease-in-out_infinite]">
                  <span className="text-2xl font-black">
                    {farmScoreData.overallScore}
                  </span>
                </div>

                <h3 className="text-[11px] font-bold uppercase tracking-wider">
                  Overall Farm Score
                </h3>

                {/* ADVICE */}
                <div className="w-full mt-2 rounded-xl bg-black/10 p-2 text-center">
                  <p className="text-[10px] leading-tight font-medium text-emerald-50">
                    <span className="mr-1 inline-block rounded bg-white px-1 text-[8px] font-black uppercase text-emerald-700">
                      Advice
                    </span>
                    {farmScoreData.advice}
                  </p>
                </div>

                {/* TREND */}
                <div className="w-full mt-2 rounded-xl bg-white/10 p-2 flex flex-col items-center transition-all duration-300 hover:bg-white/15 hover:-translate-y-0.5">
                  <span className="text-[9px] font-bold uppercase opacity-80 mb-0.5">
                    Score Trend (Last 7 Days)
                  </span>

                  <svg viewBox="0 0 100 30" className="w-full h-4">
                    <path
                      d="M0,22 Q15,10 30,22 T60,18 T100,22"
                      fill="none"
                      stroke="white"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <circle cx="100" cy="22" r="2.5" fill="white" />
                  </svg>

                  <span className="text-[10px] font-black mt-0.5">
                    {farmScoreData.trend.label} ({farmScoreData.trend.change})
                  </span>
                </div>
              </div>
            </div>

            {/* SEASON OUTLOOK */}
            <div className="rounded-[1.5rem] border border-slate-100 bg-white p-2.5 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="mb-1 flex items-center justify-between px-0.5">
                <p className="text-[8px] font-extrabold uppercase tracking-wide text-slate-500">
                  Season Yield & Profit Outlook
                </p>
                <TrendingUp size={10} className="text-emerald-500" />
              </div>

              <div className="grid grid-cols-2 gap-2">

                {/* Yield */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <p className="text-[8px] font-extrabold uppercase text-emerald-700 flex items-center gap-1">
                    <Sprout size={8} /> Est. Yield
                  </p>
                  <p className="mt-0.5 text-sm font-black text-slate-900 leading-none tracking-tight">
                    {farmScoreData.seasonOutlook.yield.value}
                    <span className="ml-0.5 text-[7px] text-slate-500">
                      {farmScoreData.seasonOutlook.yield.unit}
                    </span>
                  </p>
                </div>

                {/* Profit */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                  <p className="text-[8px] font-extrabold uppercase text-amber-700 flex items-center gap-1">
                    <IndianRupee size={8} /> Est. Profit
                  </p>
                  <p className="mt-0.5 text-sm font-black text-slate-900 leading-none tracking-tight">
                    {farmScoreData.seasonOutlook.profit.value}
                  </p>
                </div>

              </div>
            </div>

            {/* METRICS */}
            <div className="grid grid-cols-2 gap-2">
              {farmScoreData.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-2 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="mb-1 text-[8px] font-bold uppercase text-slate-400">
                    {metric.label}
                  </p>
                  <div
                    className={`w-10 h-10 rounded-full border-[3px] border-${metric.color}-500 bg-${metric.color}-50 flex items-center justify-center shadow-inner`}
                  >
                    <span className={`text-[11px] font-black text-${metric.color}-700`}>
                      {metric.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="lg:col-span-5 md:col-span-4 sm:col-span-4 rounded-[2.5rem] border-8 border-white bg-white shadow-xl overflow-hidden min-h-[500px] animate-[fadeUp_0.6s_ease-out]">
          <FarmMap title="My Farm" />
        </div>

      </div>
    </section>
  );
}
