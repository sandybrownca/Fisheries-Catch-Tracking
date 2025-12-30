# Fisheries Catch Tracking & Sustainability Dashboard - Backend

A comprehensive Node.js/TypeScript backend system for managing fishing vessel operations, catch logging, quota tracking, and regulatory compliance.

## 🎯 Features

### Core Functionality
- **Vessel & Crew Management**: Register vessels, assign captains, track vessel status
- **Catch Logging**: Immutable timestamped catch records with geo-location
- **Quota Tracking**: Annual quotas per species with automatic violation detection
- **Seasonal Restrictions**: Ban period management and enforcement
- **Violation System**: Automatic flagging of quota exceedances and seasonal violations
- **Sustainability Dashboard**: Real-time analytics and compliance monitoring

### Technical Highlights
- **Immutable Catch Logs**: Once created, catch records cannot be modified
- **Automatic Violation Detection**: Real-time checking during catch entry
- **Geo-location Support**: Latitude/longitude tracking for all catches
- **Comprehensive Analytics**: Charts, trends, and compliance metrics
- **Role-based Data**: Support for operators, captains, and regulators

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with pg driver
- **Security**: Helmet, CORS
- **Validation**: express-validator

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## 🚀 Installation

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Database Setup

Create PostgreSQL database:

```bash
createdb fisheries_db
```

Run schema migration:

```bash
psql -d fisheries_db -f src/database/schema.sql
```

### 3. Environment Configuration

Create `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fisheries_db
DB_USER=postgres
DB_PASSWORD=your_password

PORT=3000
NODE_ENV=development
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

### 5. Start Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

## 📚 API Documentation

Base URL: `http://localhost:3000/api`

📊 Key API Endpoints

`/api/vessels` - Vessel management
`/api/catches` - Catch logging
`/api/quotas` - Quota management
`/api/violations` - Compliance violations
`/api/dashboard/*` - Analytics & charts
`/api/species` - Species management

### Vessels

**Create Vessel**
```http
POST /api/vessels
Content-Type: application/json

{
  "registration_number": "FV-2024-001",
  "vessel_name": "Northern Star",
  "vessel_type": "Trawler",
  "length_meters": 25.5,
  "tonnage": 150.0,
  "home_port": "Portland",
  "owner_id": "uuid"
}
```

**Get All Vessels**
```http
GET /api/vessels?status=active&search=Northern
```

**Get Vessel Details**
```http
GET /api/vessels/:id
```

**Update Vessel**
```http
PUT /api/vessels/:id
Content-Type: application/json

{
  "status": "inactive"
}
```

**Assign Crew**
```http
POST /api/vessels/:id/crew
Content-Type: application/json

{
  "user_id": "uuid",
  "role": "Captain",
  "is_captain": true
}
```

### Catch Logs

**Create Catch Log**
```http
POST /api/catches
Content-Type: application/json

{
  "vessel_id": "uuid",
  "captain_id": "uuid",
  "species_id": "uuid",
  "catch_date": "2024-12-26",
  "catch_time": "08:30:00",
  "weight_kg": 1500.5,
  "latitude": 45.5234,
  "longitude": -122.6762,
  "fishing_zone": "Zone 3",
  "fishing_method": "Trawling",
  "notes": "Good catch conditions"
}
```

**Get Catch Logs**
```http
GET /api/catches?vessel_id=uuid&start_date=2024-01-01&end_date=2024-12-31&page=1&limit=50
```

**Verify Catch Log**
```http
PUT /api/catches/:id/verify
Content-Type: application/json

{
  "verified_by": "uuid"
}
```

**Get Map Data**
```http
GET /api/catches/locations?start_date=2024-01-01&end_date=2024-12-31&species_id=uuid
```

### Species

**Create Species**
```http
POST /api/species
Content-Type: application/json

{
  "common_name": "Atlantic Cod",
  "scientific_name": "Gadus morhua",
  "species_code": "COD",
  "conservation_status": "Vulnerable",
  "min_legal_size_cm": 35.0
}
```

**Get All Species**
```http
GET /api/species?search=cod
```

**Get Species with Statistics**
```http
GET /api/species/:id/stats?year=2024
```

**Get Top Species by Catch**
```http
GET /api/species/top/by-catch?year=2024&limit=10
```

### Quotas

**Create Quota**
```http
POST /api/quotas
Content-Type: application/json

{
  "species_id": "uuid",
  "year": 2024,
  "total_quota_kg": 50000,
  "vessel_id": "uuid",
  "start_date": "2024-01-01",
  "end_date": "2024-12-31"
}
```

**Get Quotas**
```http
GET /api/quotas?species_id=uuid&year=2024&vessel_id=uuid
```

**Check Quota Status**
```http
GET /api/quotas/check/:species_id?year=2024&vessel_id=uuid
```

### Seasonal Restrictions

**Create Restriction**
```http
POST /api/restrictions
Content-Type: application/json

{
  "species_id": "uuid",
  "region": "North Atlantic",
  "ban_start_date": "2024-04-01",
  "ban_end_date": "2024-06-30",
  "year": 2024,
  "reason": "Spawning season protection"
}
```

**Get Restrictions**
```http
GET /api/restrictions?species_id=uuid&active_on_date=2024-05-15
```

### Violations

**Get Violations**
```http
GET /api/violations?vessel_id=uuid&resolved=false&severity=critical
```

**Resolve Violation**
```http
PUT /api/violations/:id/resolve
Content-Type: application/json

{
  "resolved_by": "uuid",
  "notes": "Quota adjusted and vessel notified"
}
```

### Dashboard Analytics

**Get Dashboard Stats**
```http
GET /api/dashboard/stats?year=2024
```

Response:
```json
{
  "success": true,
  "data": {
    "total_vessels": 15,
    "active_vessels": 12,
    "total_catch_today": 5420.5,
    "total_catch_this_month": 125430.2,
    "total_catch_this_year": 1250430.8,
    "active_violations": 5,
    "critical_violations": 2,
    "quota_compliance_rate": 87.5
  }
}
```

**Catch vs Quota Analysis**
```http
GET /api/dashboard/catch-vs-quota?year=2024&vessel_id=uuid
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "species_id": "uuid",
      "species_name": "Atlantic Cod",
      "total_catch_kg": 45000,
      "quota_kg": 50000,
      "percentage_used": 90.0,
      "status": "critical"
    }
  ]
}
```

**Species Trend Analysis**
```http
GET /api/dashboard/species/:species_id/trend?start_date=2024-01-01&end_date=2024-12-31
```

**Overfishing Alerts**
```http
GET /api/dashboard/overfishing-alerts?year=2024
```

**Top Vessels by Species**
```http
GET /api/dashboard/species/:species_id/top-vessels?year=2024&limit=10
```

**Seasonal Catch Pattern**
```http
GET /api/dashboard/seasonal-pattern?year=2024
```

## 🗄️ Database Schema

### Key Tables

- **users**: System users (operators, captains, regulators)
- **vessels**: Fishing vessel registry
- **crew_assignments**: Vessel crew relationships
- **species**: Fish species master data
- **quotas**: Annual catch quotas
- **seasonal_restrictions**: Seasonal ban periods
- **catch_logs**: Immutable catch records
- **violations**: Automatic compliance violations
- **audit_logs**: System audit trail

### Important Constraints

- Catch logs are immutable (INSERT only)
- Violations are automatically created on catch entry
- Quota checks happen in real-time
- Seasonal restrictions are enforced automatically

## 🔒 Security Features

- Helmet.js for HTTP security headers
- CORS configuration
- Input validation and sanitization
- SQL injection protection (parameterized queries)
- Error handling and logging

## 📊 Compliance Features

### Automatic Violation Detection

1. **Quota Exceeded**: Triggered when catch exceeds allocated quota
2. **Seasonal Ban**: Triggered when catching during restricted periods
3. **Severity Levels**: Low, Medium, High, Critical

### Immutable Audit Trail

- All catch logs are permanent and cannot be edited
- Comprehensive audit logging for compliance
- Timestamp tracking on all operations

## 🧪 Testing Endpoints

Use the provided seed data or create test records:

```bash
# Get dashboard stats
curl http://localhost:3000/api/dashboard/stats

# Get all vessels
curl http://localhost:3000/api/vessels

# Get catch vs quota
curl http://localhost:3000/api/dashboard/catch-vs-quota?year=2024
```

## 🎨 Frontend Integration

This backend is designed to work with Next.js frontend with:
- Chart.js or Recharts for data visualization
- Map integration (Leaflet, Mapbox) for catch locations
- Real-time dashboard updates
- Regulator read-only mode support

## 📈 Performance Considerations

- Database indexes on frequently queried columns
- Connection pooling (20 connections)
- Efficient aggregation queries
- Pagination support on list endpoints

## 🚧 Future Enhancements

- [ ] WebSocket support for real-time updates
- [ ] Advanced reporting (PDF exports)
- [ ] ML-based overfishing predictions
- [ ] Weather data integration
- [ ] Mobile app API endpoints
- [ ] Multi-language support

## 📝 License

MIT

## 👥 Support

For issues and questions, please open a GitHub issue or contact the development team.

---

Built with ❤️ for sustainable fisheries management