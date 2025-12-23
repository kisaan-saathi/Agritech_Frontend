"use client";
import React from 'react';
import { Metric } from "@/types";
import { 
  Users, 
  AlertTriangle, 
  FileText, 
  Radio, 
  Activity, 
  Droplet, 
  Thermometer, 
  ShieldCheck, 
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Microscope,
  BookOpen
} from 'lucide-react';

interface SensorMetricsProps {
    metrics: Metric[];
}

const SensorMetrics: React.FC<SensorMetricsProps> = ({ metrics }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {metrics.map((metric) => (
                <div key={metric.id} className="bg-white rounded-[32px] p-6 shadow-soft border border-slate-100/60 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl ${getBgColor(metric.iconType)} transition-colors duration-300`}>
                            {getIcon(metric.iconType)}
                        </div>
                        {metric.trend && (
                            <div className={`flex items-center text-[10px] font-bold px-2 py-1 rounded-full ${getTrendColor(metric.trend)}`}>
                                {metric.trend === 'up' && <TrendingUp size={12} className="mr-1" />}
                                {metric.trend === 'down' && <TrendingDown size={12} className="mr-1" />}
                                {metric.trend === 'stable' && <Minus size={12} className="mr-1" />}
                                {metric.trend.toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{metric.label}</p>
                        <div className="flex items-baseline space-x-1">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{metric.value}</h3>
                            {metric.unit && <span className="text-xs font-bold text-slate-400">{metric.unit}</span>}
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                            <span className={`text-[11px] font-bold ${metric.statusColor}`}>
                                {metric.statusText}
                            </span>
                            {metric.progress !== undefined && (
                                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                                        style={{ width: `${metric.progress}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const getIcon = (type: Metric['iconType']) => {
    const size = 20;
    const stroke = 2.5;
    switch(type) {
        case 'users': return <Users size={size} strokeWidth={stroke} />;
        case 'alert': return <AlertTriangle size={size} strokeWidth={stroke} />;
        case 'file': return <FileText size={size} strokeWidth={stroke} />;
        case 'broadcast': return <Radio size={size} strokeWidth={stroke} />;
        case 'activity': return <Activity size={size} strokeWidth={stroke} />;
        case 'droplet': return <Droplet size={size} strokeWidth={stroke} />;
        case 'thermometer': return <Thermometer size={size} strokeWidth={stroke} />;
        case 'shield': return <ShieldCheck size={size} strokeWidth={stroke} />;
        case 'target': return <Target size={size} strokeWidth={stroke} />;
        case 'microscope': return <Microscope size={size} strokeWidth={stroke} />;
        case 'book': return <BookOpen size={size} strokeWidth={stroke} />;
        default: return <Activity size={size} strokeWidth={stroke} />;
    }
};

const getBgColor = (type: Metric['iconType']) => {
    switch(type) {
        case 'users': return 'bg-blue-50 text-blue-600 group-hover:bg-blue-100';
        case 'alert': return 'bg-red-50 text-red-600 group-hover:bg-red-100';
        case 'file': return 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100';
        case 'broadcast': return 'bg-purple-50 text-purple-600 group-hover:bg-purple-100';
        case 'activity': return 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100';
        case 'microscope': return 'bg-amber-50 text-amber-600 group-hover:bg-amber-100';
        case 'book': return 'bg-sky-50 text-sky-600 group-hover:bg-sky-100';
        default: return 'bg-slate-50 text-slate-600';
    }
};

const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch(trend) {
        case 'up': return 'bg-emerald-50 text-emerald-600';
        case 'down': return 'bg-red-50 text-red-600';
        case 'stable': return 'bg-slate-50 text-slate-500';
    }
}

export default SensorMetrics;
