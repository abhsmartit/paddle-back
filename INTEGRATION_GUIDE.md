# 🔐 Authentication Integration Guide

Complete guide for integrating both **Admin Dashboard** and **Customer Application** with the Padel Club API.

---

## 📋 Table of Contents

1. [Admin Authentication](#admin-authentication)
2. [Customer Authentication](#customer-authentication)
3. [Frontend Integration Examples](#frontend-integration-examples)
4. [Complete Code Samples](#complete-code-samples)
5. [Error Handling](#error-handling)

---

## 🔑 Admin Authentication

### Endpoints

#### 1. Admin Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@padelclub.com",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "674187c2e4b0a7e8f9d12345",
    "email": "admin@padelclub.com",
    "fullName": "System Admin",
    "roles": ["ADMIN", "MANAGER", "RECEPTIONIST"]
  }
}
```

#### 2. Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Logout
```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

---

## 📱 Customer Authentication

### Endpoints

#### 1. Request OTP (Customer Login)
```http
POST /auth/customer/login
Content-Type: application/json

{
  "phone": "+966501234567",
  "bookingName": "Ahmed Ali"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "phone": "+966501234567",
  "expiresIn": 300,
  "devOtp": "123456"
}
```

> **Note:** `devOtp` is only returned in development mode for testing. Remove in production.

#### 2. Verify OTP
```http
POST /auth/customer/verify?clubId=674187c2e4b0a7e8f9d12345
Content-Type: application/json

{
  "phone": "+966501234567",
  "otp": "123456"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": "674187c3e4b0a7e8f9d67890",
    "fullName": "Ahmed Ali",
    "phone": "+966501234567",
    "email": "+966501234567@customer.temp"
  }
}
```

#### 3. Resend OTP
```http
POST /auth/customer/resend-otp
Content-Type: application/json

{
  "phone": "+966501234567"
}
```

**Response:**
```json
{
  "message": "OTP resent successfully",
  "phone": "+966501234567",
  "expiresIn": 300,
  "devOtp": "789012"
}
```

---

## 💻 Frontend Integration Examples

### React/Next.js Admin Dashboard

#### 1. Create Auth Context

```typescript
// contexts/AdminAuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}

interface AdminAuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_access_token');
    const userData = localStorage.getItem('admin_user');
    
    if (token && userData) {
      setAccessToken(token);
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!accessToken) return;

    const refreshInterval = setInterval(async () => {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken: newToken, refreshToken: newRefreshToken } = response.data;
          
          setAccessToken(newToken);
          localStorage.setItem('admin_access_token', newToken);
          localStorage.setItem('admin_refresh_token', newRefreshToken);
        } catch (error) {
          console.error('Token refresh failed:', error);
          await logout();
        }
      }
    }, 50 * 60 * 1000); // Refresh every 50 minutes (token expires in 1 hour)

    return () => clearInterval(refreshInterval);
  }, [accessToken]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { accessToken, refreshToken, user } = response.data;

      setAccessToken(accessToken);
      setUser(user);

      localStorage.setItem('admin_access_token', accessToken);
      localStorage.setItem('admin_refresh_token', refreshToken);
      localStorage.setItem('admin_user', JSON.stringify(user));
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await axios.post(`${API_URL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
    }
  };

  return (
    <AdminAuthContext.Provider value={{ user, accessToken, login, logout, isLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};
```

#### 2. Admin Login Page

```typescript
// pages/admin/login.tsx
import React, { useState } from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useRouter } from 'next/router';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@padelclub.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Admin Login</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

#### 3. API Service with Interceptors

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        const response = await axios.post('http://localhost:3000/auth/refresh', { refreshToken });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        localStorage.setItem('admin_access_token', accessToken);
        localStorage.setItem('admin_refresh_token', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API methods
export const adminAPI = {
  // Get today's schedule
  getTodaySchedule: (clubId: string, date: string) =>
    api.get(`/clubs/${clubId}/schedule/day?date=${date}`),

  // Create booking
  createBooking: (clubId: string, data: any) =>
    api.post(`/clubs/${clubId}/bookings`, data),

  // Get all customers
  getCustomers: (clubId: string, search?: string) =>
    api.get(`/clubs/${clubId}/customers${search ? `?search=${search}` : ''}`),

  // Create payment
  createPayment: (clubId: string, data: any) =>
    api.post(`/clubs/${clubId}/payments`, data),
};
```

---

### React/Next.js Customer Application

#### 1. Create Customer Auth Context

```typescript
// contexts/CustomerAuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  accessToken: string | null;
  requestOtp: (phone: string, bookingName: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string, clubId: string) => Promise<void>;
  resendOtp: (phone: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('customer_access_token');
    const customerData = localStorage.getItem('customer_data');
    
    if (token && customerData) {
      setAccessToken(token);
      setCustomer(JSON.parse(customerData));
    }
    setIsLoading(false);
  }, []);

  const requestOtp = async (phone: string, bookingName: string) => {
    const response = await axios.post(`${API_URL}/auth/customer/login`, {
      phone,
      bookingName,
    });
    return response.data;
  };

  const verifyOtp = async (phone: string, otp: string, clubId: string) => {
    const response = await axios.post(
      `${API_URL}/auth/customer/verify?clubId=${clubId}`,
      { phone, otp }
    );
    
    const { accessToken, customer } = response.data;
    setAccessToken(accessToken);
    setCustomer(customer);

    localStorage.setItem('customer_access_token', accessToken);
    localStorage.setItem('customer_data', JSON.stringify(customer));
  };

  const resendOtp = async (phone: string) => {
    const response = await axios.post(`${API_URL}/auth/customer/resend-otp`, { phone });
    return response.data;
  };

  const logout = () => {
    setAccessToken(null);
    setCustomer(null);
    localStorage.removeItem('customer_access_token');
    localStorage.removeItem('customer_data');
  };

  return (
    <CustomerAuthContext.Provider
      value={{ customer, accessToken, requestOtp, verifyOtp, resendOtp, logout, isLoading }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
};
```

#### 2. Customer Login/OTP Page

```typescript
// pages/customer/login.tsx
import React, { useState } from 'react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useRouter } from 'next/router';

const CLUB_ID = '674187c2e4b0a7e8f9d12345'; // Replace with your actual club ID

export default function CustomerLogin() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('+966');
  const [bookingName, setBookingName] = useState('');
  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState(''); // For development
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestOtp, verifyOtp, resendOtp } = useCustomerAuth();
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await requestOtp(phone, bookingName);
      setDevOtp(response.devOtp || ''); // Store dev OTP for testing
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOtp(phone, otp, CLUB_ID);
      router.push('/customer/booking');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await resendOtp(phone);
      setDevOtp(response.devOtp || '');
      alert('OTP resent successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-2">🎾 Padel Club</h2>
        <p className="text-center text-gray-600 mb-8">Book your court</p>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <input
                type="text"
                value={bookingName}
                onChange={(e) => setBookingName(e.target.value)}
                placeholder="Ahmed Ali"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+966501234567"
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Enter OTP sent to {phone}
              </label>
              {devOtp && (
                <div className="bg-yellow-50 border border-yellow-200 p-2 rounded mb-2 text-sm">
                  <strong>Dev OTP:</strong> {devOtp}
                </div>
              )}
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 text-center text-2xl tracking-widest"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="w-full text-green-600 py-2 hover:underline"
            >
              Resend OTP
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-gray-600 py-2 hover:underline"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
```

#### 3. Customer Booking Page

```typescript
// pages/customer/booking.tsx
import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:3000';
const CLUB_ID = '674187c2e4b0a7e8f9d12345';

interface Court {
  _id: string;
  name: string;
  defaultPricePerHour: number;
}

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export default function CustomerBooking() {
  const { customer, accessToken, logout } = useCustomerAuth();
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourts();
  }, []);

  useEffect(() => {
    if (selectedCourt && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedCourt, selectedDate]);

  const fetchCourts = async () => {
    try {
      const response = await axios.get(`${API_URL}/clubs/${CLUB_ID}/courts`);
      setCourts(response.data);
      if (response.data.length > 0) {
        setSelectedCourt(response.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch courts:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/clubs/${CLUB_ID}/schedule/day?date=${selectedDate}`
      );
      
      // Process bookings to find available slots
      const courtBookings = response.data.courts.find(
        (c: any) => c.courtId === selectedCourt
      )?.bookings || [];

      const slots = generateTimeSlots(courtBookings);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Failed to fetch schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (bookings: any[]): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 8;
    const endHour = 23;

    for (let hour = startHour; hour < endHour; hour++) {
      const start = `${hour.toString().padStart(2, '0')}:00`;
      const end = `${(hour + 1).toString().padStart(2, '0')}:30`;
      
      const isBooked = bookings.some((booking: any) => {
        const bookingStart = new Date(booking.startDateTime).getHours();
        const bookingEnd = new Date(booking.endDateTime).getHours();
        return hour >= bookingStart && hour < bookingEnd;
      });

      slots.push({ start, end, available: !isBooked });
    }

    return slots;
  };

  const handleBookSlot = async (slot: TimeSlot) => {
    if (!slot.available) return;

    setLoading(true);
    try {
      const [startHour, startMin] = slot.start.split(':').map(Number);
      const [endHour, endMin] = slot.end.split(':').map(Number);
      
      const startDateTime = new Date(selectedDate);
      startDateTime.setHours(startHour, startMin, 0, 0);
      
      const endDateTime = new Date(selectedDate);
      endDateTime.setHours(endHour, endMin, 0, 0);

      await axios.post(
        `${API_URL}/clubs/${CLUB_ID}/bookings`,
        {
          courtId: selectedCourt,
          customerId: customer?.id,
          bookingName: customer?.fullName,
          phone: customer?.phone,
          bookingType: 'SINGLE',
          startDateTime: startDateTime.toISOString(),
          endDateTime: endDateTime.toISOString(),
          price: 360,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      alert('Booking successful!');
      fetchAvailableSlots();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">🎾 Book a Court</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">{customer?.fullName}</span>
          <button onClick={logout} className="text-red-600 text-sm">Logout</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Court</label>
              <select
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                {courts.map((court) => (
                  <option key={court._id} value={court._id}>
                    {court.name} - {court.defaultPricePerHour} SAR/hr
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Available Time Slots</h2>
          
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((slot, index) => (
                <button
                  key={index}
                  onClick={() => handleBookSlot(slot)}
                  disabled={!slot.available || loading}
                  className={`p-4 rounded-lg border-2 transition ${
                    slot.available
                      ? 'border-green-500 bg-green-50 hover:bg-green-100 cursor-pointer'
                      : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                  }`}
                >
                  <div className="font-semibold">{slot.start} - {slot.end}</div>
                  <div className="text-sm text-gray-600">
                    {slot.available ? '✓ Available' : '✗ Booked'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## ⚠️ Error Handling

### Common Error Responses

```typescript
// 400 Bad Request
{
  "statusCode": 400,
  "message": ["phone must be a valid international phone number"],
  "error": "Bad Request"
}

// 401 Unauthorized
{
  "statusCode": 401,
  "message": "Invalid OTP",
  "error": "Unauthorized"
}

// 409 Conflict (Booking Overlap)
{
  "statusCode": 409,
  "message": "Court is already booked for this time slot",
  "error": "Conflict"
}
```

### Error Handling Example

```typescript
try {
  await api.post('/clubs/123/bookings', bookingData);
} catch (error) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    switch (status) {
      case 400:
        alert('Validation error: ' + (Array.isArray(message) ? message.join(', ') : message));
        break;
      case 401:
        alert('Unauthorized: Please login again');
        // Redirect to login
        break;
      case 409:
        alert('Time slot not available');
        break;
      default:
        alert('An error occurred');
    }
  }
}
```

---

## 🔒 Production Considerations

### For Customer OTP System:

1. **SMS Integration:**
   ```typescript
   // Install Twilio or AWS SNS
   npm install twilio
   
   // In auth.service.ts
   import twilio from 'twilio';
   
   const client = twilio(accountSid, authToken);
   
   await client.messages.create({
     body: `Your Padel Club OTP is: ${otp}`,
     from: '+1234567890',
     to: phone
   });
   ```

2. **Use Redis for OTP Storage:**
   ```typescript
   npm install @nestjs/redis redis
   
   // Store OTP in Redis with TTL
   await redis.setex(`otp:${phone}`, 300, otp);
   ```

3. **Rate Limiting:**
   ```typescript
   npm install @nestjs/throttler
   
   // Limit OTP requests per phone number
   @Throttle(3, 60) // 3 requests per minute
   @Post('customer/login')
   ```

4. **Remove `devOtp` in Production:**
   - Never return OTP in API response in production
   - Only send via SMS

---

## 📱 Quick Test Guide

### Test Admin Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@padelclub.com","password":"Admin@123"}'
```

### Test Customer OTP:
```bash
# Request OTP
curl -X POST http://localhost:3000/auth/customer/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"+966501234567","bookingName":"Ahmed Ali"}'

# Verify OTP (use devOtp from response)
curl -X POST "http://localhost:3000/auth/customer/verify?clubId=YOUR_CLUB_ID" \
  -H "Content-Type: application/json" \
  -d '{"phone":"+966501234567","otp":"123456"}'
```

---

## ✅ Complete Integration Checklist

### Admin Dashboard:
- [ ] Implement AdminAuthContext
- [ ] Create login page
- [ ] Setup API service with interceptors
- [ ] Add token refresh logic
- [ ] Protect admin routes
- [ ] Handle logout
- [ ] Display user info

### Customer Application:
- [ ] Implement CustomerAuthContext
- [ ] Create OTP login flow
- [ ] Add resend OTP functionality
- [ ] Show available time slots
- [ ] Implement booking creation
- [ ] Handle booking errors
- [ ] Add customer profile

---

## 🚀 Ready to Integrate!

Both authentication systems are now live and ready to use. Follow the code examples above to integrate with your frontend applications.

Need help? Check the complete working examples in this document!
