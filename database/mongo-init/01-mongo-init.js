// MongoDB Initialization for TourMatch AI Unstructured Data Store
db = db.getSiblingDB('tourmatch_docs');

// Create collections
db.createCollection('property_media');
db.createCollection('ai_interaction_logs');
db.createCollection('partner_compliance_docs');

// Indexing
db.property_media.createIndex({ hotel_id: 1 });
db.ai_interaction_logs.createIndex({ created_at: -1 });
db.ai_interaction_logs.createIndex({ "parsed_filters.landmark_id": 1 });

// Seed initial property media catalog
db.property_media.insertMany([
  {
    hotel_id: "hotel-royal-charminar",
    gallery: [
      { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945", tag: "facade", caption: "Colonial Nizam Facade" },
      { url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b", tag: "room", caption: "Heritage Deluxe Room" },
      { url: "https://images.unsplash.com/photo-1540541338287-41700207dee6", tag: "amenity", caption: "Rooftop Minar View Terrace" }
    ],
    verified_amenities_metadata: {
      wifi_speed_mbps: 180,
      ev_charging: false,
      concierge_desk_hours: "24/7"
    },
    updated_at: new Date()
  },
  {
    hotel_id: "hotel-fort-view",
    gallery: [
      { url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa", tag: "facade", caption: "Citadel Bastion View" },
      { url: "https://images.unsplash.com/photo-1590490360182-c33d57733427", tag: "room", caption: "Sultan Qutb Shahi Suite" }
    ],
    updated_at: new Date()
  }
]);

print("TourMatch MongoDB Document Store Initialized Successfully.");
