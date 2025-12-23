export type AlertPriority = 'CRITICAL' | 'MEDIUM' | 'LOW';

export interface Alert {
    id: string;
    title: string;
    description: string;
    priority: AlertPriority;
    type: 'pest' | 'weather' | 'system' | 'outbreak';
    timestamp: string;
}

export interface Metric {
    id: string;
    label: string;
    value: string | number;
    unit?: string;
    statusText: string;
    statusColor: string; 
    progress?: number;
    trend?: 'up' | 'down' | 'stable';
    iconType: 'users' | 'alert' | 'file' | 'broadcast' | 'activity' | 'droplet' | 'thermometer' | 'shield' | 'target' | 'microscope' | 'book' | 'history' | 'map' | 'brain';
}

export interface ResearchRecord {
    id: string;
    type: 'FLD' | 'OFT';
    crop: string;
    variety: string;
    villages: number;
    farmers: number;
    controlYield: number; 
    demoYield: number; 
    improvement: number; 
    status: 'Planned' | 'Ongoing' | 'Completed';
    validation: 'Success' | 'Partial' | 'Failure';
    geotagged: boolean;
    costBenefitRatio: string;
}

export interface TrainingAnalytics {
    id: string;
    topic: string;
    date: string;
    segmentation: {
        women: number;
        youth: number;
        sc_st: number;
        entrepreneurs: number;
    };
    attendance: number;
    knowledgeDelta: number; // percentage increase
}

export interface AdvisoryValidation {
    id: string;
    topic: string;
    sentTo: number;
    adoptionRate: number;
    feedback: string;
    status: 'Needs Refinement' | 'Validated' | 'Experimental';
}

export interface ScientistPerf {
    name: string;
    discipline: string;
    flds: number;
    visits: number;
    adoptionRate: number; 
    score: number; 
    specialization: string;
}

export interface AIInsight {
    title: string;
    summary: string;
    impact: 'High' | 'Medium' | 'Low';
    category: 'Weather' | 'Pest' | 'Yield' | 'Logistics';
}

export type KVKTab = 'strategy' | 'research' | 'extension' | 'outreach' | 'scorecard';
