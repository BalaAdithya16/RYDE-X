# 🚗 RYDEX — Node.js + Express

## Project Structure
```
rydex-node/
├── server.js          ← Express backend
├── package.json
└── public/
    └── index.html     ← Frontend (served by Express)
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open in browser
http://localhost:3000
```

For development with auto-restart:
```bash
npm run dev
```

---

## API Endpoints

| Method | Endpoint          | Description              |
|--------|-------------------|--------------------------|
| GET    | /api/rides        | Fetch all rides           |
| GET    | /api/rides/:id    | Fetch a single ride       |
| POST   | /api/book         | Book a new ride           |

### POST /api/book — Request Body
```json
{
  "name": "Arjun Sharma",
  "phone": "+91 98765 43210",
  "pickup_location": "Hitech City, Hyderabad",
  "drop_location": "Gachibowli, Hyderabad"
}
```

### Auto-generated fields (server logic)
| Field              | Logic                                      |
|--------------------|--------------------------------------------|
| `provider`         | Random: uber / ola / rapido                |
| `status`           | Always `active` for new bookings           |
| `eta_mins`         | Random 2–15 mins                           |
| `cost`             | Based on pickup+drop length + random base  |
| `vehicle`          | Random from pool of 9 vehicles             |
| `driver`           | Random from pool of 8 drivers              |
| `driver.rating`    | Random 4.0–5.0                             |
| `vehicle.number_plate` | Random 4-digit number                 |
