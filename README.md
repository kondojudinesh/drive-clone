# 📂 Drive Clone – Fullstack Cloud Storage App

A **Google Drive–like clone** built with **Flask + Supabase (backend)** and **React + TypeScript + Vite (frontend)**.
Supports **file upload, download, rename, trash, restore, permanent delete, and sharing links**.

Deployed on:

* 🌐 **Frontend (React)** → [Netlify](https://driveclonekd.netlify.app)
* ⚙️ **Backend (Flask API)** → [Render](https://drive-clone-zk28.onrender.com)

---

## 🚀 Features

✅ User Authentication (Signup/Login with JWT)
✅ Secure File Uploads via Supabase Storage
✅ File Management (list, search, rename, move to trash, restore, delete permanently)
✅ Trash auto-purge after 30 days
✅ Shareable File Links (public/private with tokens)
✅ Responsive UI (Grid/List views, search, filters)
✅ Fully deployed (Netlify + Render)

---

## 🛠️ Tech Stack

**Frontend (client):**

* ⚛️ React (Vite + TypeScript)
* 🎨 Tailwind CSS + Framer Motion + Lucide Icons
* 🔥 React Hot Toast (notifications)
* 📦 Axios (API requests)

**Backend (server):**

* 🐍 Flask (Python)
* 🔑 Flask-JWT-Extended (Auth)
* 🌍 Flask-CORS (CORS handling)
* 📦 Supabase (Database + Storage)
* 🔐 bcrypt (password hashing)

---

## 📂 Project Structure

```
drive-clone/
│
├── backend/                  # Flask API
│   ├── app.py                # Main entrypoint
│   ├── routes/               # Blueprints (auth, files)
│   ├── utils/                # Helpers (password, supabase)
│   ├── config/               # Supabase client config
│   └── requirements.txt      # Python dependencies
│
├── client/                   # React + Vite Frontend
│   ├── src/
│   │   ├── pages/            # Dashboard, Trash, Upload, Auth pages
│   │   ├── components/       # Sidebar, FileCard, ProtectedRoute
│   │   ├── context/          # Auth context provider
│   │   ├── services/         # API services (auth.ts, files.ts)
│   │   ├── App.tsx           # Routing setup
│   │   └── main.tsx          # Entry point
│   └── package.json



---

## ⚡ Setup Instructions

### 🔹 1. Clone Repo

```bash
git clone https://github.com/YOUR_USERNAME/drive-clone.git
cd drive-clone
```

---

### 🔹 2. Backend Setup (Flask + Supabase)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # (Mac/Linux)
venv\Scripts\activate     # (Windows)

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_role_key
JWT_SECRET_KEY=your_jwt_secret
```

Run locally:

```bash
python app.py
```

API available at → `http://localhost:5000`

---

### 🔹 3. Frontend Setup (React + Vite + TS)

```bash
cd client
npm install
```

Create `.env` in `client/`:

```
VITE_API_URL=http://localhost:5000
```

Run locally:

```bash
npm run dev
```

Frontend available at → `http://localhost:5173`

---

## 🌍 Deployment

### 🔹 Backend (Render)

* Push `backend/` to GitHub
* Create **Web Service** in Render
* Add env vars from `.env`
* Start command:

  ```bash
  gunicorn app:app --bind 0.0.0.0:$PORT
  ```

### 🔹 Frontend (Netlify)

* Push `client/` to GitHub
* Deploy via Netlify
* Add environment variable:

  ```
  VITE_API_URL=https://your-render-backend.onrender.com
  ```

---

## 📸 Screenshots

**Landing Page**
![Landing](https://dummyimage.com/800x400/ddd/000\&text=Landing+Page)

**Dashboard**
![Dashboard](https://dummyimage.com/800x400/ddd/000\&text=Dashboard)

**Trash**
![Trash](https://dummyimage.com/800x400/ddd/000\&text=Trash+Page)

---

## 🧑‍💻 Author

👤 **Your Name**

* GitHub: [@kondojudinesh](https://github.com/dinesh)

