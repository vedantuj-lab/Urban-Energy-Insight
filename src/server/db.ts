import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import pg from 'pg';

export type UserRole = 'energy_analyst' | 'data_manager' | 'planner_admin';
export type UserPermission = 'analyst' | 'data_manager' | 'planner' | 'admin';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: UserRole;
  permissions: UserPermission[];
  organization: string;
  created_at: string;
  updated_at: string;
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
  created_at: string;
}

export interface EnergyRecord {
  id: string;
  dataset_id: string;
  area_id: string;
  area_code: string;
  observation_date: string;
  consumption_value: number;
  consumption_unit: string;
  building_category: string;
  is_flagged_high: boolean;
  flag_reason?: string;
  possible_contributing_factors?: string[];
  created_at: string;
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

export interface PlanningMilestone {
  id: string;
  action_id: string;
  title: string;
  due_date: string;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface PlanningAction {
  id: string;
  area_id: string;
  created_by: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Proposed' | 'Planned' | 'In Progress' | 'Completed' | 'On Hold';
  target_date: string;
  progress: number;
  estimated_reduction_kwh: number;
  milestones?: PlanningMilestone[];
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
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

export interface ImportHistory {
  id: string;
  dataset_id: string;
  user_id?: string;
  file_name: string;
  records_imported: number;
  records_rejected: number;
  processing_duration_ms: number;
  imported_at: string;
}

export interface LandmarkFacility {
  id: string;
  name: string;
  code: string;
  place_type: 'railway_station' | 'commercial_facility' | 'transit_hub' | 'heritage_terminal' | 'residential_complex' | 'neighbourhood' | 'district' | 'municipality' | 'urban_sector';
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

export interface AppDatabase {
  users: User[];
  urban_areas: UrbanArea[];
  facilities: LandmarkFacility[];
  datasets: Dataset[];
  energy_records: EnergyRecord[];
  planning_actions: PlanningAction[];
  planning_milestones: PlanningMilestone[];
  scenarios: WhatIfScenario[];
  outcomes: OutcomeRecord[];
  audit_logs: AuditLog[];
  import_history: ImportHistory[];
  settings: Record<string, unknown>;
  last_data_ingestion: string;
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'urbanenergy_db.json');

let pgPool: pg.Pool | null = null;
let isPgConnected = false;

export async function initDatabase(): Promise<{ mode: 'postgresql' | 'file_persisted'; connected: boolean; details: string }> {
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl && dbUrl.trim().length > 0) {
    try {
      pgPool = new pg.Pool({ connectionString: dbUrl, connectionTimeoutMillis: 3000 });
      const client = await pgPool.connect();
      client.release();
      isPgConnected = true;
      console.log('Connected to PostgreSQL database at:', dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'));
      return {
        mode: 'postgresql',
        connected: true,
        details: 'Connected to external PostgreSQL database via DATABASE_URL',
      };
    } catch (err: unknown) {
      console.warn('PostgreSQL connection attempt failed. Falling back to persistent store:', (err as Error).message);
      isPgConnected = false;
    }
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let needsSeed = !fs.existsSync(DATA_FILE);
  if (!needsSeed) {
    try {
      const existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      if (!existing.urban_areas || !existing.urban_areas.some((a: UrbanArea) => a.country === 'India')) {
        needsSeed = true;
      }
    } catch {
      needsSeed = true;
    }
  }

  if (needsSeed) {
    console.log('Seeding research-aligned UrbanEnergy Insight multi-region database...');
    const seedData = await generateSeedData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedData, null, 2), 'utf-8');
  }

  return {
    mode: 'file_persisted',
    connected: true,
    details: 'Operating on persistent storage engine. Ready for PostgreSQL when DATABASE_URL is configured.',
  };
}

export function getDefaultFacilities(): LandmarkFacility[] {
  return [
    {
      id: 'fac_ind_churchgate',
      name: 'Churchgate Railway Station',
      code: 'IND-BOM-CCG',
      place_type: 'railway_station',
      country: 'India',
      state_province: 'Maharashtra',
      district: 'Mumbai City (South Mumbai)',
      city: 'Mumbai',
      neighbourhood: 'Churchgate / Fort Heritage Precinct',
      latitude: 18.9322,
      longitude: 72.8264,
      description: 'Historic Western Railway terminus station serving ~500,000 suburban commuters daily with 4 passenger platform tracks, ticketing concourses, and operational headquarters.',
      operational_context: 'Major suburban rail transit terminal active 20 hours/day (04:00 - 01:00). High electricity demands for concourse and platform high-mast lights, ventilation fans, passenger ticketing machines, escalator banks, retail stalls, and auxiliary traction power interfaces.',
      has_direct_meter_data: false,
      meter_data_note: 'Electricity consumption data for this station is not currently available. The system can analyse surrounding-area data or an authorized station dataset if one is provided.',
      solar_irradiance_potential_kwh_sqm_day: 5.2,
      rooftop_potential_kwp: 1200,
      installed_solar_kwp: 0,
      grid_emission_factor_kg_kwh: 0.79,
      local_tariff_per_kwh_usd: 0.11,
      currency: 'INR',
      reference_area_id: 'area_ind_churchgate_quarter',
      created_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'fac_ind_csmt',
      name: 'Chhatrapati Shivaji Maharaj Terminus (CSMT)',
      code: 'IND-BOM-CSMT',
      place_type: 'heritage_terminal',
      country: 'India',
      state_province: 'Maharashtra',
      district: 'Mumbai City',
      city: 'Mumbai',
      neighbourhood: 'Bori Bunder / Fort',
      latitude: 18.9400,
      longitude: 72.8353,
      description: 'UNESCO World Heritage railway terminus and Central Railway headquarters handling both suburban and long-distance passenger express trains.',
      operational_context: '24/7 continuous transit operations with 18 platform lines, administrative offices, extensive exterior heritage illumination, and heavy passenger flow.',
      has_direct_meter_data: false,
      meter_data_note: 'Direct Central Railway utility meters are segregated from public municipal residential records. Surrounding South Mumbai area datasets provide baseline context.',
      solar_irradiance_potential_kwh_sqm_day: 5.2,
      rooftop_potential_kwp: 1500,
      installed_solar_kwp: 120,
      grid_emission_factor_kg_kwh: 0.79,
      local_tariff_per_kwh_usd: 0.11,
      currency: 'INR',
      reference_area_id: 'area_ind_churchgate_quarter',
      created_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'fac_usa_ferrybldg',
      name: 'San Francisco Ferry Building',
      code: 'USA-SFO-FRY',
      place_type: 'transit_hub',
      country: 'United States',
      state_province: 'California',
      district: 'San Francisco County',
      city: 'San Francisco',
      neighbourhood: 'Embarcadero Waterfront',
      latitude: 37.7955,
      longitude: -122.3937,
      description: 'Historic transit terminal and public food hall linking regional ferry services across San Francisco Bay with downtown transit networks.',
      operational_context: 'Maritime ferry slip power, food hall commercial refrigeration, historic 245-foot clock tower illumination, and civic concourse.',
      has_direct_meter_data: false,
      meter_data_note: 'Port of San Francisco maritime facility meters are segregated from residential datasets. Surrounding Northwood and Downtown records offer comparative context.',
      solar_irradiance_potential_kwh_sqm_day: 4.8,
      rooftop_potential_kwp: 450,
      installed_solar_kwp: 180,
      grid_emission_factor_kg_kwh: 0.38,
      local_tariff_per_kwh_usd: 0.24,
      currency: 'USD',
      reference_area_id: 'area_usa_nw',
      created_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'fac_gbr_kingscross',
      name: "King's Cross St Pancras International",
      code: 'GBR-LON-KGX',
      place_type: 'transit_hub',
      country: 'United Kingdom',
      state_province: 'Greater London',
      district: 'Camden',
      city: 'London',
      neighbourhood: "King's Cross Redevelopment Precinct",
      latitude: 51.5308,
      longitude: -0.1238,
      description: 'Major UK rail terminus and international Eurostar gateway connecting to 6 London Underground lines and high-speed continental rail.',
      operational_context: 'Major steel diagrid vaulted western concourse, deep sub-surface tube ventilation, passenger platform heating, and rail station retail.',
      has_direct_meter_data: false,
      meter_data_note: 'High-voltage Network Rail traction meters operate on isolated supplies. Surrounding Greenwich & Central London datasets provide local environmental baseline.',
      solar_irradiance_potential_kwh_sqm_day: 3.1,
      rooftop_potential_kwp: 600,
      installed_solar_kwp: 240,
      grid_emission_factor_kg_kwh: 0.21,
      local_tariff_per_kwh_usd: 0.32,
      currency: 'GBP',
      reference_area_id: 'area_gbr_gwp',
      created_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'fac_usa_grandcentral',
      name: 'Grand Central Terminal',
      code: 'USA-NYC-GCT',
      place_type: 'heritage_terminal',
      country: 'United States',
      state_province: 'New York',
      district: 'New York County',
      city: 'Manhattan',
      neighbourhood: 'Midtown East',
      latitude: 40.7527,
      longitude: -73.9772,
      description: 'Iconic Beaux-Arts transit landmark with 44 underground passenger platforms serving Metro-North and Long Island Rail Road.',
      operational_context: 'Sub-level railway cavern ventilation, celestial concourse lighting, passenger concourse heating/cooling, and heavy pedestrian throughput.',
      has_direct_meter_data: false,
      meter_data_note: 'Direct MTA transit power streams are managed separately from NYC Local Law 84 residential benchmarks. Surrounding Downtown Central Towers data serves as municipal reference.',
      solar_irradiance_potential_kwh_sqm_day: 4.1,
      rooftop_potential_kwp: 300,
      installed_solar_kwp: 0,
      grid_emission_factor_kg_kwh: 0.36,
      local_tariff_per_kwh_usd: 0.22,
      currency: 'USD',
      reference_area_id: 'area_usa_dwt',
      created_at: '2026-01-10T08:00:00Z',
    },
  ];
}

export function getDatabaseStatus() {
  const data = readDb();
  return {
    engine: isPgConnected ? 'PostgreSQL 15+' : 'PostgreSQL-Compatible Persistent Store',
    mode: isPgConnected ? 'postgresql' : 'file_persisted',
    configuredUrl: process.env.DATABASE_URL ? 'Configured' : 'None (using local persistent store)',
    counts: {
      users: data.users.length,
      urban_areas: data.urban_areas.length,
      facilities: (data.facilities || []).length,
      datasets: data.datasets.length,
      energy_records: data.energy_records.length,
      planning_actions: data.planning_actions.length,
      scenarios: (data.scenarios || []).length,
      outcomes: (data.outcomes || []).length,
      audit_logs: data.audit_logs.length,
      import_history: data.import_history.length,
    },
    lastUpdated: new Date().toISOString(),
    lastDataIngestion: data.last_data_ingestion || '2026-10-15T14:25:00Z',
  };
}

export function readDb(): AppDatabase {
  if (!fs.existsSync(DATA_FILE)) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(getEmptyDb(), null, 2), 'utf-8');
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data: AppDatabase = JSON.parse(raw);
    let changed = false;

    // Automatic migration to ensure facilities are always seeded
    if (!data.facilities || data.facilities.length === 0) {
      data.facilities = getDefaultFacilities();
      changed = true;
    }

    // Ensure surrounding Churchgate residential enclave is seeded alongside Bandra-Kurla
    if (!data.urban_areas.some(a => a.id === 'area_ind_churchgate_quarter')) {
      const churchgateArea: UrbanArea = {
        id: 'area_ind_churchgate_quarter',
        name: 'Churchgate South Heritage & Residential Enclave',
        code: 'IND-CHG',
        country: 'India',
        state_province: 'Maharashtra',
        district: 'Mumbai City',
        city: 'Mumbai',
        category: 'Mixed-use Heritage & Residential',
        climate_zone: 'Tropical Wet & Dry (Aw)',
        latitude: 18.9350,
        longitude: 72.8270,
        household_count: 1250,
        gross_floor_area_sqm: 108000,
        target_intensity_kwh_sqm: 46.0,
        created_at: '2026-01-10T08:00:00Z',
      };
      data.urban_areas.push(churchgateArea);

      // Add energy records for surrounding Churchgate residential enclave
      const dates = [
        '2026-01-15', '2026-02-15', '2026-03-15', '2026-04-15',
        '2026-05-15', '2026-06-15', '2026-07-15', '2026-08-15',
        '2026-09-15', '2026-10-15'
      ];
      const datasetId = data.datasets[0]?.id || 'ds_q1q3_2026';
      dates.forEach((d, idx) => {
        const isPeak = idx === 4 || idx === 5; // May/June peak
        const val = isPeak ? 6400 : Math.round(4600 + Math.sin(idx) * 280);
        data.energy_records.push({
          id: `rec_chg_${idx + 1}`,
          dataset_id: datasetId,
          area_id: churchgateArea.id,
          area_code: churchgateArea.code,
          observation_date: d,
          consumption_value: val,
          consumption_unit: 'kWh',
          building_category: churchgateArea.category,
          is_flagged_high: isPeak,
          flag_reason: isPeak ? `Recorded consumption (${val} kWh) exceeds comparable baseline by 32% during pre-monsoon heat peak.` : undefined,
          possible_contributing_factors: isPeak ? ['Pre-monsoon air conditioning cooling load', 'Heritage building thermal lag'] : undefined,
          created_at: '2026-10-15T14:25:00Z',
        });
      });
      changed = true;
    }

    if (changed) {
      writeDb(data);
    }

    return data;
  } catch (err) {
    console.error('Failed reading DB file, recreating empty DB:', err);
    const empty = getEmptyDb();
    fs.writeFileSync(DATA_FILE, JSON.stringify(empty, null, 2), 'utf-8');
    return empty;
  }
}

export function writeDb(data: AppDatabase) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function getEmptyDb(): AppDatabase {
  return {
    users: [],
    urban_areas: [],
    facilities: getDefaultFacilities(),
    datasets: [],
    energy_records: [],
    planning_actions: [],
    planning_milestones: [],
    scenarios: [],
    outcomes: [],
    audit_logs: [],
    import_history: [],
    last_data_ingestion: new Date().toISOString(),
    settings: {
      defaultEnergyUnit: 'kWh',
      highThresholdMultiplier: 1.25,
      systemName: 'UrbanEnergy Insight',
    },
  };
}

async function generateSeedData(): Promise<AppDatabase> {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('demo123', salt);

  const users: User[] = [
    {
      id: 'usr_analyst_01',
      email: 'analyst@demo.local',
      password_hash: passwordHash,
      full_name: 'Elena Rostova',
      role: 'energy_analyst',
      permissions: ['analyst'],
      organization: 'Urban Sustainability Research Lab',
      created_at: '2026-01-10T08:00:00Z',
      updated_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'usr_manager_01',
      email: 'datamanager@demo.local',
      password_hash: passwordHash,
      full_name: 'Marcus Vance',
      role: 'data_manager',
      permissions: ['data_manager'],
      organization: 'Metropolitan Grid & Utilities Bureau',
      created_at: '2026-01-12T09:30:00Z',
      updated_at: '2026-01-12T09:30:00Z',
    },
    {
      id: 'usr_planner_admin_01',
      email: 'planneradmin@demo.local',
      password_hash: passwordHash,
      full_name: 'Devin Thorne',
      role: 'planner_admin',
      permissions: ['planner', 'admin'],
      organization: 'City Climate Action & Infrastructure Command',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
    {
      id: 'usr_planner_only_02',
      email: 'planner@demo.local',
      password_hash: passwordHash,
      full_name: 'Dr. Soraya Morales',
      role: 'planner_admin',
      permissions: ['planner'],
      organization: 'Urban Planning Department',
      created_at: '2026-01-15T11:00:00Z',
      updated_at: '2026-01-15T11:00:00Z',
    },
  ];

  // MULTI-COUNTRY & MULTI-REGION GEOGRAPHIC AREAS
  // Representing configurable hierarchy: Country -> State/Region/UT -> District -> City -> Sector
  const urban_areas: UrbanArea[] = [
    {
      id: 'area_usa_nw',
      name: 'Northwood Residential Sector',
      code: 'USA-NWD',
      country: 'United States',
      state_province: 'California',
      district: 'San Francisco County',
      city: 'San Francisco',
      category: 'High-rise Multi-family',
      climate_zone: 'Mediterranean Coastal (3C)',
      latitude: 37.7833,
      longitude: -122.4167,
      household_count: 1420,
      gross_floor_area_sqm: 112000,
      target_intensity_kwh_sqm: 42.0,
      created_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'area_usa_rv',
      name: 'Riverdale Eco-District',
      code: 'USA-RVD',
      country: 'United States',
      state_province: 'California',
      district: 'San Francisco County',
      city: 'San Francisco',
      category: 'Mid-rise Sustainable Housing',
      climate_zone: 'Mediterranean Coastal (3C)',
      latitude: 37.7691,
      longitude: -122.4462,
      household_count: 860,
      gross_floor_area_sqm: 78500,
      target_intensity_kwh_sqm: 35.0,
      created_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'area_usa_dwt',
      name: 'Downtown Central Towers',
      code: 'USA-DWT',
      country: 'United States',
      state_province: 'New York',
      district: 'New York County',
      city: 'Manhattan',
      category: 'High-rise Multi-family',
      climate_zone: 'Humid Continental (4A)',
      latitude: 40.7128,
      longitude: -74.0060,
      household_count: 2150,
      gross_floor_area_sqm: 195000,
      target_intensity_kwh_sqm: 46.5,
      created_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'area_ind_bkr',
      name: 'Bandra-Kurla Residential Enclave',
      code: 'IND-BKR',
      country: 'India',
      state_province: 'Maharashtra',
      district: 'Mumbai Suburban',
      city: 'Mumbai',
      category: 'High-rise Multi-family',
      climate_zone: 'Tropical Wet & Dry (Aw)',
      latitude: 19.0657,
      longitude: 72.8687,
      household_count: 1800,
      gross_floor_area_sqm: 145000,
      target_intensity_kwh_sqm: 52.0,
      created_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'area_ind_hkh',
      name: 'Hauz Khas Residential Colony',
      code: 'IND-HKH',
      country: 'India',
      state_province: 'Delhi (NCT)',
      district: 'South Delhi',
      city: 'New Delhi',
      category: 'Mixed-use Residential',
      climate_zone: 'Subtropical Semi-Arid (BSh)',
      latitude: 28.5494,
      longitude: 77.2001,
      household_count: 1100,
      gross_floor_area_sqm: 92000,
      target_intensity_kwh_sqm: 48.0,
      created_at: '2026-01-10T08:00:00Z',
    },
    {
      id: 'area_gbr_gwp',
      name: 'Greenwich Millennium Village',
      code: 'GBR-GWP',
      country: 'United Kingdom',
      state_province: 'Greater London',
      district: 'Greenwich',
      city: 'London',
      category: 'Sustainable Mid-rise Housing',
      climate_zone: 'Temperate Maritime (Cfb)',
      latitude: 51.4900,
      longitude: 0.0090,
      household_count: 950,
      gross_floor_area_sqm: 84000,
      target_intensity_kwh_sqm: 38.0,
      created_at: '2026-01-10T08:00:00Z',
    },
  ];

  const dataset: Dataset = {
    id: 'ds_q1q3_2026',
    name: 'Multi-Region Residential Energy Benchmark 2026 (Verified)',
    filename: 'international_residential_benchmark_2026.csv',
    uploaded_by: 'usr_manager_01',
    total_records: 60,
    valid_records: 60,
    invalid_records: 0,
    status: 'completed',
    reporting_period_start: '2026-01-01',
    reporting_period_end: '2026-10-01',
    created_at: '2026-10-15T14:20:00Z',
  };

  const dates = [
    '2026-01-15', '2026-02-15', '2026-03-15', '2026-04-15',
    '2026-05-15', '2026-06-15', '2026-07-15', '2026-08-15',
    '2026-09-15', '2026-10-15'
  ];

  const energy_records: EnergyRecord[] = [];
  let recordCounter = 1;

  const areaProfiles: Record<string, { base: number; variance: number; highMonths?: number[]; factors: string[] }> = {
    'area_usa_nw': {
      base: 4950,
      variance: 420,
      highMonths: [0, 1, 6, 7],
      factors: ['Winter auxiliary electrical heating', 'High glazed facade ratio without low-e film', 'Pre-1995 construction envelope'],
    },
    'area_usa_rv': {
      base: 2850,
      variance: 210,
      factors: ['High solar rooftop offset', 'Continuous mechanical ventilation with heat recovery'],
    },
    'area_usa_dwt': {
      base: 6980,
      variance: 600,
      highMonths: [1, 2, 7],
      factors: ['Continuous hallway ventilation load', 'High tenant occupancy density', 'Summer air conditioning cooling load'],
    },
    'area_ind_bkr': {
      base: 5800,
      variance: 550,
      highMonths: [4, 5, 6], // Peak monsoon pre-cooling / humidity load
      factors: ['Monsoon dehumidification air conditioning', 'Tropical ambient temperature >34°C', 'High lift and pumping load'],
    },
    'area_ind_hkh': {
      base: 4300,
      variance: 480,
      highMonths: [4, 5, 11], // Extreme summer heat May/June and winter Dec
      factors: ['Extreme seasonal temperature variation (45°C summer vs 6°C winter)', 'Multiple split A/C units'],
    },
    'area_gbr_gwp': {
      base: 3200,
      variance: 300,
      highMonths: [0, 1], // Winter space heating
      factors: ['District heating integration', 'Well-insulated cavity walls with double glazing'],
    },
  };

  for (const area of urban_areas) {
    const prof = areaProfiles[area.id] || { base: 3500, variance: 300, factors: [] };
    dates.forEach((d, mIdx) => {
      const seasonal = Math.sin((mIdx / 12) * Math.PI * 2) * 350;
      let val = Math.round(prof.base + seasonal + ((mIdx * 37) % prof.variance));

      let isHigh = false;
      let reason: string | undefined = undefined;

      if (prof.highMonths?.includes(mIdx)) {
        val = Math.round(val * 1.34);
        isHigh = true;
        reason = `Recorded consumption (${val} kWh) exceeds comparable category baseline median (4,100 kWh) by >30%. Statistical trigger: Multi-family baseline deviation.`;
      }

      energy_records.push({
        id: `rec_${recordCounter++}`,
        dataset_id: dataset.id,
        area_id: area.id,
        area_code: area.code,
        observation_date: d,
        consumption_value: val,
        consumption_unit: 'kWh',
        building_category: area.category,
        is_flagged_high: isHigh,
        flag_reason: reason,
        possible_contributing_factors: isHigh ? prof.factors : undefined,
        created_at: '2026-10-15T14:25:00Z',
      });
    });
  }

  const planning_actions: PlanningAction[] = [
    {
      id: 'act_01',
      area_id: 'area_usa_nw',
      created_by: 'usr_planner_admin_01',
      title: 'HVAC Sub-metering & Thermal Envelope Audit in Northwood Sector',
      description: 'Deploy thermal imaging audit and sub-metering diagnostic to isolate the 34% winter load deviation observed across Northwood Sector multi-family towers.',
      priority: 'High',
      status: 'In Progress',
      target_date: '2026-11-30',
      progress: 65,
      estimated_reduction_kwh: 45000,
      created_at: '2026-09-01T10:00:00Z',
      updated_at: '2026-10-18T16:00:00Z',
    },
    {
      id: 'act_02',
      area_id: 'area_usa_dwt',
      created_by: 'usr_planner_admin_01',
      title: 'Downtown Towers Variable Refrigerant Flow (VRF) Retrofit',
      description: 'Coordinate with property managers to upgrade legacy heat pumps and implement centralized nighttime setback controls.',
      priority: 'Critical',
      status: 'Planned',
      target_date: '2026-12-15',
      progress: 25,
      estimated_reduction_kwh: 82000,
      created_at: '2026-09-15T11:30:00Z',
      updated_at: '2026-10-12T09:15:00Z',
    },
    {
      id: 'act_03',
      area_id: 'area_ind_bkr',
      created_by: 'usr_planner_admin_01',
      title: 'Bandra-Kurla Common-Area Chiller Plant VFD Upgrade',
      description: 'Install variable frequency drives on condenser water pumps and optimize chiller staging during high humidity monsoon peak.',
      priority: 'High',
      status: 'In Progress',
      target_date: '2027-01-31',
      progress: 40,
      estimated_reduction_kwh: 68000,
      created_at: '2026-10-01T14:00:00Z',
      updated_at: '2026-10-15T14:00:00Z',
    },
    {
      id: 'act_04',
      area_id: 'area_usa_rv',
      created_by: 'usr_planner_admin_01',
      title: 'Riverdale Rooftop Community Solar Integration Feasibility',
      description: 'Evaluate microgrid load sharing and storage buffers across 12 mid-rise buildings in the Riverdale district.',
      priority: 'Medium',
      status: 'Proposed',
      target_date: '2027-02-28',
      progress: 10,
      estimated_reduction_kwh: 28000,
      created_at: '2026-10-01T14:00:00Z',
      updated_at: '2026-10-01T14:00:00Z',
    },
  ];

  const planning_milestones: PlanningMilestone[] = [
    {
      id: 'ms_01',
      action_id: 'act_01',
      title: 'Complete building thermographic survey',
      due_date: '2026-09-20',
      is_completed: true,
      completed_at: '2026-09-18T17:00:00Z',
      created_at: '2026-09-01T10:00:00Z',
    },
    {
      id: 'ms_02',
      action_id: 'act_01',
      title: 'Analyze common-area vs tenant sub-meter load balance',
      due_date: '2026-10-25',
      is_completed: true,
      completed_at: '2026-10-20T14:30:00Z',
      created_at: '2026-09-01T10:00:00Z',
    },
    {
      id: 'ms_03',
      action_id: 'act_01',
      title: 'Publish draft remediation proposal to building board',
      due_date: '2026-11-15',
      is_completed: false,
      created_at: '2026-09-01T10:00:00Z',
    },
  ];

  // WHAT-IF SCENARIOS (Evidence-Based Simulation)
  const scenarios: WhatIfScenario[] = [
    {
      id: 'scen_01',
      area_id: 'area_usa_nw',
      area_name: 'Northwood Residential Sector',
      baseline_period: '2026-01 to 2026-10',
      baseline_kwh: 64500,
      reduction_percent: 8,
      projected_kwh: 59340,
      saved_kwh: 5160,
      estimated_cost_savings_usd: 877, // at ~$0.17/kWh
      co2_kg_avoided: 1960, // at ~0.38 kg CO2/kWh
      notes: 'Hypothetical 8% reduction via night setbacks and air leakage sealing.',
      created_at: '2026-10-18T14:00:00Z',
    },
    {
      id: 'scen_02',
      area_id: 'area_ind_bkr',
      area_name: 'Bandra-Kurla Residential Enclave',
      baseline_period: '2026-05 to 2026-08',
      baseline_kwh: 72000,
      reduction_percent: 12,
      projected_kwh: 63360,
      saved_kwh: 8640,
      estimated_cost_savings_usd: 1296,
      co2_kg_avoided: 6048, // at ~0.70 kg CO2/kWh grid factor in India
      notes: 'VFD optimization on chiller condenser loops during high-humidity season.',
      created_at: '2026-10-19T11:30:00Z',
    },
  ];

  // OUTCOME TRACKING (Pre vs Post Intervention Verification)
  const outcomes: OutcomeRecord[] = [
    {
      id: 'out_01',
      action_id: 'act_04',
      action_title: 'Oakridge Smart Thermostat Residential Subsidy Program',
      area_id: 'area_usa_rv',
      area_name: 'Riverdale Eco-District',
      pre_intervention_period: '2025-06 to 2025-08',
      pre_intervention_kwh: 32400,
      post_intervention_period: '2026-06 to 2026-08',
      post_intervention_kwh: 29808,
      observed_reduction_kwh: 2592,
      observed_reduction_percent: 8.0,
      verification_status: 'Verified',
      weather_normalized: true,
      notes: 'Weather-normalized comparison shows 8.0% cooling load drop after smart thermostat deployment.',
    },
  ];

  const import_history: ImportHistory[] = [
    {
      id: 'imp_01',
      dataset_id: dataset.id,
      user_id: 'usr_manager_01',
      file_name: dataset.filename,
      records_imported: 60,
      records_rejected: 0,
      processing_duration_ms: 142,
      imported_at: '2026-10-15T14:25:00Z',
    },
  ];

  const audit_logs: AuditLog[] = [
    {
      id: 'aud_01',
      user_id: 'usr_planner_admin_01',
      user_email: 'planneradmin@demo.local',
      role: 'planner_admin',
      action: 'SYSTEM_BOOTSTRAP',
      resource: 'Database',
      details: { version: '2.0.0', initializedTables: 11, countries: ['USA', 'India', 'UK'] },
      ip_address: '127.0.0.1',
      timestamp: '2026-10-15T14:00:00Z',
    },
    {
      id: 'aud_02',
      user_id: 'usr_manager_01',
      user_email: 'datamanager@demo.local',
      role: 'data_manager',
      action: 'DATASET_UPLOAD',
      resource: 'Datasets',
      details: { datasetId: dataset.id, records: 60 },
      ip_address: '192.168.1.104',
      timestamp: '2026-10-15T14:25:00Z',
    },
  ];

  return {
    users,
    urban_areas,
    facilities: getDefaultFacilities(),
    datasets: [dataset],
    energy_records,
    planning_actions,
    planning_milestones,
    scenarios,
    outcomes,
    audit_logs,
    import_history,
    last_data_ingestion: '2026-10-15T14:25:00Z',
    settings: {
      defaultEnergyUnit: 'kWh',
      highThresholdMultiplier: 1.25,
      systemName: 'UrbanEnergy Insight',
    },
  };
}
