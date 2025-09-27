# Tournament Creation & Registration Flow - Testing Guide

## Complete Flow Test

### 🎯 **Admin Creates Tournament → User Joins Tournament**

---

## 🔧 **Step 1: Start Backend Server**
```bash
cd backend
node server.js
# or
nodemon server.js
```

**Expected output:**
```
🚀 Server running on port 5000
✅ MongoDB connected successfully
📍 Database: tournament
```

---

## 🎨 **Step 2: Start Frontend**
```bash
cd frontend  
npm run dev
# or
bun run dev
```

**Expected output:**
```
➜  Local:   http://localhost:8081/
```

---

## 👤 **Step 3: Admin Login & Create Tournament**

1. **Go to Admin Portal:** `http://localhost:8081/admin/login`

2. **Login as Admin:**
   - **Email:** `admin@playswiftpay.com`
   - **Password:** `admin123`
   - **OR Email:** `subi@gmail.com` (with your password)

3. **Access Admin Dashboard:** Should redirect automatically

4. **Click "Create Tournament" button**

5. **Fill Tournament Details:**
   ```
   Tournament Name: "Cricket Championship 2025"
   Type: "Cricket"  
   Date: [Select future date]
   Max Participants: 50
   Entry Fee: 500
   Location: "Sports Complex"
   Description: "Annual cricket championship"
   ```

6. **Submit Tournament** → Should show success toast

---

## 👥 **Step 4: User Views & Joins Tournament**

1. **Go to Tournament List:** `http://localhost:8081/tournaments`

2. **Verify Tournament Appears:** 
   - Should see "Cricket Championship 2025"
   - Status: "upcoming" 
   - All details match what admin created

3. **Join Tournament:**
   - **If NOT logged in:** Click "Join Tournament" → Redirects to login
   - **If logged in:** Click "Join Tournament" → Success message

4. **Verify Registration:**
   - Button changes to "Joining..." during process
   - Success toast: "Successfully joined Cricket Championship 2025"
   - Participant count increases

---

## 🔄 **Step 5: Admin Sees Updated Data**

1. **Go back to Admin Dashboard:** `http://localhost:8081/admin/dashboard`

2. **Check Tournament Statistics:**
   - Total tournaments increased
   - Participant count updated
   - Revenue tracking updated

3. **View Tournament Details:**
   - Should show registered users
   - Participant count reflects new registrations

---

## ✅ **Expected Flow Results:**

### **Admin Side:**
- ✅ Can create tournaments successfully
- ✅ Tournaments appear in admin dashboard
- ✅ Real-time statistics update
- ✅ Can see participant registrations

### **User Side:**
- ✅ Can view all tournaments created by admin
- ✅ Can join upcoming tournaments
- ✅ Cannot join if already registered (gets error message)
- ✅ Cannot join completed/ongoing tournaments
- ✅ Authentication required for joining

### **Database:**
- ✅ Tournaments stored in MongoDB
- ✅ User registrations tracked
- ✅ Statistics calculated correctly

---

## 🐛 **Common Issues & Solutions:**

### **"Access Denied" Error:**
- Make sure you're using admin credentials
- Check that user role is set to 'admin'

### **"Cannot read toLocaleString" Error:**
- Backend server not running
- API returning unexpected data format
- Check console for detailed errors

### **Tournament Not Appearing:**
- Check backend console for creation success
- Verify API response format
- Check MongoDB connection

### **Join Tournament Not Working:**
- User must be logged in
- Check authentication token in localStorage
- Verify tournament status is "upcoming"

---

## 🎉 **Success Indicators:**

1. **Admin Dashboard shows real data from MongoDB**
2. **Tournaments created by admin appear in user tournament list**  
3. **Users can successfully register for tournaments**
4. **Statistics update in real-time**
5. **No console errors in browser or server**

---

## 🔗 **API Endpoints Used:**

- `POST /api/auth/login` - Admin/User login
- `GET /api/admin/dashboard` - Admin statistics  
- `POST /api/tournaments` - Create tournament (admin)
- `GET /api/tournaments` - List tournaments (users)
- `POST /api/tournaments/:id/register` - Join tournament (users)

This creates a complete **admin → create → user → join** tournament flow! 🎯