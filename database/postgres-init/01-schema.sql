-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tourist Spots Table
CREATE TABLE IF NOT EXISTS tourist_spots (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    description TEXT,
    tags TEXT[],
    opening_hours VARCHAR(100),
    image_url TEXT,
    google_place_id VARCHAR(128),
    google_maps_url TEXT,
    monthly_checkins INTEGER DEFAULT 0,
    checkin_trend VARCHAR(20) DEFAULT 'steady',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial index for sub-millisecond radius searches
CREATE INDEX IF NOT EXISTS idx_tourist_spots_geom ON tourist_spots USING GIST(location);

-- 2. Partnered Hotels Table
CREATE TABLE IF NOT EXISTS hotels (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    tier VARCHAR(50) NOT NULL, -- 'Heritage Luxury', 'Boutique Stay', 'Urban Comfort', etc.
    price_per_night NUMERIC(10, 2) NOT NULL,
    commission_rate NUMERIC(4, 2) DEFAULT 0.15, -- 15% platform commission
    status VARCHAR(20) DEFAULT 'verified', -- 'verified', 'pending'
    allows_independent_guides BOOLEAN DEFAULT TRUE,
    partnership_model VARCHAR(30) DEFAULT 'community_pool', -- 'in_house_guides', 'community_pool', 'hybrid'
    guide_referral_kickback_percent NUMERIC(4, 2) DEFAULT 0.05, -- 5% hotel kickback on guide bundle
    -- Google Maps Check-In Footfall Metrics (Strict Non-Rating Algorithm)
    checkin_count INTEGER DEFAULT 0,
    weekly_checkins INTEGER DEFAULT 0,
    footfall_rank INTEGER DEFAULT 1,
    google_place_id VARCHAR(128),
    google_maps_url TEXT,
    business_reg_number VARCHAR(64), -- GST / Tourism License ID
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hotels_geom ON hotels USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_hotels_checkins ON hotels(checkin_count DESC);

-- 3. Room Categories Table
CREATE TABLE IF NOT EXISTS hotel_rooms (
    id VARCHAR(64) PRIMARY KEY,
    hotel_id VARCHAR(64) REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    price_per_night NUMERIC(10, 2) NOT NULL,
    capacity INTEGER DEFAULT 2,
    description TEXT,
    perks TEXT[]
);

-- 4. Certified Local Guides Table
CREATE TABLE IF NOT EXISTS guides (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    languages TEXT[] NOT NULL,
    hourly_rate NUMERIC(10, 2) NOT NULL,
    half_day_rate NUMERIC(10, 2) NOT NULL,
    full_day_rate NUMERIC(10, 2) NOT NULL,
    photo_walk_rate NUMERIC(10, 2) NOT NULL,
    verification_id VARCHAR(64) NOT NULL UNIQUE, -- Government Tourism Badge
    completed_tours_count INTEGER DEFAULT 0,
    bio TEXT,
    specialties TEXT[],
    affiliated_hotel_id VARCHAR(64) REFERENCES hotels(id) ON DELETE SET NULL,
    badge_verified BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    phone VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bookings & Multi-Party Split Transactions Table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    hotel_id VARCHAR(64) REFERENCES hotels(id),
    hotel_name VARCHAR(255) NOT NULL,
    room_id VARCHAR(64),
    room_name VARCHAR(128) NOT NULL,
    nights INTEGER NOT NULL DEFAULT 1,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests INTEGER DEFAULT 2,
    guide_id VARCHAR(64) REFERENCES guides(id),
    guide_name VARCHAR(255),
    guide_package_type VARCHAR(50),
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Split Settlements Ledger Table (Financial Audit Trail)
CREATE TABLE IF NOT EXISTS split_settlements (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE CASCADE,
    total_charged NUMERIC(10, 2) NOT NULL,
    hotel_gross NUMERIC(10, 2) NOT NULL,
    hotel_platform_cut NUMERIC(10, 2) NOT NULL,
    hotel_net_payout NUMERIC(10, 2) NOT NULL,
    guide_gross NUMERIC(10, 2) DEFAULT 0,
    guide_platform_cut NUMERIC(10, 2) DEFAULT 0,
    hotel_referral_kickback NUMERIC(10, 2) DEFAULT 0,
    guide_net_payout NUMERIC(10, 2) DEFAULT 0,
    platform_net_revenue NUMERIC(10, 2) NOT NULL,
    settlement_status VARCHAR(20) DEFAULT 'settled',
    settled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stored Procedure: Spatial Radius Retrieval (ST_DWithin within N km)
CREATE OR REPLACE FUNCTION get_hotels_near_spot(
    spot_lat FLOAT,
    spot_lng FLOAT,
    radius_km FLOAT DEFAULT 5.0
)
RETURNS TABLE (
    hotel_id VARCHAR(64),
    hotel_name VARCHAR(255),
    price_per_night NUMERIC(10,2),
    checkin_count INTEGER,
    weekly_checkins INTEGER,
    footfall_rank INTEGER,
    distance_meters FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.name,
        h.price_per_night,
        h.checkin_count,
        h.weekly_checkins,
        h.footfall_rank,
        ST_Distance(h.location, ST_SetSRID(ST_MakePoint(spot_lng, spot_lat), 4326)::geography) AS distance_meters
    FROM hotels h
    WHERE ST_DWithin(
        h.location,
        ST_SetSRID(ST_MakePoint(spot_lng, spot_lat), 4326)::geography,
        radius_km * 1000
    )
    AND h.status = 'verified'
    ORDER BY h.checkin_count DESC; -- Check-in driven ordering
END;
$$ LANGUAGE plpgsql;
