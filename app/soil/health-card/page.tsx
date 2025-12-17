"use client";

import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, Loader2, Save } from "lucide-react";

// --- Types & Interfaces ---

interface TestResult {
  id: number;
  parameter: string;
  value: string;
  unit: string;
  rating: string;
}

interface SecondaryRec {
  id: number;
  parameter: string;
  recommendation: string;
}

interface FertilizerRec {
  id: number;
  crop: string;
  refYield: string;
  combo1: string;
  combo2: string;
}

interface HealthCardData {
  // Sidebar
  cardNo: string;
  farmerNameSidebar: string;
  validFrom: string;
  validTo: string;

  // Farmer Details
  name: string;
  address: string;
  village: string;
  subDistrict: string;
  district: string;
  pin: string;
  aadhaar: string;
  mobile: string;

  // Soil Sample Details
  sampleNo: string;
  sampleDate: string;
  surveyNo: string;
  khasraNo: string;
  farmSize: string;
  gpsLat: string;
  gpsLong: string;
  irrigationType: string;

  // Tables
  testResults: TestResult[];
  secondaryRecs: SecondaryRec[];
  generalRecs: {
    manure: string;
    biofertiliser: string;
    lime: string;
  };
  fertilizerRecs: FertilizerRec[];
}

// --- Initial Empty State (No Mock Data) ---
const INITIAL_DATA: HealthCardData = {
  cardNo: "",
  farmerNameSidebar: "",
  validFrom: "",
  validTo: "",
  name: "",
  address: "",
  village: "",
  subDistrict: "",
  district: "",
  pin: "",
  aadhaar: "",
  mobile: "",
  sampleNo: "",
  sampleDate: "",
  surveyNo: "",
  khasraNo: "",
  farmSize: "",
  gpsLat: "",
  gpsLong: "",
  irrigationType: "",
  testResults: [
    { id: 1, parameter: "pH", value: "", unit: "", rating: "" },
    { id: 2, parameter: "EC", value: "", unit: "dS/m", rating: "" },
    { id: 3, parameter: "Organic Carbon (OC)", value: "", unit: "%", rating: "" },
    { id: 4, parameter: "Available Nitrogen (N)", value: "", unit: "kg/ha", rating: "" },
    { id: 5, parameter: "Available Phosphorus (P)", value: "", unit: "kg/ha", rating: "" },
    { id: 6, parameter: "Available Potassium (K)", value: "", unit: "kg/ha", rating: "" },
    { id: 7, parameter: "Available Sulphur (S)", value: "", unit: "ppm", rating: "" },
    { id: 8, parameter: "Available Zinc (Zn)", value: "", unit: "ppm", rating: "" },
    { id: 9, parameter: "Available Boron (B)", value: "", unit: "ppm", rating: "" },
    { id: 10, parameter: "Available Iron (Fe)", value: "", unit: "ppm", rating: "" },
    { id: 11, parameter: "Available Manganese (Mn)", value: "", unit: "ppm", rating: "" },
    { id: 12, parameter: "Available Copper (Cu)", value: "", unit: "ppm", rating: "" },
  ],
  secondaryRecs: [
    { id: 1, parameter: "Sulphur (S)", recommendation: "" },
    { id: 2, parameter: "Zinc (Zn)", recommendation: "" },
    { id: 3, parameter: "Boron (B)", recommendation: "" },
    { id: 4, parameter: "Iron (Fe)", recommendation: "" },
    { id: 5, parameter: "Manganese (Mn)", recommendation: "" },
    { id: 6, parameter: "Copper (Cu)", recommendation: "" },
  ],
  generalRecs: { manure: "", biofertiliser: "", lime: "" },
  fertilizerRecs: Array(6).fill(null).map((_, i) => ({
    id: i + 1,
    crop: "",
    refYield: "",
    combo1: "",
    combo2: "",
  })),
};

export default function SoilHealthCardPage() {
  const [data, setData] = useState<HealthCardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);

  // --- Backend Fetch ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/soil/health-card");
        if (res.ok) {
          const jsonData = await res.json();
          setData((prev) => ({ ...prev, ...jsonData }));
        }
      } catch (error) {
        console.error("Backend fetch failed. Using empty state.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Print Handler ---
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Soil_Health_Card_${data.cardNo || "Draft"}`,
  });

  // --- Input Handler ---
  const handleChange = (path: string, value: string) => {
    setData((prev) => {
      const newData = { ...prev };
      const keys = path.split(".");
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleArrayChange = (arrayName: "testResults" | "secondaryRecs" | "fertilizerRecs", index: number, field: string, value: string) => {
    setData((prev) => {
      const newArray = [...prev[arrayName]];
      // @ts-ignore
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-green-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {/* Control Bar */}
      <div className="max-w-[297mm] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded shadow-sm border border-gray-300">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Soil Health Card</h1>
          <p className="text-xs text-gray-500">Government of India Standard Format</p>
        </div>
        <button
          onClick={() => handlePrint && handlePrint()}
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded shadow-sm text-sm font-bold transition-colors"
        >
          <Printer className="w-4 h-4" /> Download as PDF
        </button>
      </div>

      {/* --- PRINTABLE CANVAS --- */}
      {/* SCROLL FIX APPLIED HERE: Removed 'flex justify-center', added 'mx-auto' to child */}
      <div className="overflow-auto pb-10">
        <div
          ref={componentRef}
          className="bg-white w-[297mm] min-h-[210mm] shadow-xl text-black box-border p-[5mm] mx-auto"
          style={{ printColorAdjust: "exact" }}
        >
          {/* ================= TOP SECTION ================= */}
          <div className="grid grid-cols-[23%_39%_38%] gap-[2px] mb-[2px] items-stretch">
            
            {/* 1. SIDEBAR: LEFT GREEN PANEL */}
            <div className="bg-[#aed581] border border-green-900 p-3 flex flex-col h-full relative">
              
              {/* --- TOP SECTION: ROW 1 (Central Govt) --- */}
              {/* Layout: [Logo] [Text] */}
              <div className="flex items-center gap-3 mb-4">
                 {/* India Emblem */}
                 <div className="w-10 flex-shrink-0 flex justify-center">
                    <img 
                      src="/images/gov-logo.png" 
                      alt="India Emblem" 
                      className="h-12 w-auto object-contain"
                    />
                 </div>
                 {/* Text */}
                 <div className="text-[8px] font-bold text-gray-900 leading-snug text-left">
                    Department of Agriculture & Cooperation<br/>
                    Ministry of Agriculture & Farmers Welfare<br/>
                    Government of India
                 </div>
              </div>

              {/* --- TOP SECTION: ROW 2 (State Govt) --- */}
              {/* Layout: [Logo] [Text] */}
              <div className="flex items-center gap-3 mb-8">
                 {/* Directorate Logo */}
                 <div className="w-10 flex-shrink-0 flex justify-center">
                    <img 
                      src="/images/directorate-logo.png" 
                      alt="State Logo" 
                      className="h-12 w-auto object-contain"
                    />
                 </div>
                 {/* Text */}
                 <div className="text-[9px] font-bold text-gray-900 leading-snug text-left">
                    Directorate of Agriculture<br/>
                    Government of Maharashtra
                 </div>
              </div>

              {/* --- CENTER IMAGE: BADGE --- */}
              <div className="flex-1 flex flex-col items-center justify-start pt-4">
                 <img 
                   src="/images/soil-health-logo.png" 
                   alt="Soil Health Card Badge" 
                   className="w-28 h-auto object-contain drop-shadow-sm"
                 />
                 {/* Tagline often found under this specific logo */}
                 {/*<div className="text-[8px] font-bold text-black mt-1">Swasth Dhara, Khet Hara</div>*/}
              </div>

              {/* --- BOTTOM SECTION: INPUT FIELDS --- */}
              <div className="w-full mt-auto space-y-4 pb-2">
                 
                 {/* Card No */}
                 <div className="flex items-end w-full">
                    <label className="text-[9px] font-bold text-green-900 whitespace-nowrap mr-2 mb-0.5">Soil Health Card No:</label>
                    <div className="flex-1 border-b-[1.5px] border-green-900">
                        <input 
                            className="w-full bg-transparent border-none p-0 h-4 text-[10px] font-bold focus:ring-0 text-left px-1" 
                            value={data.cardNo} 
                            onChange={(e) => handleChange("cardNo", e.target.value)}
                        />
                    </div>
                 </div>

                 {/* Farmer Name */}
                 <div className="flex items-end w-full">
                    <label className="text-[9px] font-bold text-green-900 whitespace-nowrap mr-2 mb-0.5">Name of Farmer:</label>
                    <div className="flex-1 border-b-[1.5px] border-green-900">
                        <input 
                            className="w-full bg-transparent border-none p-0 h-4 text-[10px] font-bold focus:ring-0 text-left px-1" 
                            value={data.farmerNameSidebar} 
                            onChange={(e) => handleChange("farmerNameSidebar", e.target.value)}
                        />
                    </div>
                 </div>

                 {/* Validity */}
                 <div className="flex items-end w-full text-[9px] font-bold text-green-900">
                    <span className="mb-0.5 w-16">Validity:</span>
                    
                    <span className="mr-1 mb-0.5">From</span>
                    <div className="flex-1 border-b-[1.5px] border-green-900">
                        <input 
                            className="w-full bg-transparent border-none p-0 h-4 text-[10px] font-medium focus:ring-0 text-center" 
                            value={data.validFrom} 
                            onChange={(e) => handleChange("validFrom", e.target.value)} 
                        />
                    </div>
                    
                    <span className="mx-1 mb-0.5">To</span>
                    <div className="flex-1 border-b-[1.5px] border-green-900">
                        <input 
                            className="w-full bg-transparent border-none p-0 h-4 text-[10px] font-medium focus:ring-0 text-center" 
                            value={data.validTo} 
                            onChange={(e) => handleChange("validTo", e.target.value)} 
                        />
                    </div>
                 </div>

              </div>
            </div>

            {/* --- COL 2: FARMER & SAMPLE DETAILS --- */}
            {/* 2. MIDDLE COLUMN: Farmer & Sample Details */}
            <div className="flex flex-col h-full border-r border-green-900 bg-white">
               
               {/* Main Title */}
               <div className="bg-[#2e7d32] text-white text-center font-bold text-[10px] py-1 border-b border-green-900 shrink-0">
                  SOIL HEALTH CARD
               </div>
               
               {/* Farmer Details Table */}
               <div className="flex-1 flex flex-col justify-start">
                  <table className="w-full border-collapse">
                     <thead>
                        <tr>
                           <th colSpan={2} className="bg-[#fdd835] text-black font-bold text-[9px] border-b border-green-900 py-0.5 text-center h-[20px]">
                              Farmer's Details
                           </th>
                        </tr>
                     </thead>
                     <tbody>
                        {[
                           { l: "Name", k: "name" },
                           { l: "Address", k: "address" },
                           { l: "Village", k: "village" },
                           { l: "Sub-District", k: "subDistrict" },
                           { l: "District", k: "district" },
                           { l: "PIN", k: "pin" },
                           { l: "Aadhaar Number", k: "aadhaar" },
                           { l: "Mobile Number", k: "mobile" }
                        ].map((row) => (
                           <tr key={row.k} className="h-[22px]">
                              <td className="w-[35%] border-b border-r border-green-900 px-1 font-bold text-[8px] bg-white align-middle whitespace-nowrap">
                                 {row.l}
                              </td>
                              <td className="border-b border-green-900 px-1 bg-white align-middle">
                                 <input 
                                    className="w-full h-full text-[9px] font-medium border-none p-0 focus:ring-0 bg-transparent" 
                                    value={(data as any)[row.k]} 
                                    onChange={e => handleChange(row.k, e.target.value)} 
                                 />
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {/* Soil Sample Details Table */}
               <div className="flex-1 flex flex-col justify-start border-t border-green-900">
                  <table className="w-full border-collapse">
                     <thead>
                        <tr>
                           <th colSpan={2} className="bg-[#fdd835] text-black font-bold text-[9px] border-b border-green-900 py-0.5 text-center h-[20px]">
                              Soil Sample Details
                           </th>
                        </tr>
                     </thead>
                     <tbody>
                        {[
                           { l: "Soil Sample Number", k: "sampleNo" },
                           { l: "Sample Collected on", k: "sampleDate" },
                           { l: "Survey No.", k: "surveyNo" },
                           { l: "Khasra No. / Dag No.", k: "khasraNo" },
                           { l: "Farm Size", k: "farmSize" }
                        ].map((row) => (
                           <tr key={row.k} className="h-[22px]">
                              <td className="w-[45%] border-b border-r border-green-900 px-1 font-bold text-[8px] bg-white align-middle whitespace-nowrap">
                                 {row.l}
                              </td>
                              <td className="border-b border-green-900 px-1 bg-white align-middle">
                                 <input 
                                    className="w-full h-full text-[9px] font-medium border-none p-0 focus:ring-0 bg-transparent" 
                                    value={(data as any)[row.k]} 
                                    onChange={e => handleChange(row.k, e.target.value)} 
                                 />
                              </td>
                           </tr>
                        ))}
                        {/* GPS Row */}
                        <tr className="h-[22px]">
                           <td className="w-[45%] border-b border-r border-green-900 px-1 font-bold text-[8px] bg-white align-middle">
                              Geo Position (GPS)
                           </td>
                           <td className="border-b border-green-900 px-1 bg-white align-middle">
                              <div className="flex items-center h-full text-[8px] gap-1">
                                 <span>Lat:</span>
                                 <input 
                                    className="w-12 border-b border-dotted border-gray-400 p-0 text-[9px] h-3 focus:ring-0 bg-transparent" 
                                    value={data.gpsLat} 
                                    onChange={e => handleChange("gpsLat", e.target.value)}
                                 />
                                 <span className="mx-1">|</span>
                                 <span>Long:</span>
                                 <input 
                                    className="w-12 border-b border-dotted border-gray-400 p-0 text-[9px] h-3 focus:ring-0 bg-transparent" 
                                    value={data.gpsLong} 
                                    onChange={e => handleChange("gpsLong", e.target.value)}
                                 />
                              </div>
                           </td>
                        </tr>
                        {/* Irrigated Row (Last row, no bottom border for the cell if container handles it, but table usually needs it) */}
                        <tr className="h-[22px]">
                           <td className="w-[45%] border-r border-green-900 px-1 font-bold text-[8px] bg-white align-middle">
                              Irrigated / Rainfed
                           </td>
                           <td className="px-1 bg-white align-middle">
                              <input 
                                 className="w-full h-full text-[9px] font-medium border-none p-0 focus:ring-0 bg-transparent" 
                                 value={data.irrigationType} 
                                 onChange={e => handleChange("irrigationType", e.target.value)} 
                              />
                           </td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>

            {/* --- COL 3: TEST RESULTS --- */}
            <div className="flex flex-col border border-green-800">
               {/* Lab Header */}
               <div className="bg-[#aed581] border-b border-green-800 flex items-center h-[26px]">
                  <div className="w-[30%] px-1 text-[9px] font-bold border-r border-green-800 h-full flex items-center">Name of Laboratory</div>
                  <div className="flex-1 h-full">
                    <input className="w-full h-full bg-transparent border-none p-1 text-[9px] focus:ring-0" placeholder="Central Lab" />
                  </div>
               </div>
               
               <div className="bg-[#8bc34a] text-center font-bold text-[10px] border-b border-green-800 py-1">
                 SOIL TEST RESULTS
               </div>

               <table className="w-full text-[9px] border-collapse flex-1">
                  <thead className="bg-[#9ccc65]">
                    <tr className="h-[24px]">
                      <th className="border-r border-b border-green-800 w-6 p-0">S.No.</th>
                      <th className="border-r border-b border-green-800 text-left px-1 p-0">Parameter</th>
                      <th className="border-r border-b border-green-800 w-12 p-0">Test Value</th>
                      <th className="border-r border-b border-green-800 w-10 p-0">Unit</th>
                      <th className="border-b border-green-800 w-12 p-0">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.testResults.map((item, i) => (
                      <tr key={item.id} className="border-b border-green-800 h-[21px] last:border-0">
                         <td className="border-r border-green-800 text-center bg-white">{item.id}</td>
                         <td className="border-r border-green-800 px-1 bg-white whitespace-nowrap font-medium">{item.parameter}</td>
                         <td className="border-r border-green-800 px-0 bg-white">
                           <input className="w-full text-center border-none p-0 text-[9px] focus:ring-0 h-full" value={item.value} onChange={(e) => handleArrayChange("testResults", i, "value", e.target.value)} />
                         </td>
                         <td className="border-r border-green-800 px-0 bg-white text-center text-[8px]">
                           {item.unit}
                         </td>
                         <td className="px-0 bg-white">
                           <input className="w-full text-center border-none p-0 text-[9px] focus:ring-0 h-full" value={item.rating} onChange={(e) => handleArrayChange("testResults", i, "rating", e.target.value)} />
                         </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>

          </div>

          {/* ================= BOTTOM SECTION ================= */}
          <div className="grid grid-cols-[30%_70%] gap-[2px] items-stretch">
            
            {/* --- LEFT BOTTOM: RECS --- */}
            <div className="flex flex-col gap-[2px]">
              {/* Secondary Recs */}
              <div className="border border-green-800">
                 <div className="bg-[#00897b] text-white font-bold text-[9px] px-1 py-0.5 text-center">
                   Secondary & Micro Nutrients Recommendations
                 </div>
                 <div className="bg-[#fdd835] grid grid-cols-[12%_43%_45%] text-[8px] font-bold border-b border-green-800 text-center items-center h-[20px]">
                    <div className="border-r border-green-800 h-full flex items-center justify-center">Sl. No.</div>
                    <div className="border-r border-green-800 h-full flex items-center justify-center">Parameter</div>
                    <div className="h-full flex items-center justify-center leading-tight">Recommendations for Soil Applications</div>
                 </div>
                 <div className="bg-white text-[9px]">
                   {data.secondaryRecs.map((row, i) => (
                     <div key={row.id} className="grid grid-cols-[12%_43%_45%] border-b border-green-800 last:border-0 h-[22px] items-center">
                       <div className="border-r border-green-800 text-center h-full flex items-center justify-center">{row.id}</div>
                       <div className="border-r border-green-800 px-1 h-full flex items-center font-medium">{row.parameter}</div>
                       <div className="px-1 h-full">
                         <input className="w-full h-full border-none p-0 text-[9px] focus:ring-0" value={row.recommendation} onChange={(e) => handleArrayChange("secondaryRecs", i, "recommendation", e.target.value)} />
                       </div>
                     </div>
                   ))}
                 </div>
              </div>

              {/* General Recs */}
              <div className="border border-green-800 flex-1 flex flex-col">
                 <div className="bg-[#ffb300] text-black font-bold text-[9px] px-1 py-0.5 text-center border-b border-green-800">
                    General Recommendations
                 </div>
                 <table className="w-full text-[9px] border-collapse flex-1">
                   <tbody>
                      <tr className="border-b border-green-800 h-[22px]">
                         <td className="border-r border-green-800 w-6 text-center bg-white">1</td>
                         <td className="border-r border-green-800 px-1 w-[35%] bg-white font-medium">Organic Manure</td>
                         <td className="px-1 bg-white p-0">
                            <input className="w-full h-full border-none p-0 text-[9px] focus:ring-0" value={data.generalRecs.manure} onChange={(e) => handleChange("generalRecs.manure", e.target.value)} />
                         </td>
                      </tr>
                      <tr className="border-b border-green-800 h-[22px]">
                         <td className="border-r border-green-800 w-6 text-center bg-white">2</td>
                         <td className="border-r border-green-800 px-1 w-[35%] bg-white font-medium">Biofertiliser</td>
                         <td className="px-1 bg-white p-0">
                            <input className="w-full h-full border-none p-0 text-[9px] focus:ring-0" value={data.generalRecs.biofertiliser} onChange={(e) => handleChange("generalRecs.biofertiliser", e.target.value)} />
                         </td>
                      </tr>
                      <tr className="border-b border-green-800 h-[22px]">
                         <td className="border-r border-green-800 w-6 text-center bg-white">3</td>
                         <td className="border-r border-green-800 px-1 w-[35%] bg-white font-medium">Lime / Gypsum</td>
                         <td className="px-1 bg-white p-0">
                            <input className="w-full h-full border-none p-0 text-[9px] focus:ring-0" value={data.generalRecs.lime} onChange={(e) => handleChange("generalRecs.lime", e.target.value)} />
                         </td>
                      </tr>
                   </tbody>
                 </table>

                 {/* Footer */}
                 <div className="flex items-center justify-between p-2 bg-white border-t border-green-800 mt-auto">
                    <div className="text-[8px] font-bold text-center leading-tight">
                       International<br/>Year of Soils<br/><span className="text-sm">2015</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-200 border border-gray-400"></div>
                    <div className="text-[8px] font-bold text-center leading-tight">
                       Healthy Soils<br/>for<br/>a Healthy Life
                    </div>
                 </div>
              </div>
            </div>

            {/* --- RIGHT BOTTOM: FERTILIZER RECS --- */}
            <div className="border border-green-800 flex flex-col">
               <div className="bg-[#43a047] text-white text-center font-bold text-[9px] py-1 border-b border-green-800">
                  Fertilizer Recommendations for Reference Yield (with Organic Manure)
               </div>
               
               <table className="w-full text-[9px] border-collapse flex-1">
                  <thead className="bg-[#cfd8dc]">
                     <tr className="h-[30px]">
                        <th className="border-r border-b border-green-800 w-6 p-0.5">Sl. No.</th>
                        <th className="border-r border-b border-green-800 w-[20%] p-0.5">Crop & Variety</th>
                        <th className="border-r border-b border-green-800 w-[15%] p-0.5">Reference Yield</th>
                        <th className="border-r border-b border-green-800 w-[30%] p-0.5">Fertilizer Combination-1 for N P K</th>
                        <th className="border-b border-green-800 w-[30%] p-0.5">Fertilizer Combination-2 for N P K</th>
                     </tr>
                  </thead>
                  <tbody>
                     {data.fertilizerRecs.map((row, i) => (
                        <tr key={row.id} className="border-b border-green-800 last:border-0 h-[45px]">
                           <td className="border-r border-green-800 text-center bg-[#d7ccc8] font-bold">{row.id}</td>
                           <td className="border-r border-green-800 px-0 bg-[#d7ccc8] p-0 align-middle">
                              <textarea className="w-full h-full bg-transparent border-none p-1 text-[9px] resize-none focus:ring-0 text-center align-middle" rows={2} value={row.crop} onChange={(e) => handleArrayChange("fertilizerRecs", i, "crop", e.target.value)} />
                           </td>
                           <td className="border-r border-green-800 px-0 bg-[#f0f4c3] p-0 align-middle">
                              <textarea className="w-full h-full bg-transparent border-none p-1 text-[9px] resize-none focus:ring-0 text-center align-middle" rows={2} value={row.refYield} onChange={(e) => handleArrayChange("fertilizerRecs", i, "refYield", e.target.value)} />
                           </td>
                           <td className="border-r border-green-800 px-0 bg-[#dcedc8] p-0 align-middle">
                              <textarea className="w-full h-full bg-transparent border-none p-1 text-[9px] resize-none focus:ring-0 align-middle" rows={3} value={row.combo1} onChange={(e) => handleArrayChange("fertilizerRecs", i, "combo1", e.target.value)} />
                           </td>
                           <td className="px-0 bg-[#f1f8e9] p-0 align-middle">
                              <textarea className="w-full h-full bg-transparent border-none p-1 text-[9px] resize-none focus:ring-0 align-middle" rows={3} value={row.combo2} onChange={(e) => handleArrayChange("fertilizerRecs", i, "combo2", e.target.value)} />
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}