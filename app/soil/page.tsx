"use client";

import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import { Pie } from "react-chartjs-2";

import {
  BookOpen,
  FileText,
  GraduationCap,
  ImageIcon,
  ArrowRight,
  Droplets,
  ThermometerSun,
  Sprout,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const API_BASE = "http://localhost:4000";

// ===== Weather UI Helper =====
function getWeatherUI(temp: number, moist: number) {
  if (temp <= 12) {
    return { bg: "from-cyan-100 to-blue-200", icon: "❄" };
  }
  if (moist >= 70) {
    return { bg: "from-slate-700 to-slate-900", icon: "🌧" };
  }
  if (moist >= 60) {
    return { bg: "from-slate-300 to-slate-400", icon: "☁" };
  }
  if (temp >= 32) {
    return { bg: "from-yellow-300 to-orange-400", icon: "☀" };
  }
  return { bg: "from-sky-100 to-sky-200", icon: "🌤" };
}

export default function SoilPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Fertilizer state ---------- */
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [N, setN] = useState("");
  const [P, setP] = useState("");
  const [K, setK] = useState("");
  const [OC, setOC] = useState("");
  const [fertilizer, setFertilizer] = useState<any>(null);
  const [loadingFert, setLoadingFert] = useState(false);

  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loadingSoil, setLoadingSoil] = useState(true);

  /* ---------- VALIDATION ---------- */
  const isFormValid = !!state && !!district && !!N && !!P && !!K && !!OC && !loadingFert;

  /* ---------- Load Data ---------- */
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoadingSoil(true);
        // FIXED: Added backticks
        const [soilRes, stateRes] = await Promise.all([
          fetch(`${API_BASE}/soil`),
          fetch(`${API_BASE}/locations/states`),
        ]);
        const soilJson = await soilRes.json();
        const stateJson = await stateRes.json();
        setData(soilJson);
        setStates(stateJson);

        if (soilJson?.nutrients) {
          setN(String(soilJson.nutrients.N ?? ""));
          setP(String(soilJson.nutrients.P ?? ""));
          setK(String(soilJson.nutrients.K ?? ""));
          setOC(String(soilJson.nutrients.OC ?? ""));
        }
      } catch {
        setError("Failed to load soil data");
      } finally {
        setLoadingSoil(false);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!state) return;
    // FIXED: Added backticks
    fetch(`${API_BASE}/locations/districts?state=${state}`)
      .then((r) => r.json())
      .then(setDistricts);
  }, [state]);

  async function getRecommendation() {
    try {
      setLoadingFert(true);
      // FIXED: Added backticks
      const res = await fetch(`${API_BASE}/fertilizer/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, district, N: Number(N), P: Number(P), K: Number(K), OC: Number(OC) }),
      });
      const json = await res.json();
      setFertilizer(json);
    } catch {
      setFertilizer(null);
    } finally {
      setLoadingFert(false);
    }
  }

  const nutrients = data?.nutrients ?? {};
  
  // Forecast Data
  const forecast7d = Array.isArray(data?.forecast7d) ? data.forecast7d : [];
  const dummyForecast7d = [
    { day: "Today", temp: 26, moist: 45, status: "Optimal" },
    { day: "Mon", temp: 26, moist: 42, status: "Optimal" },
    { day: "Tue", temp: 26, moist: 40, status: "Optimal" },
    { day: "Wed", temp: 25, moist: 38, status: "Optimal" },
    { day: "Thu", temp: 26, moist: 35, status: "Critical" },
  ];
  const hasValidForecastData = Array.isArray(forecast7d) && forecast7d.some((d: any) => typeof d?.temp === "number");
  const finalForecast7d = hasValidForecastData ? forecast7d : dummyForecast7d;

  // Nutrient Data
  const nutrientLabels = ["Nitrogen (N)", "Phosphorus (P)", "Potassium (K)", "Organic Carbon (OC)", "Sulfur (S)", "Iron (Fe)", "Zinc (Zn)", "Copper (Cu)", "Boron (B)", "Manganese (Mn)"];
  const apiNutrientValues = [nutrients.N, nutrients.P, nutrients.K, nutrients.OC, nutrients.S, nutrients.Fe, nutrients.Zn, nutrients.Cu, nutrients.B, nutrients.Mn].map((v: any) => (typeof v === "number" ? v : 0));
  const hasRealData = apiNutrientValues.some((v) => v > 0);
  const finalNutrientValues = hasRealData ? apiNutrientValues : [30, 20, 15, 7, 4, 10, 6, 3, 2, 5];

  const nutrientPieData = {
    labels: nutrientLabels,
    datasets: [{
      label: "Soil Nutrients",
      data: finalNutrientValues,
      backgroundColor: ["#10B981", "#F59E0B", "#3B82F6", "#DC2626", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"],
      borderWidth: 1,
    }],
  };

  // UI Components
  function FeatureDonut({ title, labels, values, colors }: any) {
    return (
      <div className="bg-white rounded-lg shadow p-3 text-center border border-gray-100 flex flex-col items-center justify-between h-full">
        <div className="text-sm font-semibold text-gray-700">{title}</div>
        <div className="h-[100px] w-full flex items-center justify-center my-2">
          <Pie data={{ labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 1 }] }} options={{ responsive: true, maintainAspectRatio: false, cutout: "70%", plugins: { legend: { display: false } } }} />
        </div>
        <div className="text-[10px] text-gray-400">Overview</div>
      </div>
    );
  }

  // --- Realistic Soil Stack ---
  const SOIL_ROW_HEIGHT = "60px";
  const soilGradients = ["from-[#5d4037] to-[#4e342e]", "from-[#795548] to-[#6d4c41]", "from-[#8d6e63] to-[#795548]", "from-[#a1887f] to-[#8d6e63]"];
  const DUMMY_SOIL_LAYERS = [
    { label: "5–10 cm", value: 28, status: "Monitor", color: "yellow" },
    { label: "15–30 cm", value: 25, status: "Optimal", color: "green" },
    { label: "30–60 cm", value: 18, status: "Good", color: "blue" },
    { label: "60–100 cm", value: 14, status: "Too Cold", color: "red" },
  ];
  const DUMMY_MOISTURE_LAYERS = [
    { label: "5–10 cm", value: 18, status: "Low", color: "red" },
    { label: "15–30 cm", value: 32, status: "Optimal", color: "green" },
    { label: "30–60 cm", value: 45, status: "Good", color: "blue" },
    { label: "60–100 cm", value: 55, status: "Good", color: "blue" },
  ];

  const layers = data?.soilLayers ?? DUMMY_SOIL_LAYERS;
  const moistureLayers = data?.moistureLayers ?? DUMMY_MOISTURE_LAYERS;

  function SoilLayerStack({ layers }: { layers: any[] }) {
    return (
      <div className="relative w-[120px] shadow-xl rounded-b-2xl">
        {/* Realistic Grass Top */}
        <div className="h-6 w-full bg-gradient-to-b from-[#4ade80] to-[#15803d] rounded-t-xl relative overflow-hidden border-b-2 border-[#3e2723]">
             <div className="absolute bottom-0 left-0 w-full h-2 bg-black/10"></div>
        </div>
        
        <div className="flex flex-col rounded-b-xl overflow-hidden border-x border-b border-[#3e2723]">
          {layers.map((layer, i) => (
            // FIXED: Added backticks around className string
            <div key={i} style={{ height: SOIL_ROW_HEIGHT }} className={`flex items-center justify-center text-white font-bold text-sm bg-gradient-to-b ${soilGradients[i]} relative shadow-inner`}>
              <div className="absolute inset-0 bg-black/5 mix-blend-multiply" />
              <span className="relative z-10 drop-shadow-md">{layer.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function DepthRowAligned({ label, value, status, color }: any) {
    const badgeMap: any = {
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      green: "bg-green-100 text-green-800 border-green-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      red: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <div style={{ height: SOIL_ROW_HEIGHT }} className="flex items-center justify-between border-b border-gray-50 last:border-0">
        <div className="text-xs font-medium text-gray-500 w-16">{label}</div>
        <div className="text-sm font-bold text-gray-800">{value}</div>
        {/* FIXED: Added backticks around className */}
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeMap[color]} uppercase tracking-wider`}>
          {status}
        </span>
      </div>
    );
  }

  // --- Action Plan Card Component ---
  function ActionCard({ step, title, desc, cta, color }: any) {
    const theme: any = {
      red: { border: "border-red-500", bg: "bg-red-50", icon: "text-red-500", btn: "bg-red-600 hover:bg-red-700" },
      yellow: { border: "border-yellow-500", bg: "bg-yellow-50", icon: "text-yellow-600", btn: "bg-yellow-600 hover:bg-yellow-700" },
      blue: { border: "border-blue-500", bg: "bg-blue-50", icon: "text-blue-500", btn: "bg-blue-600 hover:bg-blue-700" },
    };
    const t = theme[color];

    return (
      // FIXED: Added backticks around className
      <div className={`border-2 ${t.border} rounded-lg p-3 ${t.bg} flex flex-col justify-between h-full`}>
        <div>
          <div className="flex items-center gap-2 mb-2">
             {/* FIXED: Added backticks around className */}
            <span className={`flex items-center justify-center w-6 h-6 rounded bg-white font-bold text-xs shadow-sm ${t.icon}`}>
              #{step}
            </span>
            <div className="text-xs font-bold uppercase text-gray-700">Recommended Action</div>
          </div>
          <h4 className="font-bold text-sm text-gray-900 leading-tight mb-1">{title}</h4>
          <p className="text-[11px] text-gray-600 leading-snug mb-3">{desc}</p>
        </div>
        {/* FIXED: Added backticks around className */}
        <button className={`${t.btn} text-white text-[10px] font-bold py-1.5 px-3 rounded w-full transition-colors`}>
          {cta}
        </button>
      </div>
    );
  }

  return (
    // FIXED: Changed 'min-h-screen' to 'h-screen overflow-y-auto' to enable scrolling
    <div className="p-5 h-screen overflow-y-auto bg-[#f3f7f6]">
      {/* Top Strip */}
      <div className="bg-white px-6 py-3 flex items-center justify-between border-b mb-6 rounded-lg shadow-sm">
        <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg">
          <img src="/images/mithu.jpg" className="w-10 h-10 object-contain" />
          <div>
            <div className="font-bold text-green-800">Soil Saathi</div>
            <div className="text-xs text-gray-500">Mithu — your soil co-pilot</div>
          </div>
        </div>
        <button onClick={() => location.reload()} className="bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-800 transition">
          Refresh Data
        </button>
      </div>

      {/* Field Map */}
      <div className="mb-6 bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-2">
            <div className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-green-600"/> Field Map / Live View
            </div>
            <div className="text-[10px] text-gray-400">Live Satellite Feed • Updated 5m ago</div>
        </div>
        <div className="h-[280px] w-full rounded-lg overflow-hidden bg-gray-100 relative group">
           <img 
             src="https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/77.2090,28.6139,15,0/1200x400?access_token=pk.eyJ1IjoiZGVtbyIsImEiOiJja2dibW15bXAwZ3YwMnJvNnJqcG43bnJvIn0.eV9X_yv_wz_wz_wz" 
             className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
             alt="Satellite View" 
             onError={(e) => (e.currentTarget.style.display = 'none')}
           />
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-semibold text-gray-600 shadow-sm border border-white">
                Interactive Map Loading...
              </div>
           </div>
        </div>
      </div>

      {/* Main Grid: Left Sidebar & Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-stretch">
        
        {/* LEFT SIDEBAR (Flex Col to stretch) */}
        <div className="flex flex-col gap-6 h-full">
          
          {/* Score Card */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-sm font-bold text-gray-800">Soil Score Card</h3>
               <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">LIVE</span>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 text-center border border-green-100">
              <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Overall Health Score</div>
              <div className="text-5xl font-black text-green-700 mb-3 tracking-tighter">
                {data?.soilScore ?? "84"}
              </div>
              <div className="h-1.5 w-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
                <div className="h-full bg-green-500 w-[84%]"></div>
              </div>
              <button className="flex items-center justify-center gap-2 w-full bg-green-700 hover:bg-green-800 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-sm">
                <FileText className="w-3 h-3" /> Download Health Card
              </button>
            </div>
          </div>

          {/* Key Nutrients (Flex-1 to fill remaining vertical space) */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-center text-gray-800 mb-6">Key Soil Nutrients Overview</h3>
            
            <div className="flex-1 flex flex-col justify-center">
              {/* Main Chart */}
              <div className="h-[220px] flex items-center justify-center mb-6 relative">
                 <Pie 
                   data={nutrientPieData} 
                   options={{ responsive: true, maintainAspectRatio: false, cutout: "65%", plugins: { legend: { display: false } } }} 
                 />
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-gray-800">10</span>
                    <span className="text-[10px] text-gray-400 uppercase">Parameters</span>
                 </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] px-2 mb-6">
                {nutrientLabels.map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: nutrientPieData.datasets[0].backgroundColor[i] }} />
                    <span className="text-gray-600 font-medium truncate">{label}</span>
                  </div>
                ))}
              </div>

              {/* Feature Donuts */}
              <div className="grid grid-cols-2 gap-3 mt-auto">
                 <FeatureDonut title="pH Level" labels={["Acidic", "Neutral", "Alkaline"]} values={[20, 60, 20]} colors={["#f87171", "#4ade80", "#60a5fa"]} />
                 <FeatureDonut title="EC Value" labels={["Low", "Optimal", "High"]} values={[15, 70, 15]} colors={["#fbbf24", "#34d399", "#f472b6"]} />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT CONTENT (Flex Col) */}
        <div className="flex flex-col gap-6 h-full">

          {/* Forecast */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800">7-Day Soil Forecast</h3>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <Clock className="w-3 h-3" /> Updated: 6:00 AM
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {finalForecast7d.map((d: any, i: number) => {
                const w = getWeatherUI(d.temp, d.moist);
                return (
                   // FIXED: Added backticks around className
                  <div key={i} className={`flex-1 min-w-[90px] rounded-xl p-3 bg-gradient-to-b ${w.bg} border border-white/50 shadow-sm flex flex-col items-center justify-between relative`}>
                    <div className="text-xl mb-1 filter drop-shadow-sm">{w.icon}</div>
                    <div className="text-center">
                      <div className="text-[10px] font-bold text-gray-600 uppercase mb-0.5">{d.day ?? "Today"}</div>
                      <div className="text-2xl font-black text-gray-800 leading-none">{d.temp}°</div>
                      <div className="text-[10px] font-medium text-gray-700 mt-1">{d.moist}% Moist</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Insights Grid (Flex-1 to stretch) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
            
            {/* TEMPERATURE PANEL */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-green-100 rounded-lg"><ThermometerSun className="w-4 h-4 text-green-700" /></div>
                <h3 className="font-bold text-green-900 text-sm">Real-Time Soil Temperature</h3>
              </div>
              
              <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-2 text-xs text-green-800 mb-4 flex items-start gap-2">
                <Sprout className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span><span className="font-bold">Co-Pilot Insight:</span> Soil warming trend detected. Planting window optimal in 48hrs.</span>
              </div>

              <div className="mb-6 flex-1 flex flex-col justify-center">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">DIAGNOSTIC VIEW</div>
                <div className="flex gap-4">
                  <SoilLayerStack layers={layers} />
                  <div className="flex-1 flex flex-col justify-center">
                     {layers.map((l: any, i: number) => <DepthRowAligned key={i} {...l} />)}
                  </div>
                </div>
              </div>

              {/* Action Plan */}
              <div className="mt-auto pt-4 border-t border-dashed border-gray-200">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                   <AlertTriangle className="w-3 h-3 text-red-400" /> Action Plan Required
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <ActionCard 
                     step="1" 
                     color="red"
                     title="Warming Irrigation" 
                     desc="Initiate thermal irrigation cycle for 3 hours."
                     cta="Set Reminder"
                   />
                   <ActionCard 
                     step="2" 
                     color="yellow"
                     title="Apply P-Boost" 
                     desc="Add 25kg DAP/Hectare to aid root warmth."
                     cta="Track Inventory"
                   />
                </div>
              </div>
            </div>

            {/* MOISTURE PANEL */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-100 rounded-lg"><Droplets className="w-4 h-4 text-blue-700" /></div>
                <h3 className="font-bold text-blue-900 text-sm">Real-Time Soil Moisture</h3>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-xs text-blue-800 mb-4 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span><span className="font-bold">Advisory:</span> Rapid moisture decline in top 10cm layer.</span>
              </div>

              <div className="mb-6 flex-1 flex flex-col justify-center">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">DIAGNOSTIC VIEW</div>
                <div className="flex gap-4">
                  <SoilLayerStack layers={moistureLayers} />
                  <div className="flex-1 flex flex-col justify-center">
                     {/* FIXED: Added backticks around value string */}
                     {moistureLayers.map((l: any, i: number) => <DepthRowAligned key={i} label={l.label} value={`${l.value}%`} status={l.status} color={l.color} />)}
                  </div>
                </div>
              </div>

              {/* Action Plan */}
              <div className="mt-auto pt-4 border-t border-dashed border-gray-200">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                   <CheckCircle2 className="w-3 h-3 text-blue-400" /> Scheduled Actions
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <ActionCard 
                     step="1" 
                     color="blue"
                     title="Drip Irrigation" 
                     desc="Run system A/B for 45 mins at 6 PM."
                     cta="Start Now"
                   />
                   <ActionCard 
                     step="2" 
                     color="yellow"
                     title="Mulching" 
                     desc="Apply organic mulch to retain top-soil water."
                     cta="View Guide"
                   />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= FERTILIZER ================= */}
      <div className="bg-green-50 rounded-xl p-6 shadow border border-green-200 mt-6">

      {/* GOV HEADER */}
      <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center mt-8">
        <div className="flex gap-4">
          <img src="/images/gov-logo.png" className="h-14" />
          <div>
            <div className="font-bold text-sm">Government of India</div>
            <div className="text-xs">Ministry of Agriculture and Farmers Welfare <p>Department of Agriculture and Farmers Welfare</p></div>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <img src="/images/soil-health-logo.png" className="h-12" />
          <div>
            <div className="font-bold">Soil Health Card</div>
            <div className="text-xs text-gray-500">Healthy Earth, Greener Farm</div>
          </div>
        </div>
      </div>

        <div className="bg-green-700 text-white px-6 py-3 font-semibold text-lg">Fertilizer Recommendation</div>
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">

          <div className="bg-white rounded-lg p-4 border shadow-sm">

            <select className="w-full border rounded px-3 py-2 mb-3" value={state} onChange={(e) => setState(e.target.value)}>
              <option value="">Select State</option>
              {Array.isArray(states) && states.map((s) => <option key={s}>{s}</option>)}
            </select>

            <select className="w-full border rounded px-3 py-2 mb-3" value={district} onChange={(e) => setDistrict(e.target.value)} disabled={!state}>
              <option value="">Select District</option>
              {districts.map((d) => <option key={d}>{d}</option>)}
            </select>

            <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Nitrogen" value={N} onChange={(e) => setN(e.target.value)} />
            <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Phosphorus" value={P} onChange={(e) => setP(e.target.value)} />
            <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Potassium" value={K} onChange={(e) => setK(e.target.value)} />
            <input className="w-full border rounded px-3 py-2 mb-4" placeholder="Organic Carbon" value={OC} onChange={(e) => setOC(e.target.value)} />

            <button
              onClick={getRecommendation}
              disabled={!isFormValid}
              className={`px-4 py-2 border rounded w-full ${
                isFormValid ? "bg-white" : "bg-gray-200 cursor-not-allowed"
              }`}
            >
              {loadingFert ? "Loading..." : "Get Recommendations"}
            </button>
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="px-4 py-2 border-b bg-green-50 font-semibold text-green-800">Recommendation</div>
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Crop</th>
                  <th className="p-2 border">Soil Conditioner</th>
                  <th className="p-2 border">Fertilizer Combination 1</th>
                  <th className="p-2 border">Fertilizer Combination 2</th>
                </tr>
              </thead>
              <tbody>
                {fertilizer ? (
                  <tr>
                    <td className="p-2 border">{fertilizer.crop}</td>
                    <td className="p-2 border">{fertilizer.soilConditioner}</td>
                    <td className="p-2 border">{fertilizer.combo1?.map((c: string, i: number) => <div key={i}>{c}</div>)}</td>
                    <td className="p-2 border">{fertilizer.combo2?.map((c: string, i: number) => <div key={i}>{c}</div>)}</td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={4} className="p-3 text-center text-gray-400">
                      Click "Get Recommendations" to view fertilizer advice
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Resources */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Knowledge & Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Sustainable Farming Guide", desc: "Manual for chemical-free practices.", icon: BookOpen },
            { title: "Mission Guidelines", desc: "Official policy documents.", icon: FileText },
            { title: "Study Materials", desc: "Natural farming implementation.", icon: GraduationCap },
            { title: "Success Stories", desc: "Gallery of trained farmers.", icon: ImageIcon },
          ].map((r) => (
            <div key={r.title} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <r.icon className="text-green-600 w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-gray-800">{r.title}</div>
                  <div className="text-xs text-gray-500">{r.desc}</div>
                </div>
              </div>
              <ArrowRight className="text-gray-300 group-hover:text-green-600 transition-colors" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}