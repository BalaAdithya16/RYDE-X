const express = require("express");
const cors    = require("cors");
const path    = require("path");
const axios   = require("axios");
const https   = require("https");

const app      = express();
// ✅ Uses Render's assigned port, falls back to 3000 locally
const PORT = process.env.PORT || 3000;
const API_BASE = "https://69aacf98e051e9456fa28645.mockapi.io/api/tt/RideObject2";

axios.defaults.httpsAgent = new https.Agent({ rejectUnauthorized: false });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => res.json({}));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("/confirmed", (req, res) => res.sendFile(path.join(__dirname, "public", "confirmed.html")));

// ─── Helpers ──────────────────────────────────────────────

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getNextRideId() {
  try {
    const { data } = await axios.get(API_BASE);
    if (!data || data.length === 0) return 10001;
    const maxId = Math.max(...data.map(r => r.ride_id || 0));
    return maxId + 1;
  } catch (err) {
    console.error("Could not fetch ride list for ID generation:", err.message);
    return 10001;
  }
}

function generateLogic(pickup, drop) {
  const providers = ["uber", "ola", "rapido"];
  const vehicles  = [
    { make: "Honda",    model: "Accord",   color: "Blue"   },
    { make: "Toyota",   model: "Camry",    color: "White"  },
    { make: "Hyundai",  model: "i20",      color: "Black"  },
    { make: "Maruti",   model: "Swift",    color: "Red"    },
    { make: "Tata",     model: "Nexon",    color: "Grey"   },
    { make: "Kia",      model: "Seltos",   color: "Silver" },
    { make: "Ford",     model: "EcoSport", color: "White"  },
    { make: "Mahindra", model: "XUV300",   color: "Black"  },
    { make: "Skoda",    model: "Octavia",  color: "Silver" },
  ];
  const drivers = [
    { name: "Ravi",    mobile_number: "+919900000101" },
    { name: "Sneha",   mobile_number: "+919900000102" },
    { name: "Arjun",   mobile_number: "+919900000103" },
    { name: "Pooja",   mobile_number: "+919900000104" },
    { name: "Karthik", mobile_number: "+919900000105" },
    { name: "Priya",   mobile_number: "+919900000106" },
    { name: "Nikhil",  mobile_number: "+919900000107" },
    { name: "Divya",   mobile_number: "+919900000108" },
  ];

  const baseCost = (pickup.length + drop.length) * 3 + randomBetween(80, 160);
  const vehicle  = vehicles[randomBetween(0, vehicles.length - 1)];
  const driver   = drivers[randomBetween(0, drivers.length - 1)];

  return {
    provider: providers[randomBetween(0, providers.length - 1)],
    status:   "active",
    eta_mins: randomBetween(2, 15),
    cost:     baseCost,
    rating:   parseFloat((randomBetween(40, 50) / 10).toFixed(1)),  // TOP LEVEL now
    vehicle: {
      color:        vehicle.color,
      make:         vehicle.make,
      model:        vehicle.model,
      number_plate: String(randomBetween(1000, 9999)),
    },
    driver: {
      name:          driver.name,
      mobile_number: driver.mobile_number,
      // rating removed from here
    },
  };
}

// ─── Routes ───────────────────────────────────────────────

app.get("/api/rides", async (req, res) => {
  try {
    const { data } = await axios.get(API_BASE);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rides", details: err.message });
  }
});

app.get("/api/rides/:id", async (req, res) => {
  try {
    const { data } = await axios.get(`${API_BASE}/${req.params.id}`);
    res.json(data);
  } catch (err) {
    res.status(404).json({ error: "Ride not found" });
  }
});

app.post("/api/book", async (req, res) => {
  const { name, phone, pickup_location, drop_location } = req.body;

  if (!name || !phone || !pickup_location || !drop_location) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const logic      = generateLogic(pickup_location, drop_location);
  const nextRideId = await getNextRideId();

  // Matches schema exactly:
  // id (auto), ride_id, provider, status, eta_mins, vehicle(obj), driver(obj), customer(obj), cost, rating
  const newRide = {
    ride_id:  nextRideId,
    provider: logic.provider,
    status:   logic.status,
    eta_mins: logic.eta_mins,
    cost:     logic.cost,
    rating:   logic.rating,        // top-level
    vehicle:  logic.vehicle,
    driver:   logic.driver,
    customer: {
      name,
      phone,
      pickup_location,
      drop_location,
    },
  };

  try {
    console.log(`\n📦 Booking ride #${nextRideId}...`);
    console.log(JSON.stringify(newRide, null, 2));
    const { data } = await axios.post(API_BASE, newRide, {
      headers: { "Content-Type": "application/json" },
    });
    console.log(`✅ Created → id: ${data.id}, ride_id: ${data.ride_id}`);
    res.status(201).json({ message: "Ride booked successfully!", ride: data });
  } catch (err) {
    console.error("POST /api/book error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to post ride", details: err.response?.data || err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚗  RYDEX server running → http://localhost:${PORT}\n`);
});
