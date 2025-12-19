"use client";

import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, Loader2 } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// --- Colors & Styles ---
const C = {
  BORDER: "border-[#1b5e20]", 
  SIDEBAR_BG: "bg-[#AED581]", 
  HEADER_GREEN: "bg-[#2E7D32]", 
  HEADER_YELLOW: "bg-[#FFC107]", 
  TABLE_HEADER_GREEN: "bg-[#8BC34A]", 
  COL_BROWN: "bg-[#D7CCC8]", 
  COL_YELLOW: "bg-[#F0F4C3]", 
  COL_GREEN_1: "bg-[#DCEDC8]", 
  COL_GREEN_2: "bg-[#F1F8E9]", 
};

// --- Interfaces ---
interface HealthCardData {
  cardNo: string; farmerNameSidebar: string; validFrom: string; validTo: string;
  name: string; address: string; village: string; subDistrict: string; district: string; pin: string; aadhaar: string; mobile: string;
  sampleNo: string; sampleDate: string; surveyNo: string; khasraNo: string; farmSize: string; gpsLat: string; gpsLong: string; irrigationType: string;
  testResults: any[]; secondaryRecs: any[]; generalRecs: any; fertilizerRecs: any[]; forecast: any[]; tempAdvisories: any[]; moistureAdvisories: any[]; soilDepthLayers: any[]; 
}

// --- MAHARASHTRA STATIC DATA ---
const INITIAL_DATA: HealthCardData = {
  cardNo: "MH/NSK/2025/10432", 
  farmerNameSidebar: "Sanjay Vitthal Patil", 
  validFrom: "2025", 
  validTo: "2028",
  name: "Sanjay Vitthal Patil", 
  address: "Gat No. 422, Near Gram Panchayat Office", 
  village: "Pimpalgaon Baswant", 
  subDistrict: "Niphad", 
  district: "Nashik", 
  pin: "422301", 
  aadhaar: "XXXX-XXXX-9988", 
  mobile: "9422001122",
  sampleNo: "NSK-SOI-2025-09", 
  sampleDate: "10/01/2025", 
  surveyNo: "214/2", 
  khasraNo: "102/B", 
  farmSize: "2.5 Hectare", 
  gpsLat: "20.1705° N", 
  gpsLong: "73.9841° E", 
  irrigationType: "Irrigated (Drip/Well)",
  testResults: [
    { id: 1, parameter: "pH", value: "7.8", unit: "-", rating: "Slightly Alkaline" },
    { id: 2, parameter: "EC", value: "0.32", unit: "dS/m", rating: "Normal" },
    { id: 3, parameter: "Organic Carbon (OC)", value: "0.52", unit: "%", rating: "Medium" },
    { id: 4, parameter: "Available Nitrogen (N)", value: "210", unit: "kg/ha", rating: "Low" },
    { id: 5, parameter: "Available Phosphorus (P)", value: "12.5", unit: "kg/ha", rating: "Medium" },
    { id: 6, parameter: "Available Potassium (K)", value: "340.0", unit: "kg/ha", rating: "High" },
    { id: 7, parameter: "Available Sulphur (S)", value: "9.2", unit: "ppm", rating: "Deficient" },
    { id: 8, parameter: "Available Zinc (Zn)", value: "0.48", unit: "ppm", rating: "Deficient" },
    { id: 9, parameter: "Available Boron (B)", value: "0.45", unit: "ppm", rating: "Medium" },
    { id: 10, parameter: "Available Iron (Fe)", value: "4.8", unit: "ppm", rating: "Sufficient" },
    { id: 11, parameter: "Available Manganese (Mn)", value: "3.1", unit: "ppm", rating: "Sufficient" },
    { id: 12, parameter: "Available Copper (Cu)", value: "0.40", unit: "ppm", rating: "Sufficient" },
  ],
  secondaryRecs: [
    { id: 1, parameter: "Sulphur (S)", recommendation: "Apply 25 kg/ha Bensulf (Elemental Sulphur)" },
    { id: 2, parameter: "Zinc (Zn)", recommendation: "Apply 20 kg/ha Zinc Sulphate (Chelated preferred)" },
    { id: 3, parameter: "Boron (B)", recommendation: "Foliar spray of Solubor (0.1%) during flowering" },
    { id: 4, parameter: "Iron (Fe)", recommendation: "Not required" },
    { id: 5, parameter: "Manganese (Mn)", recommendation: "Not required" },
    { id: 6, parameter: "Copper (Cu)", recommendation: "Not required" },
  ],
  generalRecs: { 
    manure: "Apply 20 Cart-loads of Farm Yard Manure (FYM) or Press-mud.", 
    biofertiliser: "Use Acetobacter (for Sugarcane) or PSB (2.5 kg/ha).", 
    lime: "Not required (Soil is slightly alkaline; focus on Gypsum if needed)." 
  },
  fertilizerRecs: [
    { id: 1, crop: "Onion (Kanda)", refYield: "300 q/ha", combo1: "Urea: 220kg, SSP: 315kg, MOP: 85kg", combo2: "10:26:26: 200kg + Urea: 180kg" },
    { id: 2, crop: "Sugarcane (Adsali)", refYield: "120 t/ha", combo1: "Urea: 850kg, SSP: 600kg, MOP: 350kg", combo2: "24:24:0: 400kg + Urea: 600kg + MOP: 350kg" },
    { id: 3, crop: "Grapes (Export)", refYield: "25 t/ha", combo1: "Drip: Water Soluble 19:19:19 and 0:0:50 as per schedule", combo2: "Organic Manure: 40 t/ha + 10:26:26: 300kg" },
    { id: 4, crop: "Soybean", refYield: "25 q/ha", combo1: "Urea: 55kg, SSP: 375kg, MOP: 50kg", combo2: "12:32:16: 150kg + Sulphur: 20kg" },
    { id: 5, crop: "Bajra (Kharif)", refYield: "20 q/ha", combo1: "Urea: 130kg, SSP: 125kg, MOP: 35kg", combo2: "DAP: 50kg + Urea: 110kg" },
    { id: 6, crop: "", refYield: "", combo1: "", combo2: "" },
  ],
  forecast: [
    { day: "Mon", temp: 31.2, moisture: 35 }, { day: "Tue", temp: 32.5, moisture: 32 }, { day: "Wed", temp: 30.8, moisture: 30 },
    { day: "Thu", temp: 33.5, moisture: 28 }, { day: "Fri", temp: 34.0, moisture: 25 }, { day: "Sat", temp: 32.1, moisture: 30 }, { day: "Sun", temp: 31.5, moisture: 33 },
  ],
  soilDepthLayers: [
    { id: 1, label: "0 - 10", unit: "cm", color: "#3E2723" }, 
    { id: 2, label: "10 - 30", unit: "cm", color: "#4E342E" },
    { id: 3, label: "30 - 60", unit: "cm", color: "#5D4037" }, 
    { id: 4, label: "60 - 100", unit: "cm", color: "#6D4C41" },
  ],
  tempAdvisories: [
    { id: 1, range: "25 – 30", risk: "Low", message: "Ideal for Onion bulb development." },
    { id: 2, range: "30 – 35", risk: "Medium", message: "Increase drip frequency; monitor Thrips." },
    { id: 3, range: "> 35", risk: "High", message: "High evaporation; apply mulch to save moisture." },
  ],
  moistureAdvisories: [
    { id: 1, range: "30 – 50", risk: "Low", message: "Moisture levels are adequate." },
    { id: 2, range: "15 – 30", risk: "Medium", message: "Plan irrigation cycle within 12 hours." },
    { id: 3, range: "< 15", risk: "High", message: "Wilting risk; immediate irrigation needed." },
  ]
};

const chartOptions = {
  responsive: true, maintainAspectRatio: false, animation: { duration: 0 },
  plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(17, 24, 39, 0.95)', padding: 6, titleFont: { size: 10, weight: 'bold' as const }, bodyFont: { size: 9 }, displayColors: false } },
  layout: { padding: { left: 0, right: 10, top: 5, bottom: 0 } },
  scales: { x: { grid: { display: false }, ticks: { font: { size: 8, weight: 'bold' as const }, color: '#1f2937' } }, y: { beginAtZero: false, grid: { color: '#e5e7eb', lineWidth: 1 }, ticks: { font: { size: 8, weight: 'bold' as const }, color: '#1f2937', maxTicksLimit: 5 } } },
  elements: { line: { tension: 0.4 }, point: { radius: 3, borderWidth: 1, hitRadius: 30 } }
};

export default function SoilHealthCardPage() {
  const [data, setData] = useState<HealthCardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Soil_Health_Card_Maharashtra_${data.cardNo.replace(/\//g, '_')}`,
  });

  const handleChange = (path: string, value: string) => { setData((prev) => { const newData = { ...prev }; const keys = path.split("."); let current: any = newData; for (let i = 0; i < keys.length - 1; i++) current = current[keys[i]]; current[keys[keys.length - 1]] = value; return newData; }); };
  const handleArrayChange = (arrayName: "testResults" | "secondaryRecs" | "fertilizerRecs", index: number, field: string, value: string) => { setData((prev) => { const newArray = [...prev[arrayName]]; // @ts-ignore
      newArray[index] = { ...newArray[index], [field]: value }; return { ...prev, [arrayName]: newArray }; }); };

  return (
    <div className="h-screen w-full overflow-auto bg-gray-100 p-4 md:p-8 text-black">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          html, body {
            height: auto !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          .print-break-after { break-after: page; page-break-after: always; }
          .print-break-before { break-before: page; page-break-before: always; }
          .no-print { display: none !important; }
          .print-block { display: block !important; }
        }
        .form-input { width: 100%; height: 100%; background: transparent; border: none; padding: 0 4px; font-size: 8px; font-weight: 600; outline: none; }
        .card-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .card-table td, .card-table th { border: 1px solid #1b5e20; padding: 0; vertical-align: middle; }
        .b-r { border-right: 1px solid #1b5e20; }
        .b-b { border-bottom: 1px solid #1b5e20; }
        textarea.form-input { resize: none; overflow: hidden; line-height: 1.1; display: flex; align-items: center; justify-content: center; }
      `}</style>

      {/* Control Bar */}
      <div className="max-w-[297mm] mx-auto mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded shadow-sm border border-gray-300 gap-4 no-print">
        <div><h1 className="text-xl font-bold text-gray-800">Maharashtra Soil Analytics</h1><p className="text-xs text-gray-500">Government of Maharashtra Standard Format</p></div>
        <button onClick={() => handlePrint && handlePrint()} className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded shadow-sm text-sm font-bold transition-colors"><Printer className="w-4 h-4" /> Download Maharashtra SHC</button>
      </div>

      <div className="w-full flex justify-center">
        <div ref={componentRef} className="bg-white text-black box-border flex flex-col items-center print-block print:w-full">
          
          {/* ================= PAGE 1 ================= */}
          <div className="w-[297mm] h-[210mm] p-[5mm] bg-white print-break-after shadow-xl print:shadow-none relative box-border flex flex-col border border-[#1b5e20] overflow-hidden">
            
            <div className="flex w-full h-[57%] border-b border-[#1b5e20]">
                {/* COL 1: Sidebar */}
                <div className={`w-[22%] h-full flex flex-col b-r ${C.SIDEBAR_BG}`}>
                    <div className="flex-1 p-2 flex flex-col items-center justify-start pt-3">
                        <div className="flex items-center gap-2 mb-2 w-full">
                            <img src="/images/gov-logo.png" className="h-9 w-auto object-contain"/>
                            <div className="text-[7px] font-bold leading-tight">Dept. of Agriculture & Cooperation<br/>Ministry of Agriculture<br/>Government of India</div>
                        </div>
                        <div className="flex items-center gap-2 mb-3 w-full">
                             <img src="/images/directorate-logo.png" className="h-9 w-auto object-contain"/>
                            <div className="text-[7px] font-bold leading-tight">Directorate of Agriculture<br/>Government of Maharashtra</div>
                        </div>
                        <div className="flex-1 flex justify-center items-center">
                            <img src="/images/soil-health-logo.png" className="w-20 h-auto object-contain drop-shadow-sm"/>
                        </div>
                    </div>
                    <div className="p-2 space-y-1.5 pb-3 text-[8px]">
                         <div className="flex flex-col">
                             <label className="font-bold text-green-900 leading-none mb-0.5">Soil Health Card No:</label>
                             <div className="b-b border-green-900"><input className="form-input h-3 text-left font-bold" value={data.cardNo} onChange={e=>handleChange("cardNo",e.target.value)}/></div>
                         </div>
                         <div className="flex flex-col">
                             <label className="font-bold text-green-900 leading-none mb-0.5">Name of Farmer:</label>
                             <div className="b-b border-green-900"><input className="form-input h-3 text-left font-bold" value={data.farmerNameSidebar} onChange={e=>handleChange("farmerNameSidebar",e.target.value)}/></div>
                         </div>
                         <div className="flex items-end font-bold text-green-900 gap-1">
                             <span className="w-10">Validity</span>
                             <span className="mr-1">From</span>
                             <input className="b-b border-green-900 w-8 text-center bg-transparent" value={data.validFrom} />
                             <span className="mx-1">To</span>
                             <input className="b-b border-green-900 w-8 text-center bg-transparent" value={data.validTo} />
                         </div>
                    </div>
                </div>

                {/* COL 2: Middle (Maharashtra Details) */}
                <div className="w-[38%] h-full flex flex-col b-r">
                    <div className={`${C.HEADER_GREEN} text-white text-center font-bold text-[9px] py-0.5 b-b`}>SOIL HEALTH CARD (MAHARASHTRA)</div>
                    <div className={`${C.HEADER_YELLOW} text-center font-bold text-[8px] b-b py-0.5`}>Farmer's Details</div>
                    <table className="card-table">
                        <tbody>
                            {[
                                {l:"Farmer Name",k:"name"},{l:"Address/Gat No.",k:"address"},{l:"Village",k:"village"},
                                {l:"Taluka",k:"subDistrict"},{l:"District",k:"district"},{l:"PIN Code",k:"pin"},
                                {l:"Aadhaar No.",k:"aadhaar"},{l:"Mobile No.",k:"mobile"}
                            ].map(row=>(
                                <tr key={row.k} className="h-[17px]">
                                    <td className="w-[35%] bg-white px-1 font-bold text-[8px]">{row.l}</td>
                                    <td className="bg-white"><input className="form-input" value={(data as any)[row.k]} onChange={e=>handleChange(row.k,e.target.value)}/></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex flex-col flex-1 border-t border-[#1b5e20]">
                         <div className={`${C.HEADER_YELLOW} text-center font-bold text-[8px] b-b py-0.5`}>Soil Sample & Land Details</div>
                         <table className="card-table h-full">
                            <tbody>
                                {[
                                    {l:"Sample Number",k:"sampleNo"},{l:"Collection Date",k:"sampleDate"},
                                    {l:"Survey/Gat No.",k:"surveyNo"},{l:"Khasra/Dag No.",k:"khasraNo"},{l:"Total Area (Ha)",k:"farmSize"}
                                ].map(row=>(
                                    <tr key={row.k} className="h-[17px]">
                                        <td className="w-[45%] bg-white px-1 font-bold text-[8px]">{row.l}</td>
                                        <td className="bg-white" colSpan={3}><input className="form-input" value={(data as any)[row.k]} /></td>
                                    </tr>
                                ))}
                                <tr className="h-[17px]">
                                    <td className="w-[45%] bg-white px-1 font-bold text-[8px]">GPS Coordinates</td>
                                    <td className="px-1 bg-white w-[10%] text-[8px] font-bold">Lat:</td>
                                    <td className="bg-white"><input className="form-input" value={data.gpsLat} /></td>
                                    <td className="px-1 bg-white w-[10%] text-[8px] font-bold">Long:</td>
                                    <td className="bg-white"><input className="form-input" value={data.gpsLong} /></td>
                                </tr>
                                <tr className="h-[17px]">
                                    <td className="w-[45%] bg-white px-1 font-bold text-[8px]">Source of Irrigation</td>
                                    <td className="bg-white" colSpan={4}><input className="form-input" value={data.irrigationType} /></td>
                                </tr>
                            </tbody>
                         </table>
                    </div>
                </div>

                {/* COL 3: Right (Test Results) */}
                <div className="w-[40%] h-full flex flex-col">
                    <div className="flex h-[24px] b-b">
                        <div className={`w-[30%] px-1 text-[8px] font-bold b-r flex items-center leading-tight ${C.SIDEBAR_BG}`}>Laboratory Name</div>
                        <div className={`flex-1 ${C.SIDEBAR_BG} flex items-center px-2 font-bold text-[8px]`}>District Soil Testing Lab, Nashik (MPKV)</div>
                    </div>
                    <div className={`${C.TABLE_HEADER_GREEN} text-center font-bold text-[9px] b-b py-0.5`}>SOIL TEST ANALYSIS</div>
                    <div className="flex-1">
                        <table className="card-table h-full text-[8px]">
                            <thead className={C.TABLE_HEADER_GREEN}>
                                <tr className="h-[22px]">
                                    <th className="w-8">Sr.</th>
                                    <th className="text-left px-1">Nutrient Parameter</th>
                                    <th className="w-12">Value</th>
                                    <th className="w-10">Unit</th>
                                    <th className="w-12">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.testResults.map((item, idx) => (
                                    <tr key={item.id} className="h-[18px]">
                                        <td className="text-center bg-white">{item.id}</td>
                                        <td className="px-1 font-medium bg-white">{item.parameter}</td>
                                        <td className="bg-white"><input className="form-input text-center" value={item.value} /></td>
                                        <td className="text-center text-[7px] bg-white">{item.unit}</td>
                                        <td className="bg-white"><input className="form-input text-center" value={item.rating} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 2. BOTTOM SECTION */}
            <div className="flex w-full h-[43%]">
                <div className="w-[30%] h-full flex flex-col b-r">
                    <div className="flex-1 flex flex-col">
                        <div className="bg-[#00897b] text-white font-bold text-[8px] text-center py-0.5 b-b">Micro-Nutrient Advice</div>
                        <table className="card-table h-full">
                            <thead className={`${C.HEADER_YELLOW} text-[7px]`}>
                                <tr className="h-[20px]">
                                    <th className="w-8 text-center">Sr.</th>
                                    <th className="text-center">Nutrient</th>
                                    <th className="text-center px-1">Dose/Application Advice</th>
                                </tr>
                            </thead>
                            <tbody className="text-[8px]">
                                {data.secondaryRecs.map((row) => (
                                    <tr key={row.id}>
                                        <td className="text-center bg-white">{row.id}</td>
                                        <td className="px-1 bg-white font-medium">{row.parameter}</td>
                                        <td className="bg-white"><input className="form-input" value={row.recommendation} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="h-auto border-t border-[#1b5e20] flex flex-col">
                        <div className={`${C.HEADER_YELLOW} text-black font-bold text-[8px] text-center py-0.5 b-b`}>General Suggestions</div>
                        <table className="card-table text-[8px]">
                            <tbody>
                                {[
                                    {id:1, l:"Organic Manure", k:"manure"}, {id:2, l:"Bio-Fertilizer", k:"biofertiliser"}, {id:3, l:"Soil Conditioner", k:"lime"}
                                ].map((row)=>(
                                    <tr key={row.id} className="h-[18px]">
                                        <td className="w-8 text-center bg-white">{row.id}</td>
                                        <td className="w-[40%] px-1 font-medium bg-white">{row.l}</td>
                                        <td className="bg-white"><input className="form-input" value={(data.generalRecs as any)[row.k]} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="h-10 border-t border-[#1b5e20] flex justify-between items-center px-1 bg-white mt-auto">
                        <div className="text-[6px] font-bold text-center leading-tight w-[30%]">स्वच्छ भारत<br/>अभियान</div>
                        <div className="flex justify-center flex-1"><img src="/images/soil-health-logo.png" className="h-7 w-auto mix-blend-multiply" /></div>
                        <div className="text-[6px] font-bold text-center leading-tight w-[30%]">Healthy Soils<br/>Maharashtra<br/>Prosperous Farmer</div>
                    </div>
                </div>

                <div className="w-[70%] h-full flex flex-col">
                    <div className="bg-[#43a047] text-white text-center font-bold text-[9px] py-0.5 b-b">
                        Maharashtra Crop-Specific Fertilizer Recommendations (Per Hectare)
                    </div>
                    <table className="card-table text-[8px] h-full">
                        <thead>
                            <tr className={`h-[28px] ${C.COL_BROWN}`}>
                                <th className="w-8">Sr.</th>
                                <th className="w-[20%]">Crop & Variety</th>
                                <th className={`w-[15%] ${C.COL_YELLOW}`}>Expected Yield</th>
                                <th className={`w-[30%] ${C.COL_GREEN_1}`}>Fertilizer Option 1 (N:P:K)</th>
                                <th className={`w-[30%] ${C.COL_GREEN_2}`}>Fertilizer Option 2 (Straight)</th>
                            </tr>
                        </thead>
                        <tbody>
                             {data.fertilizerRecs.map((row, i) => (
                                <tr key={row.id}>
                                    <td className={`text-center font-bold ${C.COL_BROWN}`}>{row.id}</td>
                                    <td className={`${C.COL_BROWN}`}><textarea className="form-input pt-1 text-center" rows={2} value={row.crop} onChange={(e)=>handleArrayChange("fertilizerRecs", i, "crop", e.target.value)}/></td>
                                    <td className={`${C.COL_YELLOW}`}><textarea className="form-input pt-1 text-center" rows={2} value={row.refYield} /></td>
                                    <td className={`${C.COL_GREEN_1}`}><textarea className="form-input pt-1" rows={2} value={row.combo1} /></td>
                                    <td className={`${C.COL_GREEN_2}`}><textarea className="form-input pt-1" rows={2} value={row.combo2} /></td>
                                </tr>
                             ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>

          {/* ================= PAGE 2 (Analytics) ================= */}
          <div className="w-[297mm] h-[210mm] p-[5mm] pt-4 bg-white shadow-xl print:shadow-none relative box-border flex flex-col overflow-hidden print-break-before">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border border-gray-300 rounded p-2 h-40 flex flex-col items-center justify-center bg-gray-50">
                  <span className="text-xs font-bold text-gray-400">Maharashtra GIS Mapping</span>
                  <div className="text-center mt-2">
                    <span className="text-gray-500 font-bold text-sm block mb-1">Satellite Farm Plot #422</span>
                    <span className="text-gray-400 font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Nashik Region | Niphad Cluster</span>
                  </div>
              </div>
              <div className="border border-gray-300 rounded p-2 h-40 flex flex-col items-center justify-center bg-emerald-50">
                  <span className="text-xs font-bold text-emerald-600">Soil Saathi – Maharashtra Map</span>
                  <div className="text-center mt-2">
                    <span className="text-emerald-700 font-bold text-sm block mb-1">Black Soil (Regur) Profile</span>
                    <span className="text-emerald-600 text-[10px]">Alkalinity Risk: Medium</span>
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 bg-white rounded-lg border border-gray-200 mb-4 shadow-sm overflow-hidden">
              <div className="flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/30">
                <h4 className="text-[10px] font-bold text-gray-800 mb-4 uppercase tracking-wide">Soil Depth (Nashik Black Soil)</h4>
                <div className="flex items-center justify-center w-full gap-6 pl-2">
                  <div style={{ width: '120px', height: '220px' }} className="flex-shrink-0 relative">
                    <div className="absolute inset-0 flex flex-col">
                        <div className="h-[15%] bg-[#3E2723] border-b border-white"></div>
                        <div className="h-[25%] bg-[#4E342E] border-b border-white"></div>
                        <div className="h-[30%] bg-[#5D4037] border-b border-white"></div>
                        <div className="h-[30%] bg-[#6D4C41]"></div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between py-4" style={{ height: '220px' }}>
                    {data.soilDepthLayers.map((layer) => (
                        <div key={layer.id} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: layer.color }}></div>
                            <span className="text-[10px] font-bold text-gray-700 font-mono">{layer.label} {layer.unit}</span>
                        </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col p-3 border-b md:border-b-0 md:border-r border-gray-200">
                <h4 className="text-[10px] font-bold text-gray-800 mb-1 text-center uppercase tracking-wide">Nashik Temperature (°C)</h4>
                <div className="relative h-60 w-full pt-2">
                  <Line data={{labels: data.forecast.map((d) => d.day), datasets: [{label: 'Temp', data: data.forecast.map((d) => d.temp), borderColor: "#ea580c", backgroundColor: "rgba(234, 88, 12, 0.2)", fill: true, pointBackgroundColor: "#fff", pointBorderColor: "#ea580c", borderWidth: 2, tension: 0.4}],}} options={chartOptions} />
                </div>
              </div>
              <div className="flex flex-col p-3">
                <h4 className="text-[10px] font-bold text-gray-800 mb-1 text-center uppercase tracking-wide">Nashik Soil Moisture (%)</h4>
                <div className="relative h-60 w-full pt-2">
                  <Line data={{labels: data.forecast.map((d) => d.day), datasets: [{label: 'Moisture', data: data.forecast.map((d) => d.moisture), borderColor: "#0284c7", backgroundColor: "rgba(2, 132, 199, 0.2)", fill: true, pointBackgroundColor: "#fff", pointBorderColor: "#0284c7", borderWidth: 2, tension: 0.4}],}} options={chartOptions} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[10px] mb-4">
                <div className="border border-orange-200 rounded">
                    <div className="bg-orange-100 px-2 py-1 font-bold text-orange-900">Weather Advisory (Maharashtra)</div>
                    {data.tempAdvisories.map(row=>(<div key={row.id} className="flex justify-between px-2 py-1 border-b border-gray-100 last:border-0"><span>{row.range}°C</span><span className="text-gray-600">{row.message}</span></div>))}
                </div>
                <div className="border border-blue-200 rounded">
                    <div className="bg-blue-100 px-2 py-1 font-bold text-blue-900">Irrigation Advice (Nashik Cluster)</div>
                    {data.moistureAdvisories.map(row=>(<div key={row.id} className="flex justify-between px-2 py-1 border-b border-gray-100 last:border-0"><span>{row.range}%</span><span className="text-gray-600">{row.message}</span></div>))}
                </div>
            </div>

            <div className="mt-auto w-full text-center pb-8">
              <h5 className="font-semibold text-[#000000] text-[10px] uppercase mb-1">Disclaimer: Soil Test Crop Response (STCR) data referenced from MPKV Rahuri & ICAR for Maharashtra region.</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}