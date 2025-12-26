"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Settings, Filter, Download, Plus, X, ChevronDown, 
  Trash2, Edit2, Mail, CheckSquare, Square, 
  ArrowUpDown, Info, FileText, Sprout, Tractor, Droplets, Printer
} from 'lucide-react';

// --- Types ---
interface FieldData {
  id: string;
  fieldName: string;
  group: string;
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
  [key: string]: any; 
}

interface ColumnDef {
  id: string;
  label: string;
  category: 'General' | 'Satellite' | 'Weather';
}

interface Template {
  id: string;
  name: string;
  columns: string[];
}

// --- MOCK DATA ---
const ALL_COLUMNS: ColumnDef[] = [
  { id: 'field', label: 'Field Name', category: 'General' },
  { id: 'group', label: 'Group', category: 'General' },
  { id: 'crop', label: 'Crop', category: 'General' },
  { id: 'variety', label: 'Variety', category: 'General' },
  { id: 'area', label: 'Area', category: 'General' },
  { id: 'sowing', label: 'Sowing Date', category: 'General' },
  { id: 'ndvi_change', label: 'NDVI Change', category: 'Satellite' },
  { id: 'ndmi_date', label: 'NDMI Date', category: 'Satellite' },
  { id: 'ndmi_val', label: 'NDMI Value', category: 'Satellite' },
  { id: 'ndmi_change', label: 'NDMI Change', category: 'Satellite' },
  { id: 'reci_date', label: 'RECI Date', category: 'Satellite' },
  { id: 'reci_val', label: 'RECI Value', category: 'Satellite' },
  { id: 'reci_change', label: 'RECI Change', category: 'Satellite' },
];

const INITIAL_DATA: FieldData[] = [
  { id: '1', fieldName: 'Plot A-12', group: 'Baramati North', location: 'Maharastra', coords: '20.8346°N', ndviChange: -0.01, ndmiDate: 'Dec 16, 2025', ndmiValue: 0.32, ndmiChange: 0.02, reciDate: 'Dec 16, 2025', reciValue: 5.30, reciChange: -0.54, area: '1.8 ha', crop: 'Wheat', variety: 'Lokwan', sowingDate: '15 Nov 2025' },
  { id: '2', fieldName: 'Plot B-04', group: 'Baramati North', location: 'Maharastra', coords: '20.8350°N', ndviChange: 0.05, ndmiDate: 'Dec 16, 2025', ndmiValue: 0.41, ndmiChange: 0.08, reciDate: 'Dec 16, 2025', reciValue: 6.12, reciChange: 0.15, area: '2.4 ha', crop: 'Mustard', variety: 'Pusa Bold', sowingDate: '20 Oct 2025' },
  { id: '3', fieldName: 'Plot C-09', group: 'Baramati South', location: 'Maharastra', coords: '20.8360°N', ndviChange: -0.12, ndmiDate: 'Dec 15, 2025', ndmiValue: 0.28, ndmiChange: -0.05, reciDate: 'Dec 15, 2025', reciValue: 4.80, reciChange: -0.22, area: '1.2 ha', crop: 'Paddy', variety: 'Basmati', sowingDate: '10 Nov 2025' },
  { id: '4', fieldName: 'Exp-Zone', group: 'Baramati South', location: 'Maharastra', coords: '20.8370°N', ndviChange: 0.15, ndmiDate: 'Dec 16, 2025', ndmiValue: 0.55, ndmiChange: 0.12, reciDate: 'Dec 16, 2025', reciValue: 7.10, reciChange: 0.45, area: '0.9 ha', crop: 'Wheat', variety: 'HD-2967', sowingDate: '01 Nov 2025' },
  { id: '5', fieldName: 'Plot D-22', group: 'Baramati North', location: 'Maharastra', coords: '20.8388°N', ndviChange: 0.02, ndmiDate: 'Dec 17, 2025', ndmiValue: 0.44, ndmiChange: 0.01, reciDate: 'Dec 17, 2025', reciValue: 5.90, reciChange: 0.10, area: '3.1 ha', crop: 'Sugarcane', variety: 'Co-86032', sowingDate: '12 Dec 2024' },
];

const INITIAL_TEMPLATES: Template[] = [
  { id: 't1', name: 'Standard Satellite', columns: ['field', 'ndvi_change', 'ndmi_val', 'reci_val'] },
  { id: 't2', name: 'Agronomy Report', columns: ['field', 'crop', 'variety', 'sowing', 'area'] }
];

const AgriReport: React.FC = () => {
  // --- STATE ---
  const [activeColumns, setActiveColumns] = useState<string[]>([
    'field', 'crop', 'ndvi_change', 'ndmi_val', 'ndmi_change', 'reci_val'
  ]);
  
  // UI States
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showFilters, setShowFilters] = useState(false); 
  const [showExportMenu, setShowExportMenu] = useState(false); // New export menu state
  
  // Filters
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});

  // Templates
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [activeTemplateId, setActiveTemplateId] = useState<string>('t1');

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [tempSelectedColumns, setTempSelectedColumns] = useState<string[]>(activeColumns);

  // --- ACTIONS ---

  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. DYNAMIC DATA PROCESSING
  const processedData = useMemo(() => {
    let result = [...INITIAL_DATA];

    if (selectedCrop) result = result.filter(item => item.crop === selectedCrop);
    if (selectedGroup) result = result.filter(item => item.group === selectedGroup);

    Object.keys(columnSearch).forEach(key => {
        const searchTerm = columnSearch[key].toLowerCase();
        if (searchTerm) {
            result = result.filter(row => {
                let val: any = '';
                if(key === 'field') val = row.fieldName;
                else if(key === 'ndvi_change') val = row.ndviChange;
                else if(key === 'ndmi_val') val = row.ndmiValue;
                else if(key === 'reci_val') val = row.reciValue;
                else val = row[key];
                return String(val).toLowerCase().includes(searchTerm);
            });
        }
    });

    if (sortConfig) {
        result.sort((a, b) => {
            let valA: any = a[sortConfig.key === 'field' ? 'fieldName' : sortConfig.key] || a[sortConfig.key];
            let valB: any = b[sortConfig.key === 'field' ? 'fieldName' : sortConfig.key] || b[sortConfig.key];

            if(sortConfig.key.includes('val') || sortConfig.key.includes('Change')) {
                 if(sortConfig.key === 'ndmi_val') { valA = a.ndmiValue; valB = b.ndmiValue; }
                 else if(sortConfig.key === 'reci_val') { valA = a.reciValue; valB = b.reciValue; }
                 else if(sortConfig.key === 'ndvi_change') { valA = a.ndviChange; valB = b.ndviChange; }
            }

            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    return result;
  }, [selectedCrop, selectedGroup, columnSearch, sortConfig]);

  // 2. EXPORT LOGIC
  const handleDownloadCSV = () => {
    const headers = activeColumns.map(colId => ALL_COLUMNS.find(c => c.id === colId)?.label || colId);
    
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
      headers.join(','), 
      ...processedData.map(row => activeColumns.map(col => `"${getVal(row, col)}"`).join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Agri-Report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    setShowExportMenu(false);
    // Use window.print(). The CSS @media print (using Tailwind 'print:' prefix) handles the layout.
    // Modern browsers allow "Save as PDF" from the print dialog.
    window.print();
  };

  // 3. Sorting
  const handleSort = (colId: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === colId && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: colId, direction });
  };

  // 4. Template Logic
  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const applyTemplate = (t: Template) => {
    setActiveColumns(t.columns);
    setActiveTemplateId(t.id);
    setShowTemplateModal(false);
  };

  const handleClear = () => {
    setSortConfig(null);
    setSelectedCrop(null);
    setSelectedGroup(null);
    setColumnSearch({});
    setShowFilters(false);
  };

  // --- RENDERERS ---

  const renderCell = (row: FieldData, colId: string) => {
    switch (colId) {
      case 'field':
        return (
          <div className="flex items-center gap-3">
             <div className="bg-emerald-100 p-1.5 rounded text-emerald-700">
                <Sprout size={16} />
             </div>
             <div>
                <div className="font-bold text-slate-800">{row.fieldName}</div>
                <div className="text-xs text-slate-500">{row.group}</div>
             </div>
          </div>
        );
      case 'crop':
        return (
            <div className="flex items-center gap-2 text-slate-700 font-medium">
                <span className={`w-2 h-2 rounded-full ${row.crop === 'Wheat' ? 'bg-yellow-500' : row.crop === 'Paddy' ? 'bg-emerald-500' : 'bg-orange-500'}`}></span>
                {row.crop}
            </div>
        );
      case 'ndvi_change':
      case 'ndmi_change':
      case 'reci_change':
        const val = colId === 'ndvi_change' ? row.ndviChange : colId === 'ndmi_change' ? row.ndmiChange : row.reciChange;
        const isPositive = val > 0;
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${isPositive ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                {isPositive ? '+' : ''}{val}
            </span>
        );
      case 'ndmi_date':
      case 'reci_date':
        const dateVal = colId === 'ndmi_date' ? row.ndmiDate : row.reciDate;
        return (
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-slate-500">
                <span className="text-[10px] font-bold">SAT</span>
             </div>
             <span className="text-slate-600 text-xs font-medium">{dateVal}</span>
          </div>
        );
      case 'ndmi_val': return <span className="font-mono font-semibold text-slate-700">{row.ndmiValue.toFixed(2)}</span>;
      case 'reci_val': return <span className="font-mono font-semibold text-slate-700">{row.reciValue.toFixed(2)}</span>;
      default: return <span className="text-slate-600">{row[colId] || row[colId.replace('_', '')] || '--'}</span>;
    }
  };

  return (
    // MAIN CONTAINER - Theme: Standard Agriculture (Light & Clean)
    <div className="w-full min-h-screen h-full bg-slate-50 text-slate-800 font-sans text-sm flex flex-col relative print:bg-white" ref={wrapperRef}>
      
      {/* 1. HEADER BAR */}
      <div className="flex flex-wrap justify-between items-center px-6 py-4 border-b border-emerald-200 bg-white shadow-sm gap-4 print:border-none print:shadow-none print:px-0">
        <div className="flex items-center gap-3">
           <div className="bg-emerald-600 p-2 rounded-lg text-white shadow-md shadow-emerald-200">
             <Tractor size={20} />
           </div>
           <div>
               <h1 className="text-xl font-bold text-slate-800 tracking-tight">KVK Custom-Report</h1>
               <div className="text-[11px] text-emerald-600 uppercase tracking-wider font-bold">Farm Monitoring Dashboard</div>
           </div>
        </div>

        {/* CONTROLS - Hidden when printing */}
        <div className="flex items-center gap-2 md:gap-3 print:hidden">
            <button 
                onClick={() => setShowSummary(!showSummary)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors border ${showSummary ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
                <span className="text-lg text-emerald-500">✦</span> Summary
            </button>
            
            <button 
                onClick={() => setShowTemplateModal(true)}
                className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md flex items-center gap-2 border border-slate-200 shadow-sm"
            >
                <Settings size={16} /> Templates
            </button>

            <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-md border transition-all shadow-sm ${showFilters ? 'bg-emerald-100 border-emerald-400 text-emerald-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                title="Toggle Column Filters"
            >
                <Filter size={18} />
            </button>

            {/* EXPORT DROPDOWN (PDF/PRINT/CSV) */}
            <div className="relative">
                <button 
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md flex items-center gap-2 font-semibold shadow-md shadow-emerald-200 transition-all active:scale-95"
                >
                    <Download size={18} />
                    <span className="hidden md:inline">Export</span>
                    <ChevronDown size={14} />
                </button>
                
                {showExportMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1">
                        <button 
                            onClick={handleDownloadCSV}
                            className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100"
                        >
                            <FileText size={16} className="text-emerald-600"/> Download CSV
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="w-full text-left px-4 py-3 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                            <Printer size={16} className="text-emerald-600"/> Print / Save PDF
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* SUMMARY PANEL */}
      {showSummary && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 animate-in fade-in slide-in-from-top-2 print:hidden">
            <h3 className="text-emerald-800 font-bold mb-2 flex items-center gap-2"><Droplets size={16}/> Irrigation Insights</h3>
            <p className="text-emerald-900 text-sm leading-relaxed max-w-4xl">
                Current analysis of <strong>{processedData.length} plots</strong> shows optimal RECI values in {selectedCrop || 'all crops'}. 
                Moisture index (NDMI) suggests irrigation required for <strong>Plot A-12</strong> within 48 hours.
            </p>
        </div>
      )}

      {/* 2. FILTER BAR - Hidden on Print */}
      <div className="flex flex-wrap items-center gap-4 px-6 py-3 border-b border-slate-200 bg-white sticky top-0 z-20 print:hidden">
         
         {/* Group Dropdown */}
         <div className="relative">
            <button 
                onClick={() => setOpenDropdown(openDropdown === 'group' ? null : 'group')}
                className={`bg-white border px-4 py-1.5 rounded min-w-[140px] flex justify-between items-center text-sm hover:border-emerald-400 transition-colors shadow-sm ${selectedGroup ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-slate-300 text-slate-600'}`}
            >
                {selectedGroup || "All Groups"} <ChevronDown size={14} />
            </button>
            {openDropdown === 'group' && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded shadow-xl z-[9999]">
                    <div className="p-2 text-xs text-slate-400 font-bold border-b border-slate-100">Select Zone</div>
                    {['Baramati North', 'Baramati South'].map(g => (
                         <div 
                            key={g} 
                            onClick={() => { setSelectedGroup(g); setOpenDropdown(null); }}
                            className={`px-3 py-2 hover:bg-slate-50 cursor-pointer text-slate-700 flex justify-between ${selectedGroup === g ? 'text-emerald-600 font-medium bg-emerald-50' : ''}`}
                         >
                            {g}
                            {selectedGroup === g && <CheckSquare size={14}/>}
                         </div>
                    ))}
                </div>
            )}
         </div>

         {/* Crop Dropdown */}
         <div className="relative">
            <button 
                onClick={() => setOpenDropdown(openDropdown === 'crop' ? null : 'crop')}
                className={`bg-white border px-4 py-1.5 rounded min-w-[140px] flex justify-between items-center text-sm hover:border-emerald-400 transition-colors shadow-sm ${selectedCrop ? 'border-emerald-500 text-emerald-700 bg-emerald-50' : 'border-slate-300 text-slate-600'}`}
            >
                {selectedCrop || "All Crops"} <ChevronDown size={14} />
            </button>
            
            {openDropdown === 'crop' && (
                <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded shadow-xl z-[9999]">
                    <div className="p-2 text-xs text-slate-400 font-bold border-b border-slate-100">Select Crop</div>
                    {['Wheat', 'Mustard', 'Paddy', 'Sugarcane'].map(crop => (
                         <div 
                            key={crop}
                            onClick={() => { setSelectedCrop(crop); setOpenDropdown(null); }}
                            className={`px-3 py-2 hover:bg-slate-50 cursor-pointer flex justify-between items-center ${selectedCrop === crop ? 'text-emerald-600 font-medium bg-emerald-50' : 'text-slate-700'}`}
                         >
                            {crop}
                            {selectedCrop === crop && <CheckSquare size={14} />}
                         </div>
                    ))}
                </div>
            )}
         </div>

         <button onClick={handleClear} className="text-slate-500 hover:text-red-500 flex items-center gap-1 text-sm ml-auto md:ml-0 transition-colors font-medium">
            <X size={14} /> Clear
         </button>
      </div>

      {/* 3. TABLE AREA */}
      <div className="flex-1 w-full overflow-auto custom-scrollbar bg-slate-50 relative z-10 print:overflow-visible print:bg-white">
        <table className="w-full text-left border-collapse min-w-[900px] print:min-w-0">
            <thead className="sticky top-0 bg-emerald-50 z-20 shadow-sm print:static print:bg-white print:border-b-2 print:border-slate-800">
                <tr className="border-b border-emerald-200 text-xs uppercase tracking-wide text-emerald-800 font-bold">
                    {ALL_COLUMNS.filter(col => activeColumns.includes(col.id)).map(col => (
                        <th 
                            key={col.id} 
                            onClick={() => handleSort(col.id)}
                            className="px-6 py-4 whitespace-nowrap cursor-pointer hover:bg-emerald-100/50 transition-colors group print:px-2 print:py-2 print:text-black"
                        >
                            <div className="flex items-center gap-2">
                                {col.label}
                                <ArrowUpDown size={12} className={`opacity-0 group-hover:opacity-100 text-emerald-500 ${sortConfig?.key === col.id ? 'opacity-100' : ''}`} />
                            </div>
                        </th>
                    ))}
                </tr>
                {/* IN-TABLE FILTER ROW (Hidden on Print) */}
                {showFilters && (
                    <tr className="bg-white border-b border-slate-200 print:hidden">
                        {ALL_COLUMNS.filter(col => activeColumns.includes(col.id)).map(col => (
                            <td key={`filter-${col.id}`} className="px-2 py-2 bg-slate-50">
                                <input 
                                    type="text" 
                                    placeholder={`Find...`}
                                    value={columnSearch[col.id] || ''}
                                    onChange={(e) => setColumnSearch({...columnSearch, [col.id]: e.target.value})}
                                    className="w-full bg-white border border-slate-300 text-slate-800 text-xs px-2 py-1.5 rounded focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                            </td>
                        ))}
                    </tr>
                )}
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
                {processedData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors group print:hover:bg-transparent">
                         {ALL_COLUMNS.filter(col => activeColumns.includes(col.id)).map(col => (
                            <td key={col.id} className="px-6 py-3 whitespace-nowrap print:px-2 print:py-2 print:text-xs">
                                {renderCell(row, col.id)}
                            </td>
                         ))}
                    </tr>
                ))}
            </tbody>
        </table>
        {processedData.length === 0 && (
             <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <Sprout size={48} className="mb-4 text-emerald-200" />
                <p className="mb-2 font-medium">No agricultural data matches your filters.</p>
                <button onClick={handleClear} className="text-emerald-600 hover:underline font-bold">Reset Dashboard</button>
             </div>
        )}
      </div>

      {/* --- MODAL 1: TEMPLATE SELECTOR (Hidden on Print) --- */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:hidden">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200">
                <div className="flex justify-between items-center p-5 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText size={20} className="text-emerald-600"/> Saved Reports
                    </h2>
                    <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-800"><X size={20}/></button>
                </div>
                <div className="p-6">
                    <button 
                        onClick={() => { setShowTemplateModal(false); setShowCreateModal(true); setTempSelectedColumns(activeColumns); }}
                        className="w-full py-3 mb-6 border-2 border-dashed border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-400 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                    >
                        <Plus size={18} /> Design New Template
                    </button>
                    
                    <div className="space-y-3">
                        {templates.map(t => (
                             <div key={t.id} className={`border rounded-lg p-3 flex justify-between items-center transition-all ${activeTemplateId === t.id ? 'bg-emerald-50 border-emerald-400 shadow-sm' : 'bg-white border-slate-200 hover:border-emerald-300'}`}>
                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => applyTemplate(t)}>
                                    <div className={`w-4 h-4 rounded-full border-4 ${activeTemplateId === t.id ? 'border-emerald-500' : 'border-slate-300'} bg-transparent`}></div>
                                    <span className={activeTemplateId === t.id ? "text-emerald-900 font-bold" : "text-slate-600"}>{t.name}</span>
                                </div>
                                <div className="flex gap-3 text-slate-400">
                                    <Edit2 
                                        size={16} 
                                        className="hover:text-blue-500 cursor-pointer"
                                        onClick={() => { 
                                            setShowTemplateModal(false); 
                                            setShowCreateModal(true); 
                                            setTempSelectedColumns(t.columns); 
                                        }} 
                                    />
                                    <Trash2 size={16} className="hover:text-red-500 cursor-pointer" onClick={() => deleteTemplate(t.id)} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                    <button onClick={() => setShowTemplateModal(false)} className="w-full bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-lg transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL 2: COLUMN PICKER (Hidden on Print) --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 print:hidden">
             <div className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center p-5 border-b border-slate-100">
                    <div className="text-center w-full">
                        <h2 className="text-lg font-bold text-slate-800">Customize Columns</h2>
                    </div>
                    <button onClick={() => setShowCreateModal(false)} className="absolute right-4 text-slate-400 hover:text-slate-800"><X size={20}/></button>
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
                                    className={`flex justify-between items-center p-3 rounded-lg cursor-pointer border transition-all ${isSelected ? 'bg-emerald-50 border-emerald-400' : 'bg-transparent border-transparent hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={isSelected ? "text-emerald-800 font-bold" : "text-slate-600"}>{col.label}</span>
                                    </div>
                                    <div className={isSelected ? "text-emerald-600" : "text-slate-300"}>
                                        {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                    </div>
                                </div>
                             );
                        })}
                    </div>
                </div>
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-4 rounded-b-xl">
                    <button onClick={() => setShowCreateModal(false)} className="flex-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 font-bold py-3 rounded-lg">Cancel</button>
                    <button onClick={() => { setActiveColumns(tempSelectedColumns); setShowCreateModal(false); }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow-md shadow-emerald-200">
                        Apply
                    </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default AgriReport;