
export interface AIModel {
  id: string;
  name: string;
  provider: string; // Keep for internal use, though not explicitly shown in new table column
  description: string;
  enabled: boolean;
  type: 'text' | 'vision';
  contextWindow: string;
  currentRPM: number;
  maxRPM: number;
  currentTPM: number;
  maxTPM: number;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  status: 'active' | 'pending' | 'inactive';
  department: string;
  lastActive: string;
}

export interface UsageMetric {
  date: string;
  tokens: number;
  requests: number;
  activeUsers: number;
}

export interface Plan {
  name: string;
  seats: number;
  price: number;
  features: string[];
}
