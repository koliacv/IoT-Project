# IoT API Documentation

## Overview
This API provides endpoints to manage users, devices, and temperature data for IoT applications. It allows user registration, device addition, and temperature management.

## Base URL
```
http://localhost:3000
```

## Endpoints

### 1. Register User
**Endpoint:**
```
POST /register
```

**Description:**
Registers a new user.

**Request Body:**
```json
{
  "username": "user123",
  "password": "securepass"
}
```

**Responses:**
- `200 OK` - User registered successfully.
- `400 Bad Request` - Username or password is missing.
- `400 Bad Request` - Username already exists.
- `500 Internal Server Error` - Database error.

**Example Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "userId": "user123"
}
```

---

### 2. Add Device
**Endpoint:**
```
POST /add-device
```

**Description:**
Adds a new device and links it to a user.

**Request Body:**
```json
{
  "userId": "user123",
  "name": "Smart Thermostat"
}
```

**Responses:**
- `200 OK` - Device added and linked successfully.
- `400 Bad Request` - User ID or device name is missing.
- `500 Internal Server Error` - Database error.

**Example Response:**
```json
{
  "status": "success",
  "message": "Device added and linked successfully",
  "deviceId": "smart-thermostat"
}
```

---

### 3. Get User Temperatures
**Endpoint:**
```
GET /get-user-temperatures?userId=user123
```

**Description:**
Retrieves temperature records for a specific user.

**Query Parameters:**
- `userId` (required): ID of the user.

**Responses:**
- `200 OK` - List of temperature records.
- `400 Bad Request` - User ID is missing.
- `404 Not Found` - No temperatures found.
- `500 Internal Server Error` - Database error.

**Example Response:**
```json
{
  "status": "success",
  "temperatures": [
    {
      "id": "user123-device1-1700000000000",
      "user_id": "user123",
      "device_id": "smart-thermostat",
      "value": 22.5,
      "created_at": "2024-01-01 10:00:00"
    }
  ]
}
```

---

### 4. Set Temperature
**Endpoint:**
```
PUT /set-temperature
```

**Description:**
Sets the temperature for a user's device.

**Request Body:**
```json
{
  "userId": "user123",
  "deviceId": "smart-thermostat",
  "temperature": 23.5
}
```

**Responses:**
- `200 OK` - Temperature set successfully.
- `400 Bad Request` - Missing user ID, device ID, or temperature.
- `400 Bad Request` - Device not linked to the user.
- `500 Internal Server Error` - Database error.

**Example Response:**
```json
{
  "status": "success",
  "message": "Temperature set successfully"
}
```

---

