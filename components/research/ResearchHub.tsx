"use client";
import React from 'react';
import { Microscope, Beaker, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { ResearchRecord } from '@/types';

interface ResearchHubProps {
  data: ResearchRecord[];
}

const ResearchHub: React.FC<ResearchHubProps> = ({ data }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex justify-between items-end px-4">
        <div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">Scientific Research Hub</h3>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">FLD & OFT Data Repository</p>
        </div>
        <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl hover:scale-105 transition-all">Register New Trial</button>
      </div>
      
      <div className="bg-white rounded-[48px] shadow-soft border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <th className="px-10 py-6">Crop Tech / Variety</th>
              <th className="px-10 py-6">Yield Delta (C vs D)</th>
              <th className="px-10 py-6">C:B Ratio</th>
              <th className="px-10 py-6">Success</th>
              <th className="px-10 py-6">Status</th>
              <th className="px-10 py-6 text-right">Geotag</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((trial) => (
              <tr key={trial.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-10 py-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600"><Beaker size={24} /></div>
                    <div>
                      <p className="font-black text-slate-900">{trial.crop}</p>
                      <p className="text-xs font-bold text-slate-400">{trial.variety} ({trial.type})</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center space-x-3 font-black text-sm text-slate-600">
                    <span className="opacity-40">{trial.controlYield}</span>
                    <ChevronRight size={14} className="text-slate-300" />
                    <span className="text-emerald-600">{trial.demoYield} q/ha</span>
                  </div>
                </td>
                <td className="px-10 py-8 font-black text-slate-900 text-sm">{trial.costBenefitRatio}</td>
                <td className="px-10 py-8">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${trial.improvement > 20 ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    +{trial.improvement}%
                  </span>
                </td>
                <td className="px-10 py-8 text-[10px] font-black uppercase tracking-wider">{trial.status}</td>
                <td className="px-10 py-8 text-right">
                  {trial.geotagged ? <CheckCircle2 size={24} className="text-emerald-500 inline" /> : <XCircle size={24} className="text-slate-200 inline" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResearchHub;
