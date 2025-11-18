# Category Setup - Quick Start Guide

## What Changed?

Your project now has **automatic category management**! The 8 default categories are now stored in MongoDB and can be managed through the admin panel.

## How It Works

### 1. **Automatic Seeding on Server Start**
- When you start the backend server, it automatically checks if categories exist
- If the database is empty, it creates all 8 default categories:
  - Partner Program
  - Pan Card
  - Insurance
  - Service
  - Tax
  - Land Record
  - Certificate
  - Library
- These categories include their original images from your assets folder

### 2. **Dynamic Categories on Frontend**
- The home page (Hero section) now loads categories from the database
- Categories update instantly when you add/edit/delete from admin panel
- No need to restart the server or redeploy!

## Getting Started

### Step 1: Start Your Application

```bash
# Terminal 1 - Start Backend
cd backend
npm start
```

You should see in the console:
```
MongoDB connected successfully
✅ Successfully seeded 8 default categories
```
(Or "Categories already exist" if you've run it before)

```bash
# Terminal 2 - Start Frontend
npm run dev
```

### Step 2: View Categories

1. Open your browser: `http://localhost:5173`
2. You'll see all 8 categories on the home page with their images
3. Click any category to view products in that category

### Step 3: Manage Categories (Admin)

1. Login to admin: `http://localhost:5173/admin/login`
2. Go to "Categories" from the sidebar
3. You'll see all 8 default categories

**Now you can:**
- ✅ **Add new categories** - Click "Add Category" button
- ✅ **Edit categories** - Click "Edit" on any category to change name or image
- ✅ **Delete categories** - Click "Delete" to remove a category
- ✅ **Add products with categories** - Go to Products page, select category when adding product

## Example: Adding a New Category

1. Go to `/admin/categories`
2. Click "Add Category"
3. Fill in:
   - **Name**: "Passport Services"
   - **Slug**: Auto-generated as "passport-services"
   - **Image URL**: Paste any image URL (or leave empty)
4. Click "Add Category"
5. Check the home page - new category appears immediately!

## Example: Editing Existing Category

1. Find "Insurance" category in admin
2. Click "Edit"
3. Change **Image URL** to a new image
4. Click "Update Category"
5. Refresh home page - image updates!

## Important Notes

### Categories Are Now Stored in Database
- The 8 default categories are in MongoDB (not hardcoded)
- You can delete/modify them like any other category
- They persist across server restarts

### Products and Categories
When adding/editing products:
1. Select category from dropdown
2. Or add new category on-the-fly
3. Products filter correctly by category on frontend

### Images
- Default categories use local images from `/src/assets/`
- You can update them to use external URLs (e.g., Cloudinary, Imgur)
- External URLs will display directly
- Local paths are mapped to imported images

## Troubleshooting

### Categories not showing on home page?
1. Check backend is running
2. Open browser console - look for API errors
3. Verify MongoDB is connected
4. Go to `/admin/categories` to confirm categories exist

### Need to reset categories?
If you want to restore defaults:
1. Delete all categories from admin panel
2. Restart backend server
3. Auto-seed will run again and create default 8 categories

### Can't access admin panel?
Make sure you're logged in:
- URL: `http://localhost:5173/admin/login`
- Use your admin credentials

## File Structure

```
backend/
├── models/
│   └── Category.js           # Category schema with imageUrl
├── routes/
│   └── categories.js         # API routes (CRUD + seed)
└── scripts/
    └── autoSeedCategories.js # Auto-seed on startup

src/
└── Components/
    ├── Hero.jsx              # Displays categories dynamically
    ├── Category.jsx          # Shows products by category
    └── Admin/
        └── AdminCategories.jsx # Manage categories
```

## Summary

✅ **8 default categories auto-created on first run**
✅ **Fully manageable from admin panel**
✅ **Add unlimited new categories**
✅ **Delete or edit any category**
✅ **Home page updates automatically**
✅ **Product filtering works perfectly**

You now have complete control over categories without touching code!

---

**Need help?** Check the main guide: `CATEGORY_FEATURE_GUIDE.md`
