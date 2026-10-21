-- UrbanEnergy Insight Schema
-- PostgreSQL Production & Development Schema

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('energy_analyst', 'data_manager', 'planner_admin')),
  permissions JSONB DEFAULT '[]'::jsonb,
  organization VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS urban_areas (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(100) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  household_count INTEGER NOT NULL DEFAULT 0,
  gross_floor_area_sqm DOUBLE PRECISION,
  target_intensity_kwh_sqm DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS datasets (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  uploaded_by VARCHAR(64) REFERENCES users(id),
  total_records INTEGER NOT NULL DEFAULT 0,
  valid_records INTEGER NOT NULL DEFAULT 0,
  invalid_records INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  reporting_period_start DATE,
  reporting_period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS energy_records (
  id VARCHAR(64) PRIMARY KEY,
  dataset_id VARCHAR(64) REFERENCES datasets(id) ON DELETE CASCADE,
  area_id VARCHAR(64) REFERENCES urban_areas(id),
  area_code VARCHAR(50) NOT NULL,
  observation_date DATE NOT NULL,
  consumption_value DOUBLE PRECISION NOT NULL,
  consumption_unit VARCHAR(20) NOT NULL DEFAULT 'kWh',
  building_category VARCHAR(100),
  is_flagged_high BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS validation_results (
  id VARCHAR(64) PRIMARY KEY,
  dataset_id VARCHAR(64) REFERENCES datasets(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  field_name VARCHAR(100),
  raw_value TEXT,
  error_message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'warning',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS import_history (
  id VARCHAR(64) PRIMARY KEY,
  dataset_id VARCHAR(64) REFERENCES datasets(id) ON DELETE CASCADE,
  user_id VARCHAR(64) REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  records_imported INTEGER NOT NULL,
  records_rejected INTEGER NOT NULL,
  processing_duration_ms INTEGER,
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS planning_actions (
  id VARCHAR(64) PRIMARY KEY,
  area_id VARCHAR(64) REFERENCES urban_areas(id),
  created_by VARCHAR(64) REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('Proposed', 'Planned', 'In Progress', 'Completed', 'On Hold')),
  target_date DATE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  estimated_reduction_kwh DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS planning_milestones (
  id VARCHAR(64) PRIMARY KEY,
  action_id VARCHAR(64) REFERENCES planning_actions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  due_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64),
  user_email VARCHAR(255),
  role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS application_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_by VARCHAR(64),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for analytical queries
CREATE INDEX IF NOT EXISTS idx_energy_records_area ON energy_records(area_id);
CREATE INDEX IF NOT EXISTS idx_energy_records_date ON energy_records(observation_date);
CREATE INDEX IF NOT EXISTS idx_energy_records_flagged ON energy_records(is_flagged_high);
CREATE INDEX IF NOT EXISTS idx_planning_actions_area ON planning_actions(area_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
