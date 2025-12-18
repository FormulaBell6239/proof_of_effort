export interface User {
  id: string;
  wallet_address: string;
  username: string;
  email?: string;
  trust_score: number;
  reputation_level: number;
  total_efforts: number;
  verified_efforts: number;
  total_verifications: number;
  verification_accuracy: number;
  created_at: Date;
  updated_at: Date;
  last_active?: Date;
  profile_data?: any;
  is_active: boolean;
}

export interface EffortRecord {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: EffortCategory;
  effort_type: EffortType;
  estimated_hours?: number;
  proof_ipfs_hash?: string;
  proof_files: string[];
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  verification_level: VerificationLevel;
  verification_count: number;
  points_earned: number;
  blockchain_tx_hash?: string;
  status: EffortStatus;
  created_at: Date;
  updated_at: Date;
  verified_at?: Date;
  metadata?: any;
}

export enum EffortCategory {
  VOLUNTEERING = 'volunteering',
  CAREGIVING = 'caregiving',
  WORK = 'work',
  EDUCATION = 'education',
  COMMUNITY_SERVICE = 'community_service',
  SKILL_DEVELOPMENT = 'skill_development',
  ENVIRONMENTAL = 'environmental',
  DISASTER_RELIEF = 'disaster_relief',
  OTHER = 'other'
}

export enum EffortType {
  CONTRIBUTION = 'contribution',
  NEED_VERIFICATION = 'need_verification'
}

export enum VerificationLevel {
  SELF_REPORTED = 'self_reported',      // 10 points
  PEER_VERIFIED = 'peer_verified',       // 50 points
  AUTHORITY_VERIFIED = 'authority_verified', // 100 points
  MULTI_SIG_CONSENSUS = 'multi_sig_consensus' // 200 points
}

export enum EffortStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  DISPUTED = 'disputed'
}

export interface Verification {
  id: string;
  effort_id: string;
  verifier_id: string;
  verification_type: VerificationType;
  status: VerificationStatus;
  confidence_score: number;
  comments?: string;
  proof_review?: any;
  is_fraudulent: boolean;
  fraud_indicators?: string[];
  created_at: Date;
  updated_at: Date;
}

export enum VerificationType {
  PEER_REVIEW = 'peer_review',
  AUTHORITY_ENDORSEMENT = 'authority_endorsement',
  AI_ASSISTED = 'ai_assisted',
  WITNESS_CONFIRMATION = 'witness_confirmation'
}

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NEEDS_MORE_INFO = 'needs_more_info'
}

export interface TrustScore {
  id: string;
  user_id: string;
  total_score: number;
  effort_score: number;
  verification_score: number;
  consistency_score: number;
  longevity_score: number;
  peer_endorsement_score: number;
  fraud_penalty: number;
  last_calculated: Date;
  score_history: ScoreHistoryEntry[];
}

export interface ScoreHistoryEntry {
  timestamp: Date;
  score: number;
  reason: string;
}

export interface FraudDetectionLog {
  id: string;
  user_id?: string;
  effort_id?: string;
  detection_type: FraudDetectionType;
  risk_level: RiskLevel;
  indicators: string[];
  details: any;
  action_taken?: string;
  created_at: Date;
}

export enum FraudDetectionType {
  PATTERN_ANOMALY = 'pattern_anomaly',
  DUPLICATE_SUBMISSION = 'duplicate_submission',
  LOCATION_INCONSISTENCY = 'location_inconsistency',
  TIME_ANOMALY = 'time_anomaly',
  FAKE_PROOF = 'fake_proof',
  COLLUSION = 'collusion'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}
