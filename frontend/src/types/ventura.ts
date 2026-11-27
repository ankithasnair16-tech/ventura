export type TabId = 'home' | 'plan' | 'explore' | 'ask';

export type ImpactLevel = 'High' | 'Medium' | 'Low';

export type DataSource = 'live' | 'cached' | 'sample';

export type CheckInMood = 'fine' | 'throat' | 'tired';

export interface ZoneOption {
  id: string;
  name: string;
  lat?: number;
  lon?: number;
}

export interface AirQualityData {
  zoneId: string;
  zoneName: string;
  aqi: number;
  status: string;
  statusSummary: string;
  level: 'good' | 'moderate' | 'poor' | 'very-poor' | 'severe';
  mainPollutant: string;
  pm25: number;
  no2: number;
  pm10: number;
  updatedAt: string;
  source: DataSource;
  hourlyForecast: Array<{ hour: string; aqi: number }>;
}

export interface OnboardingProfile {
  priority: string;
  household: string;
  routine: string;
  completed: boolean;
}

export type PlanSectionKey = 'sustainable' | 'routines' | 'indoor' | 'impact';

export interface PlanRecommendation {
  id: string;
  section: Exclude<PlanSectionKey, 'impact'>;
  title: string;
  explanation: string;
  benefit: string;
  impact: ImpactLevel;
  howTo: string;
  estimatedMinutes?: string;
}

export interface ExploreCard {
  id: string;
  category: 'sustainable' | 'routines' | 'indoor';
  kicker: string;
  title: string;
  summary: string;
  benefit: string;
  impact: ImpactLevel;
  steps: string[];
  swapFrom?: string;
  swapTo?: string;
  seasonTag?: 'winter-smog' | 'cold-snap' | 'dry-dust' | 'traffic-haze';
}

export interface SustainableAssistantCard {
  title: string;
  explanation: string;
  benefit: string;
  impact: ImpactLevel;
  category: string;
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
  cards?: SustainableAssistantCard[];
  error?: boolean;
}
