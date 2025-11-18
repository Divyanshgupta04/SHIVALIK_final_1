# Troubleshooting - Categories Not Showing

## ✅ What I've Done:

1. **Seeded all 8 categories into MongoDB** - DONE ✓
   - Partner Program
   - Pan Card  
   - Insurance
   - Service
   - Tax
   - Land Record
   - Certificate
   - Library

2. **Verified API is working** - The endpoint `http://localhost:5000/api/categories` returns all categories correctly ✓

3. **Added debug logging to frontend** - You'll now see console logs when categories are fetched ✓

## 🔍 Steps to Debug:

### Step 1: Check if Backend is Running
```bash
# Make sure your backend server is running
cd C:\Users\hp\Desktop\host2\backend
npm start
```

You should see:
```
MongoDB connected successfully
✅ Categories already exist (8 found). Skipping auto-seed.
Server running on port 5000
```

### Step 2: Test API Manually
Open a browser and go to:
```
http://localhost:5000/api/categories
```

You should see JSON with 8-9 categories including names, slugs, and imageUrls.

### Step 3: Check Frontend is Running
```bash
# In another terminal
cd C:\Users\hp\Desktop\host2
npm run dev
```

Open `http://localhost:5173` in your browser.

### Step 4: Check Browser Console
1. Open the home page: `http://localhost:5173`
2. Open browser console (F12 or Right-click → Inspect → Console)
3. Look for these messages:
   ```
   Fetching categories from API...
   API Response: {success: true, categories: Array(8)}
   Mapped categories: Array(8)
   ```

### Step 5: Check for Errors

**Common Issues:**

1. **CORS Error in console?**
   - Make sure backend is running on port 5000
   - Check that frontend is on port 5173
   - Verify CORS settings in `backend/server.js` allow localhost:5173

2. **"Failed to fetch categories" error?**
   - Backend might not be running
   - Check backend console for errors
   - Verify MongoDB is running

3. **Categories array is empty?**
   - Check browser console logs
   - Verify API returns data: `http://localhost:5000/api/categories`
   - Check network tab in browser dev tools

4. **Images not showing?**
   - The images should map correctly from database paths
   - Check console for any image loading errors
   - Verify the localImages mapping in Hero.jsx

### Step 6: Check Admin Panel

Go to: `http://localhost:5173/admin/categories`

You should see all 8 categories with edit/delete buttons.

**Can you see categories here?**
- **YES**: The issue is only in the Hero component display
- **NO**: There's an API or auth issue

### Step 7: Clear Cache and Refresh

Sometimes the browser caches old code:
1. Press `Ctrl + Shift + R` (hard refresh)
2. Or clear browser cache
3. Restart the Vite dev server

## 📋 Quick Test Commands:

### Test 1: Check Database
```bash
cd C:\Users\hp\Desktop\host2\backend
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/shivalik_service_hub').then(async () => { const Category = require('./models/Category'); const count = await Category.countDocuments(); console.log('Total categories:', count); const cats = await Category.find(); cats.forEach(c => console.log('-', c.name, '(' + c.slug + ')')); mongoose.connection.close(); });"
```

Expected output: Lists all 8 categories

### Test 2: Test API
```powershell
curl http://localhost:5000/api/categories | ConvertFrom-Json | Select-Object -ExpandProperty categories | Format-Table name, slug
```

Expected output: Table with all category names and slugs

## 🎯 What To Send Me:

If it's still not working, please share:

1. **Backend console output** (when you start `npm start` in backend folder)
2. **Browser console output** (F12 → Console tab, on home page)
3. **Network tab** (F12 → Network tab, filter by "categories", refresh page)
4. **Screenshot** of what you see on the home page

## 🔧 Manual Fix (If Needed):

If categories still don't show, run this to re-seed:
```bash
cd C:\Users\hp\Desktop\host2\backend
node scripts/seedCategoriesNow.js
```

Then restart both backend and frontend.

---

**The categories ARE in your database now - we just need to verify they're displaying correctly!**
