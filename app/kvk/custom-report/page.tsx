"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, Filter, Download, Plus, X, ChevronDown, 
  HelpCircle, Trash2, Edit2, Mail, CheckSquare, Square, 
  ArrowUpDown, Info, FileText
} from 'lucide-react';

// --- Types ---
interface FieldData {
  id: string;
  fieldName: string;
  location: string;
  coords: string;
  ndviChange: number;
  ndmiDate: string;
  ndmiValue: number;
  ndmiChange: number;
  reciDate: string;
  reciValue: number;
  reciChange: number;
  area: string;
  crop: string;
  variety: string;
  sowingDate: string;
  [key: string]: any; // Allow dynamic access
}

interface ColumnDef {
  id: string;
  label: string;
  category: 'General' | 'Satellite' | 'Weather';
}

// --- MOCK DATA ---
const ALL_COLUMNS: ColumnDef[] = [
  { id: 'field', label: 'Field', category: 'General' },
  { id: 'crop', label: 'Crop', category: 'General' },
  { id: 'variety', label: 'Variety', category: 'General' },
  { id: 'area', label: 'Area', category: 'General' },
  { id: 'sowing', label: 'Sowing Date', category: 'General' },
  { id: 'ndvi_change', label: 'NDVI change', category: 'Satellite' },
  { id: 'ndmi_date', label: 'NDMI image date', category: 'Satellite' },
  { id: 'ndmi_val', label: 'NDMI value', category: 'Satellite' },
  { id: 'ndmi_change', label: 'NDMI change', category: 'Satellite' },
  { id: 'reci_date', label: 'RECI image date', category: 'Satellite' },
  { id: 'reci_val', label: 'RECI value', category: 'Satellite' },
  { id: 'reci_change', label: 'RECI change', category: 'Satellite' },
];

const INITIAL_DATA: FieldData[] = [
  { id: '1', fieldName: 'Field 1', location: 'India', coords: '20.8346°N 77.1659°E', ndviChange: -0.01, ndmiDate: 'Dec 16, 2025', ndmiValue: 0.32, ndmiChange: 0.02, reciDate: 'Dec 16, 2025', reciValue: 5.30, reciChange: -0.54, area: '1.8 ha', crop: 'Wheat', variety: 'Lokwan', sowingDate: '15 Nov 2025' },
  { id: '2', fieldName: 'Field 4 (North)', location: 'India', coords: '20.8350°N 77.1680°E', ndviChange: 0.05, ndmiDate: 'Dec 16, 2025', ndmiValue: 0.41, ndmiChange: 0.08, reciDate: 'Dec 16, 2025', reciValue: 6.12, reciChange: 0.15, area: '2.4 ha', crop: 'Mustard', variety: 'Pusa Bold', sowingDate: '20 Oct 2025' },
  { id: '3', fieldName: 'Field 2 (East)', location: 'India', coords: '20.8360°N 77.1690°E', ndviChange: -0.12, ndmiDate: 'Dec 15, 2025', ndmiValue: 0.28, ndmiChange: -0.05, reciDate: 'Dec 15, 2025', reciValue: 4.80, reciChange: -0.22, area: '1.2 ha', crop: 'Paddy', variety: 'Basmati', sowingDate: '10 Nov 2025' },
  { id: '4', fieldName: 'Field 9 (Exp)', location: 'India', coords: '20.8370°N 77.1700°E', ndviChange: 0.15, ndmiDate: 'Dec 16, 2025', ndmiValue: 0.55, ndmiChange: 0.12, reciDate: 'Dec 16, 2025', reciValue: 7.10, reciChange: 0.45, area: '0.9 ha', crop: 'Wheat', variety: 'HD-2967', sowingDate: '01 Nov 2025' },
];

const CustomReport = () => {
  // --- STATE ---
  const [data, setData] = useState<FieldData[]>(INITIAL_DATA);
  const [activeColumns, setActiveColumns] = useState<string[]>([
    'field', 'ndvi_change', 'ndmi_date', 'ndmi_val', 'ndmi_change', 'reci_date', 'reci_val', 'reci_change'
  ]);
  
  // Modals & UI States
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters State
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // Temp state for column picker
  const [tempSelectedColumns, setTempSelectedColumns] = useState<string[]>(activeColumns);

  // --- ACTIONS ---

  // 1. Handle Scrolling & Click Outside to close dropdowns
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 2. Download Data as CSV (Direct Download)
  const handleDownloadCSV = () => {
    const headers = activeColumns.map(colId => ALL_COLUMNS.find(c => c.id === colId)?.label || colId);
    
    // Helper to extract value based on column ID
    const getVal = (row: FieldData, colId: string) => {
        if(colId === 'field') return row.fieldName;
        if(colId === 'ndvi_change') return row.ndviChange;
        if(colId === 'ndmi_val') return row.ndmiValue;
        if(colId === 'ndmi_change') return row.ndmiChange;
        if(colId === 'reci_val') return row.reciValue;
        if(colId === 'reci_change') return row.reciChange;
        if(colId.includes('date')) return row[colId === 'ndmi_date' ? 'ndmiDate' : 'reciDate'];
        return row[colId] || '';
    };

    const csvRows = [
      headers.join(','), // Header row
      ...data.map(row => activeColumns.map(col => `"${getVal(row, col)}"`).join(',')) // Data rows
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kvk-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setOpenDropdown(null);
  };

  // 3. Sorting Logic
  const handleSort = (colId: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === colId && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: colId, direction });

    // Mapping colId to data key
    let key = colId;
    if(colId === 'field') key = 'fieldName';
    if(colId === 'ndmi_val') key = 'ndmiValue';
    
    const sorted = [...data].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setData(sorted);
  };

  // 4. Filter Logic (Crop)
  const handleCropFilter = (crop: string) => {
    setSelectedCrop(crop);
    setOpenDropdown(null); // Close dropdown
    
    // Filter Data
    const filtered = INITIAL_DATA.filter(item => item.crop === crop);
    setData(filtered);
  };

  // 5. Clear Filters
  const handleClear = () => {
    setData(INITIAL_DATA);
    setSortConfig(null);
    setSelectedCrop(null);
    setShowFilters(false);
  };

  // --- RENDERERS ---

  const renderCell = (row: FieldData, colId: string) => {
    switch (colId) {
      case 'field':
        return (
          <div>
            <div className="font-bold text-slate-200">{row.fieldName}</div>
            <div className="text-xs text-slate-500">{row.location}</div>
            <div className="text-[10px] text-slate-600 font-mono">{row.coords}</div>
          </div>
        );
      case 'ndvi_change':
      case 'ndmi_change':
      case 'reci_change':
        const val = colId === 'ndvi_change' ? row.ndviChange : colId === 'ndmi_change' ? row.ndmiChange : row.reciChange;
        const color = val < 0 ? 'text-red-500' : 'text-green-500';
        return <span className={color}>{val > 0 ? '+' : ''}{val}</span>;
      case 'ndmi_date':
      case 'reci_date':
        const dateVal = colId === 'ndmi_date' ? row.ndmiDate : row.reciDate;
        return (
          <div className="flex items-center gap-3">
             <div className="w-10 h-8 bg-indigo-900/50 border border-indigo-500/30 rounded overflow-hidden relative shadow-sm group cursor-pointer hover:border-indigo-400">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/40 to-transparent"></div>
                <div className="absolute bottom-0 right-0 text-[6px] bg-slate-800 px-0.5 text-slate-300">S2</div>
             </div>
             <span className="text-blue-400 group-hover:text-blue-300 cursor-pointer">{dateVal}</span>
          </div>
        );
      case 'ndmi_val': return <span>{row.ndmiValue.toFixed(2)}</span>;
      case 'reci_val': return <span>{row.reciValue.toFixed(2)}</span>;
      default: return <span>{row[colId] || row[colId.replace('_', '')] || '--'}</span>;
    }
  };

  return (
    // MAIN CONTAINER
    <div className="w-full min-h-screen h-full bg-[#161b22] text-slate-300 font-sans text-sm flex flex-col relative" ref={wrapperRef}>
      
      {/* 1. HEADER BAR */}
      <div className="flex flex-wrap justify-between items-center px-4 md:px-6 py-4 border-b border-slate-800 bg-[#0d1117] gap-4">
        <div className="flex items-center gap-2">
           <div className="bg-yellow-600/20 p-1.5 rounded text-yellow-500">
             <FileText size={20} />
           </div>
           <h1 className="text-lg font-bold text-white">Custom report</h1>
           <span className="flex items-center text-slate-500 cursor-pointer hover:text-slate-300">
              <HelpCircle size={16} />
           </span>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
            <button 
                onClick={() => setShowSummary(!showSummary)}
                className={`flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-yellow-500 px-4 py-2 rounded-md font-medium transition-colors border ${showSummary ? 'border-yellow-500' : 'border-transparent'}`}
            >
                <span className="text-lg">✦</span> Get summary
            </button>
            
            <button 
                onClick={() => setShowTemplateModal(true)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md flex items-center gap-2 border border-slate-700"
            >
                <Settings size={16} /> Report1
            </button>

            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`bg-slate-800 hover:bg-slate-700 p-2 rounded-md border border-slate-700 text-white ${showFilters ? 'bg-slate-700 ring-2 ring-slate-600' : ''}`}
            >
                <Filter size={18} />
            </button>

            {/* DOWNLOAD BUTTON */}
            <button 
                onClick={handleDownloadCSV}
                className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-md flex items-center gap-2 px-4 border border-blue-500 font-bold"
            >
                <Download size={18} />
                <span className="hidden md:inline">Export CSV</span>
            </button>
        </div>
      </div>

      {/* SUMMARY PANEL */}
      {showSummary && (
        <div className="bg-[#1c2128] border-b border-slate-800 px-6 py-4 animate-in fade-in slide-in-from-top-2">
            <h3 className="text-white font-bold mb-2">✦ AI Summary</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
                Analysis of 4 fields indicates a <strong>positive trend in NDVI (+0.03 avg)</strong> across Wheat varieties. 
                Field 1 shows minor stress signals (-0.01) potentially due to delayed irrigation. 
            </p>
        </div>
      )}

      {/* 2. FILTER BAR */}
      <div className="flex flex-wrap items-center gap-4 px-6 py-3 border-b border-slate-800 bg-[#161b22] relative z-20">
         
         {/* Group Dropdown */}
         <div className="relative">
            <button 
                onClick={() => setOpenDropdown(openDropdown === 'group' ? null : 'group')}
                className="bg-[#0d1117] border border-slate-700 text-slate-400 px-4 py-1.5 rounded min-w-[120px] flex justify-between items-center text-sm hover:text-white"
            >
                Group <ChevronDown size={14} />
            </button>
            {openDropdown === 'group' && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-[#21262d] border border-slate-700 rounded shadow-xl z-[9999]">
                    <div className="p-2 text-xs text-slate-500 border-b border-slate-700/50">Select Group</div>
                    <div className="px-3 py-2 hover:bg-[#30363d] cursor-pointer text-white">Baramati North</div>
                    <div className="px-3 py-2 hover:bg-[#30363d] cursor-pointer text-white">Baramati South</div>
                </div>
            )}
         </div>

         {/* Crop Dropdown (Fixed Z-Index & Styling) */}
         <div className="relative">
            <button 
                onClick={() => setOpenDropdown(openDropdown === 'crop' ? null : 'crop')}
                className={`bg-[#0d1117] border border-slate-700 px-4 py-1.5 rounded min-w-[120px] flex justify-between items-center text-sm hover:text-white ${selectedCrop ? 'text-blue-400 border-blue-900' : 'text-slate-400'}`}
            >
                {selectedCrop || "Crop"} <ChevronDown size={14} />
            </button>
            
            {openDropdown === 'crop' && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-[#21262d] border border-slate-700 rounded shadow-2xl z-[9999]">
                    <div className="p-2 text-xs text-slate-500 border-b border-slate-700/50">Select Crop</div>
                    {['Wheat', 'Mustard', 'Paddy'].map(crop => (
                         <div 
                            key={crop}
                            onClick={() => handleCropFilter(crop)}
                            className={`px-3 py-2 hover:bg-[#30363d] cursor-pointer flex justify-between items-center ${selectedCrop === crop ? 'text-blue-400 bg-blue-900/20' : 'text-white'}`}
                         >
                            {crop}
                            {selectedCrop === crop && <CheckSquare size={14} />}
                         </div>
                    ))}
                </div>
            )}
         </div>

         <button onClick={handleClear} className="text-slate-500 hover:text-slate-300 flex items-center gap-1 text-sm ml-auto md:ml-0">
            <X size={14} /> Clear
         </button>
      </div>

      {/* 3. TABLE AREA */}
      <div className="flex-1 w-full overflow-auto custom-scrollbar bg-[#161b22] relative z-10">
        <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 bg-[#161b22] z-20 shadow-sm">
                <tr className="border-b border-slate-800 text-xs uppercase tracking-wide text-slate-500">
                    {ALL_COLUMNS.filter(col => activeColumns.includes(col.id)).map(col => (
                        <th 
                            key={col.id} 
                            onClick={() => handleSort(col.id)}
                            className="px-6 py-4 font-semibold whitespace-nowrap cursor-pointer hover:text-slate-300 hover:bg-[#1c2128] transition-colors group"
                        >
                            <div className="flex items-center gap-2">
                                {col.label}
                                <ArrowUpDown size={12} className={`opacity-0 group-hover:opacity-100 ${sortConfig?.key === col.id ? 'opacity-100 text-blue-500' : ''}`} />
                                {col.category === 'Satellite' && <Info size={12} className="text-slate-600" />}
                            </div>
                        </th>
                    ))}
                </tr>
                {/* Filter Row */}
                {showFilters && (
                    <tr className="bg-[#1c2128] border-b border-slate-800">
                        {ALL_COLUMNS.filter(col => activeColumns.includes(col.id)).map(col => (
                            <td key={`filter-${col.id}`} className="px-2 py-2">
                                <input 
                                    type="text" 
                                    placeholder="Filter..." 
                                    className="w-full bg-[#0d1117] border border-slate-700 text-white text-xs px-2 py-1 rounded focus:border-blue-500 focus:outline-none"
                                />
                            </td>
                        ))}
                    </tr>
                )}
            </thead>
            <tbody className="divide-y divide-slate-800/50">
                {data.map((row) => (
                    <tr key={row.id} className="hover:bg-[#1c2128] transition-colors group">
                         {ALL_COLUMNS.filter(col => activeColumns.includes(col.id)).map(col => (
                            <td key={col.id} className="px-6 py-4 whitespace-nowrap">
                                {renderCell(row, col.id)}
                            </td>
                         ))}
                    </tr>
                ))}
            </tbody>
        </table>
        {data.length === 0 && (
             <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <p className="mb-2">No data found matching current filters.</p>
                <button onClick={handleClear} className="text-blue-400 hover:underline">Clear Filters</button>
             </div>
        )}
      </div>

      {/* --- MODAL 1: TEMPLATE SELECTOR --- */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#21262d] w-full max-w-lg rounded-lg shadow-2xl border border-slate-700">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-lg font-bold text-white">Templates</h2>
                    <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                </div>
                <div className="p-6">
                    <button 
                        onClick={() => { setShowTemplateModal(false); setShowCreateModal(true); setTempSelectedColumns(activeColumns); }}
                        className="w-full py-3 mb-6 border border-blue-500 text-blue-400 hover:bg-blue-500/10 rounded font-medium flex items-center justify-center gap-2 transition-all"
                    >
                        <Plus size={18} /> Create new template
                    </button>
                    <div className="bg-[#161b22] border border-blue-500 rounded p-3 flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full border-4 border-blue-500 bg-transparent"></div>
                            <span className="text-white font-medium">Report1 (Active)</span>
                        </div>
                        <div className="flex gap-3 text-slate-500">
                            <Mail size={16} className="hover:text-white cursor-pointer" />
                            <Edit2 
                                size={16} 
                                className="hover:text-white cursor-pointer"
                                onClick={() => { setShowTemplateModal(false); setShowCreateModal(true); setTempSelectedColumns(activeColumns); }} 
                            />
                            <Trash2 size={16} className="hover:text-red-400 cursor-pointer" />
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-slate-700">
                    <button onClick={() => setShowTemplateModal(false)} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded transition-colors">
                        CLOSE
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL 2: COLUMN PICKER --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
             <div className="bg-[#21262d] w-full max-w-md rounded-lg shadow-2xl border border-slate-700 flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <div className="text-center w-full">
                        <h2 className="text-lg font-bold text-white">Configure Columns</h2>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="absolute right-4 text-slate-400 hover:text-white"><X size={20}/></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-1">
                        {ALL_COLUMNS.map((col) => {
                             const isSelected = tempSelectedColumns.includes(col.id);
                             return (
                                <div 
                                    key={col.id} 
                                    onClick={() => {
                                        if (isSelected) setTempSelectedColumns(prev => prev.filter(c => c !== col.id));
                                        else setTempSelectedColumns(prev => [...prev, col.id]);
                                    }}
                                    className={`flex justify-between items-center p-3 rounded cursor-pointer border ${isSelected ? 'bg-[#161b22] border-slate-600' : 'bg-transparent border-transparent hover:bg-[#161b22]'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={isSelected ? "text-white" : "text-slate-400"}>{col.label}</span>
                                    </div>
                                    <div className={isSelected ? "text-blue-500" : "text-slate-600"}>
                                        {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                </div>
                <div className="p-4 border-t border-slate-700 flex gap-4">
                    <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-[#21262d] hover:bg-[#30363d] border border-slate-600 text-white font-bold py-3 rounded">CANCEL</button>
                    <button onClick={() => { setActiveColumns(tempSelectedColumns); setShowCreateModal(false); }} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded">APPLY</button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default CustomReport;