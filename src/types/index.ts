export type UserRole = 'energy_analyst' | 'data_manager' | 'planner_admin';
export type UserPermission = 'analyst' | 'data_manager' | 'planner' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  permissions: UserPermission[];
  organization: string;
}

export interface GeographicHierarchy {
  country: string;
  stateProvince: string;
  district: string;
  city: string;
  neighborhood: string;
}

export interface UrbanArea {
  id: string;
  name: string;
  code: string;
  country: string;
  state_province: string;
  district: string;
  city: string;
  category: string;
  climate_zone: string;
  latitude: number;
  longitude: number;
  household_count: number;
  gross_floor_area_sqm: number;
  target_intensity_kwh_sqm: number;
}

export interface AreaSummary extends UrbanArea {
  totalConsumptionKwh: number;
  averageConsumptionKwh: number;
  recordCount: number;
  flaggedCount: number;
  intensityKwhPerSqm: number;
  intensityKwhPerHousehold: number;
  baselineDeviationPercent: number;
  priorityLevel: 'High' | 'Medium' | 'Normal';
  climateComparabilityWarning?: string;
}

export interface AnalyticsOverview {
  totalConsumptionKwh: number;
  averageConsumptionKwh: number;
  medianConsumptionKwh: number;
  minConsumptionKwh: number;
  maxConsumptionKwh: number;
  distinctAreasCount: number;
  totalRecordsCount: number;
  flaggedHighCount: number;
  reportingPeriodStart: string | null;
  reportingPeriodEnd: string | null;
  dataFreshness: string;
  lastDataIngestion: string;
}

export interface TrendPoint {
  date: string;
  totalKwh: number;
  averageKwh: number;
  [areaCode: string]: string | number;
}

export interface FlaggedObservation {
  id: string;
  dataset_id: string;
  area_id: string;
  area_code: string;
  areaName: string;
  areaCategory: string;
  climate_zone?: string;
  observation_date: string;
  consumption_value: number;
  consumption_unit: string;
  is_flagged_high: boolean;
  flag_reason?: string;
  possible_contributing_factors?: string[];
}

export interface WhatIfScenario {
  id: string;
  area_id: string;
  area_name?: string;
  baseline_period: string;
  baseline_kwh: number;
  reduction_percent: number;
  projected_kwh: number;
  saved_kwh: number;
  estimated_cost_savings_usd: number;
  co2_kg_avoided: number;
  notes: string;
  created_at: string;
}

export interface OutcomeRecord {
  id: string;
  action_id: string;
  action_title: string;
  area_id: string;
  area_name: string;
  pre_intervention_period: string;
  pre_intervention_kwh: number;
  post_intervention_period: string;
  post_intervention_kwh: number;
  observed_reduction_kwh: number;
  observed_reduction_percent: number;
  verification_status: 'Verified' | 'Pending Follow-up' | 'Under Review';
  weather_normalized: boolean;
  notes: string;
}

export interface Dataset {
  id: string;
  name: string;
  filename: string;
  uploaded_by: string;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  status: 'completed' | 'processing' | 'failed';
  reporting_period_start: string;
  reporting_period_end: string;
  created_at: string;
}

export interface ImportHistoryItem {
  id: string;
  dataset_id: string;
  user_id?: string;
  file_name: string;
  records_imported: number;
  records_rejected: number;
  processing_duration_ms: number;
  imported_at: string;
}

export interface PlanningMilestone {
  id: string;
  action_id: string;
  title: string;
  due_date: string;
  is_completed: boolean;
  completed_at?: string;
  created_at?: string;
}

export interface PlanningAction {
  id: string;
  area_id: string;
  areaName?: string;
  areaCode?: string;
  created_by?: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Proposed' | 'Planned' | 'In Progress' | 'Completed' | 'On Hold';
  target_date: string;
  progress: number;
  estimated_reduction_kwh: number;
  milestones?: PlanningMilestone[];
  created_at?: string;
  updated_at?: string;
}

export interface AuditLogItem {
  id: string;
  user_id?: string;
  user_email?: string;
  role?: string;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  timestamp: string;
}

export interface DatabaseHealth {
  status: string;
  timestamp: string;
  database: {
    engine: string;
    mode: 'postgresql' | 'file_persisted';
    configuredUrl: string;
    counts: {
      users: number;
      urban_areas: number;
      datasets: number;
      energy_records: number;
      planning_actions: number;
      scenarios: number;
      outcomes: number;
      audit_logs: number;
      import_history: number;
    };
    lastUpdated: string;
  };
  environment: string;
  serverUptime: number;
}

export type PlaceCategory = 
  | 'railway_station' 
  | 'commercial_facility' 
  | 'transit_hub' 
  | 'heritage_terminal' 
  | 'residential_complex'
  | 'neighbourhood'
  | 'district'
  | 'municipality'
  | 'urban_sector';

export interface LandmarkFacility {
  id: string;
  name: string;
  code: string;
  place_type: PlaceCategory;
  country: string;
  state_province: string;
  district: string;
  city: string;
  neighbourhood?: string;
  latitude: number;
  longitude: number;
  description: string;
  operational_context: string;
  has_direct_meter_data: boolean;
  meter_data_note: string;
  solar_irradiance_potential_kwh_sqm_day: number;
  rooftop_potential_kwp?: number;
  installed_solar_kwp?: number;
  grid_emission_factor_kg_kwh: number;
  local_tariff_per_kwh_usd: number;
  currency: string;
  reference_area_id?: string;
  created_at: string;
}

export interface AreaIntelligenceReport {
  location: {
    id: string;
    name: string;
    placeType: string;
    category: string;
    city: string;
    district: string;
    stateProvince: string;
    country: string;
    latitude: number;
    longitude: number;
    coordinatesSource: string;
    boundaryCoverage: string;
    dataSources: string[];
    lastUpdated: string;
    isFacility: boolean;
    operationalContext?: string;
    distinctionNotice?: string;
  };
  scope: 'place' | '1km' | '5km' | 'city';
  scopeRelationshipExplanation: string;
  resourceOverview: {
    electricity: {
      status: 'verified_available' | 'surrounding_only' | 'unavailable';
      message: string;
      totalKwh?: number;
      averageKwh?: number;
      peakMonth?: string;
      peakKwh?: number;
      offPeakMonth?: string;
      offPeakKwh?: number;
      unit: string;
      frequency: string;
      latestDate?: string;
      isEstimated?: boolean;
    };
    solarEnergy: {
      status: 'potential_calculated' | 'installed_verified' | 'unavailable';
      installedCapacityKwp: number;
      rooftopPotentialKwp?: number;
      annualGenerationKwhEstimated?: number;
      dailyIrradianceKwhPerSqm: number;
      feasibilityNotes: string;
      sourceCitation: string;
    };
    naturalGas: {
      status: 'available_grid' | 'unavailable' | 'not_reported';
      pipelineAvailability: boolean;
      notes: string;
    };
    otherFuels: {
      status: 'recorded' | 'none_reported';
      notes: string;
    };
    renewableShare: {
      gridRenewablePercent: number;
      gridEmissionFactorKgPerKwh: number;
      sourceCitation: string;
    };
    energyEfficiency: {
      status: string;
      indicators: { label: string; value: string; benchmark?: string }[];
    };
  };
  consumptionAnalysis: {
    hasData: boolean;
    dataLevel: 'facility_direct' | 'surrounding_area' | 'none';
    explanation: string;
    totalConsumptionKwh?: number;
    averageConsumptionKwh?: number;
    consumptionUnit: string;
    intensityKwhPerSqm?: number;
    intensityKwhPerHousehold?: number;
    householdCount?: number;
    floorAreaSqm?: number;
    trends: { date: string; value: number; label: string; isAnomaly?: boolean }[];
    peakPeriod?: string;
    offPeakPeriod?: string;
    comparisonWithSimilar?: {
      benchmarkCategory: string;
      benchmarkMedianKwh: number;
      deviationPercent: number;
      comparabilityNote: string;
    };
    dataFreshness: {
      latestObservation: string;
      cadence: string;
      verificationLevel: string;
    };
  };
  geographicAnalysis: {
    activeScope: 'place' | '1km' | '5km' | 'city';
    radiusKm: number;
    placeSpecificSummary: string;
    surrounding1KmSummary: string;
    surrounding5KmSummary: string;
    cityMunicipalSummary: string;
    comparativeContext: string;
  };
  anomaliesAndPatterns: {
    anomaliesFound: boolean;
    items: {
      id: string;
      title: string;
      period: string;
      observedKwh: number;
      expectedKwh: number;
      deviationPercent: number;
      classification: 'High Seasonal Cooling' | 'Operational Peak' | 'Baseline Exceedance' | 'Normal Variation';
      explainableFactors: string[];
      operationalContextNote: string;
    }[];
    methodologyNote: string;
  };
  evidenceLinkedRecommendations: {
    id: string;
    category: 'Facility Operations' | 'Renewables' | 'HVAC & Thermal' | 'Demand Management' | 'Data Acquisition';
    title: string;
    targetScope: 'Selected Place' | 'Surrounding Neighbourhood' | 'City Municipal';
    description: string;
    evidenceLink: string;
    suggestedAction: string;
    disclaimer: string;
  }[];
  whatIfScenarioCalculator: {
    baselinePeriod: string;
    baselineKwh: number;
    localTariffRatePerKwhUsd: number;
    gridEmissionFactorKgPerKwh: number;
    currency: string;
    defaultTargetPercent: number;
    disclaimer: string;
  };
}

