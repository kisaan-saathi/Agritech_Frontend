"use client";
import React from 'react';
import { BrainCircuit, Sparkles, ArrowUpRight, Calendar, Lightbulb, Target, History } from 'lucide-react';
import { AIInsight, Metric } from "@/types";
import SensorMetrics from './SensorMetrics';

interface StrategyViewProps {
  insights: AIInsight[];
  metrics: Metric[];
  onRefresh: () => void;
  isLoading: boolean;
}

const StrategyView: React.FC<StrategyViewProps> = ({ insights, metrics, onRefresh, isLoading }) => {
  return (
    // Changed: 'h-screen' forces height, 'overflow-y-auto' enables scroll, 'pb-32' prevents bottom cutoff
    <div className="space-y-10 animate-fadeIn h-screen w-full overflow-y-auto pb-32">
      {/* Action Priorities */}
      <section className="bg-slate-900 rounded-[48px] p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10 grid lg:grid-cols-3 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-2xl border border-indigo-500/30">
              <BrainCircuit size={18} className="animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">KVK Strategic Action</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter leading-tight">Pre-Season Intelligence</h2>
            <p className="text-slate-400 text-lg">Converting district risk alerts into scientific extension workflows.</p>
            <button 
              onClick={onRefresh} 
              disabled={isLoading}
              className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm flex items-center space-x-3 hover:scale-105 transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Synthesizing...' : 'Refresh Strategy'}</span>
              <Sparkles size={18} className="text-indigo-600" />
            </button>
          </div>
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            {insights?.map((insight, idx) => (
              <div key={idx} className="bg-slate-800/50 backdrop-blur-xl p-6 rounded-[32px] border border-slate-700/50 hover:border-indigo-500 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full">{insight.category}</span>
                  <ArrowUpRight size={18} className="text-slate-500" />
                </div>
                <h4 className="text-xl font-bold mb-2">{insight.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{insight.summary}</p>
                <div className="flex space-x-2">
                  <button className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-wider">Plan Demo</button>
                  <button className="flex-1 py-2.5 bg-slate-700 text-white rounded-xl font-black text-[10px] uppercase tracking-wider">Validate Field</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SensorMetrics metrics={metrics} />

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[48px] shadow-soft border border-slate-100">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Calendar size={24} /></div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Kharif '25 Planning</h3>
          </div>
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start space-x-4">
              <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600"><Lightbulb size={20} /></div>
              <div>
                <p className="font-black text-slate-800 mb-1">Crop Contingency: Paddy</p>
                <p className="text-xs text-slate-500 leading-relaxed">Early-maturing varieties suggested for Pindra block due to predicted monsoon delay.</p>
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start space-x-4">
              <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600"><Target size={20} /></div>
              <div>
                <p className="font-black text-slate-800 mb-1">Target Cluster: Arajiline</p>
                <p className="text-xs text-slate-500 leading-relaxed">Focus on direct-seeded rice (DSR) demonstrations to mitigate labor scarcity.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-indigo-600 rounded-[48px] p-10 text-white shadow-2xl flex flex-col justify-between">
          <div>
            <div className="p-4 bg-white/10 rounded-3xl border border-white/20 w-fit mb-8"><History size={32} /></div>
            <h3 className="text-3xl font-black tracking-tighter mb-4">District Memory Repository</h3>
            <p className="text-indigo-100/70 text-sm leading-relaxed">Auto-compiled learnings from previous seasons to prevent extension strategy failure.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-center">
              <p className="text-xs font-bold uppercase opacity-60 mb-1">Pests Avoided</p>
              <p className="text-2xl font-black">14</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/10 text-center">
              <p className="text-xs font-bold uppercase opacity-60 mb-1">Yield Saved</p>
              <p className="text-2xl font-black">+18%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyView;