"use client";
import React, { useState, useEffect } from 'react';
import Header from './Header';
import StrategyView from "./StrategyView";
import ResearchHub from "./ResearchHub";
import { Metric, ResearchRecord, ScientistPerf, AIInsight, KVKTab, AdvisoryValidation, TrainingAnalytics } from '@/types';
import { 
  LayoutGrid, Beaker, GraduationCap, MapPin, Shield, Map, ArrowUpRight, 
  Download, CheckCircle2, UserCheck, Radio, FileText // <--- 1. Added FileText import
} from 'lucide-react';
import { fetchStrategicInsights } from '@/lib/api';

interface KVKDashboardProps {
    onLogout: () => void;
}

const kvkMetrics: Metric[] = [
    { id: 'k1', label: 'Farmer Outreach', value: '142.8k', trend: 'up', statusText: '92% Coverage', statusColor: 'text-emerald-500', iconType: 'users' },
    { id: 'k2', label: 'Scientist Trials', value: '38', trend: 'stable', statusText: 'OFT/FLD Split', statusColor: 'text-indigo-500', iconType: 'microscope' },
    { id: 'k3', label: 'Advisory Validity', value: '88%', trend: 'up', statusText: 'Refined Weekly', statusColor: 'text-emerald-500', iconType: 'shield' },
    { id: 'k4', label: 'Training Reach', value: '12k', trend: 'up', statusText: 'Farmers Certified', statusColor: 'text-blue-500', iconType: 'book' },
];

const mockResearch: ResearchRecord[] = [
    { id: '1', type: 'FLD', crop: 'Paddy', variety: 'PB-1509', villages: 5, farmers: 25, controlYield: 42, demoYield: 51, improvement: 21.4, status: 'Completed', validation: 'Success', geotagged: true, costBenefitRatio: '1:2.4' },
    { id: '2', type: 'OFT', crop: 'Mustard', variety: 'RH-749', villages: 3, farmers: 15, controlYield: 18, demoYield: 22, improvement: 22.2, status: 'Ongoing', validation: 'Partial', geotagged: true, costBenefitRatio: '1:1.8' },
    { id: '3', type: 'FLD', crop: 'Wheat', variety: 'HD-2967', villages: 8, farmers: 40, controlYield: 48, demoYield: 56, improvement: 16.7, status: 'Planned', validation: 'Success', geotagged: false, costBenefitRatio: '1:2.1' },
];

const mockScientists: ScientistPerf[] = [
    { name: 'Dr. Anita Rao', discipline: 'Agronomy', flds: 12, visits: 45, adoptionRate: 72, score: 94, specialization: 'Cereal Systems' },
    { name: 'Dr. S. K. Verma', discipline: 'Plant Protection', flds: 8, visits: 38, adoptionRate: 65, score: 88, specialization: 'IPM Specialist' },
];

const KVKDashboard: React.FC<KVKDashboardProps> = ({ onLogout }) => {
    // Note: You might need to update your KVKTab type definition in @/types to include 'custom'
    const [activeTab, setActiveTab] = useState<KVKTab | 'custom'>('strategy');
    const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'strategy' && aiInsights.length === 0) {
            handleRefreshInsights();
        }
    }, [activeTab]);

    const handleRefreshInsights = async () => {
        setIsLoading(true);
        const insights = await fetchStrategicInsights();
        setAiInsights(insights);
        setIsLoading(false);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'strategy':
                return <StrategyView insights={aiInsights} metrics={kvkMetrics} onRefresh={handleRefreshInsights} isLoading={isLoading} />;
            case 'research':
                return <ResearchHub data={mockResearch} />;
            case 'extension':
                return (
                    <div className="grid lg:grid-cols-3 gap-8 animate-fadeIn">
                        <div className="lg:col-span-2 space-y-8">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Extension Validation Hub</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                {[
                                    { topic: 'IPM Paddy Stem Borer', sent: 14500, adoption: 74, status: 'Validated' },
                                    { topic: 'Wheat Micronutrient Split', sent: 8200, adoption: 42, status: 'Needs Refinement' },
                                ].map((ad, idx) => (
                                    <div key={idx} className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 group">
                                        <div className="flex justify-between items-start mb-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${ad.status === 'Validated' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>{ad.status}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ad.sent.toLocaleString()} Farmers</span>
                                        </div>
                                        <h4 className="text-xl font-bold mb-4">{ad.topic}</h4>
                                        <div className="space-y-4 mb-6">
                                            <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500 uppercase">Adoption Rate</span><span className="font-black text-indigo-600">{ad.adoption}%</span></div>
                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-indigo-600" style={{width: `${ad.adoption}%`}}></div></div>
                                        </div>
                                        <button className="w-full py-3 border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition">Refine Parameters</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl flex flex-col justify-between h-full">
                            <div>
                                <div className="p-4 bg-indigo-500/20 rounded-3xl border border-indigo-500/30 w-fit mb-8"><Radio size={32} /></div>
                                <h3 className="text-2xl font-black tracking-tighter mb-4">Broadcast Feedback</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">Direct IVR loops tracking advisory success on the ground.</p>
                            </div>
                            <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest mt-8 shadow-xl">Open Feedback Log</button>
                        </div>
                    </div>
                );
            case 'outreach':
                return (
                    <div className="grid lg:grid-cols-3 gap-8 animate-fadeIn">
                        <div className="lg:col-span-2 space-y-8">
                             <h3 className="text-3xl font-black text-slate-900 tracking-tight">Scientist Operations</h3>
                             <div className="grid md:grid-cols-2 gap-6">
                                {mockScientists.map((s, idx) => (
                                    <div key={idx} className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100 group">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">{s.name.charAt(4)}</div>
                                                <div><p className="font-black text-slate-900 text-lg">{s.name}</p><p className="text-xs font-bold text-indigo-500">{s.discipline}</p></div>
                                            </div>
                                            <p className="text-2xl font-black text-indigo-600">{s.score}</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-6">
                                            <div className="text-center"><p className="text-[10px] font-black text-slate-400 uppercase">FLDs</p><p className="font-black">{s.flds}</p></div>
                                            <div className="text-center"><p className="text-[10px] font-black text-slate-400 uppercase">Visits</p><p className="font-black">{s.visits}</p></div>
                                            <div className="text-center"><p className="text-[10px] font-black text-slate-400 uppercase">Impact</p><p className="font-black text-emerald-600">{s.adoptionRate}%</p></div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                        <div className="bg-white p-10 rounded-[48px] shadow-soft border border-slate-100 flex flex-col h-full">
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-8">Outreach Heatmap</h3>
                            <div className="flex-1 bg-slate-100 rounded-[32px] relative overflow-hidden flex items-center justify-center mb-8">
                                <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000" className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" />
                                <div className="relative z-10 p-6 bg-white/90 backdrop-blur-md rounded-2xl text-center shadow-xl">
                                    <p className="text-3xl font-black text-indigo-600">82%</p>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Villages Covered</p>
                                </div>
                            </div>
                            <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Full Coverage View</button>
                        </div>
                    </div>
                );
            case 'scorecard':
                return (
                    <div className="max-w-4xl mx-auto bg-white p-16 rounded-[56px] shadow-2xl border border-slate-100 animate-fadeIn" id="icar-export">
                        <div className="flex justify-between items-start border-b-[10px] border-indigo-600 pb-16 mb-16">
                            <div>
                                <h1 className="text-5xl font-black text-slate-900 tracking-tighter">ICAR Impact Scorecard</h1>
                                <p className="text-slate-500 font-black uppercase text-sm tracking-widest mt-2">Annual Review Period 2024-25</p>
                            </div>
                            <img src="https://ui-avatars.com/api/?name=ICAR&background=0369a1&color=fff&rounded=true" className="w-24 h-24 shadow-2xl ring-4 ring-white" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-20">
                            <div className="space-y-12">
                                <section>
                                    <h5 className="text-[12px] font-black text-indigo-600 uppercase tracking-widest mb-8 border-b border-indigo-50 pb-2">Research Impact</h5>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center"><span className="font-bold text-slate-600">Trials Validated</span><span className="font-black text-2xl">38</span></div>
                                        <div className="flex justify-between items-center"><span className="font-bold text-slate-600">FLD Achievement</span><span className="font-black text-2xl text-emerald-600">92%</span></div>
                                    </div>
                                </section>
                                <section>
                                    <h5 className="text-[12px] font-black text-indigo-600 uppercase tracking-widest mb-8 border-b border-indigo-50 pb-2">Extension Reach</h5>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center"><span className="font-bold text-slate-600">Adoption Delta</span><span className="font-black text-2xl text-indigo-600">+14%</span></div>
                                        <div className="flex justify-between items-center"><span className="font-bold text-slate-600">Farmer Interaction</span><span className="font-black text-2xl">142k</span></div>
                                    </div>
                                </section>
                            </div>
                            <div className="bg-slate-50 p-12 rounded-[48px] border border-slate-200 flex flex-col justify-between">
                                <p className="text-sm italic text-slate-600 leading-loose">"Superior performance in Rice-Mustard sequences. Ground-truth validation shows a knowledge retention rate of 78%."</p>
                                <button className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black text-base shadow-2xl flex items-center justify-center space-x-4"><Download size={24} /><span>Download PDF</span></button>
                            </div>
                        </div>
                    </div>
                );
            // 2. Added this Case so the tab actually works
            case 'custom':
                return (
                     <div className="max-w-4xl mx-auto bg-white p-16 rounded-[56px] shadow-2xl border border-slate-100 animate-fadeIn text-center">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-8">
                            <FileText size={40} className="text-indigo-600" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Custom Report Generator</h2>
                        <p className="text-slate-500 mb-8 max-w-lg mx-auto">Select specific metrics, date ranges, and crop cycles to generate a tailored PDF report.</p>
                        <button className="bg-slate-900 text-white px-8 py-4 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-slate-800 transition">
                            Create New Configuration
                        </button>
                     </div>
                );
            default: return null;
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto p-6 lg:p-10 animate-fadeIn space-y-12">
            <Header notificationCount={4} userName="Dr. R.K. Singh" userRole="Programme Coordinator, KVK" onLogout={onLogout} />
            
            <div className="flex flex-wrap items-center bg-white p-2.5 rounded-[36px] shadow-soft border border-slate-100 w-fit">
                <TabButton active={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')} label="Strategic Priority" icon={<LayoutGrid size={20} />} />
                <TabButton active={activeTab === 'research'} onClick={() => setActiveTab('research')} label="Research Hub" icon={<Beaker size={20} />} />
                <TabButton active={activeTab === 'extension'} onClick={() => setActiveTab('extension')} label="Extension Loop" icon={<GraduationCap size={20} />} />
                <TabButton active={activeTab === 'outreach'} onClick={() => setActiveTab('outreach')} label="Outreach Ops" icon={<MapPin size={20} />} />
                <TabButton active={activeTab === 'scorecard'} onClick={() => setActiveTab('scorecard')} label="ICAR Scorecard" icon={<Shield size={20} />} />
                {/* 3. Updated this TabButton with correct FileText icon */}
                <TabButton active={activeTab === 'custom'} onClick={() => setActiveTab('custom')} label="Custom Report" icon={<FileText size={20} />} />
            </div>

            {renderTabContent()}
        </div>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
    <button 
        onClick={onClick}
        className={`flex items-center space-x-3 px-8 py-5 rounded-[28px] font-black text-sm transition-all duration-400 ${active ? 'bg-indigo-600 text-white shadow-2xl translate-y-[-4px]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
    >
        {icon}
        <span className="hidden lg:inline">{label}</span>
    </button>
);

export default KVKDashboard;