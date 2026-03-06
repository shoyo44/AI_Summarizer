# AI Summarizer — Modern AI Content Hub

AI Summarizer is a powerful, full-stack application that leverages Cloudflare's Workers AI (Llama 3.1 & Stable Diffusion) to provide advanced content generation, document analysis, and detailed usage insights. It features a premium "Midnight Atelier" design aesthetic with a robust backend powered by FastAPI and MongoDB.

## 🚀 Key Features

- **Multi-Role AI Analysis**: Choose from specialized AI personas (e.g., Key Points Extraction, SEO Optimizer, Proofreader) to tailor your results.
- **Smart Document Uploads**: Seamlessly parse and analyze **PDF, DOCX, and TXT** files directly in the browser.
- **Advanced Analytics Dashboard**:
  - Weekly usage visualization (12-week timeline).
  - Stat tracking (Total Analyses, Avg Words/Analysis, Day Streaks).
  - Category and Top Use-case breakdowns.
- **Public Sharing**: Generate unique, secure links to share your AI results with anyone—no login required for viewers.
- **Export Capabilities**: Download results as professionally formatted **PDF** or **Markdown** files.
- **History Management**: Keep track of all your past analyses with a searchable, secure history vault.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Vanilla CSS (Midnight Atelier design system)
- **State & Logic**: Context API + Custom Hooks
- **Libraries**: Firebase Auth, PDF.js, Mammoth.js, Recharts, Lucide Icons

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: MongoDB Atlas (Async Motor driver)
- **Authentication**: Firebase Admin SDK
- **AI Engine**: Cloudflare Workers AI (Rest API)
- **Deployment**: Render (Backend) & Vercel (Frontend)

## 📁 Project Structure

```text
AI_Summary/
├── Back_end/           # FastAPI Python server
│   ├── api.py          # Main application logic
│   ├── requirements.txt
│   └── render.yaml     # Render deployment config
├── Front_end/          # React + Vite frontend
│   ├── src/
│   │   ├── components/ # UI Components (Dashboard, Analytics, etc.)
│   │   ├── lib/        # API and Utility functions
│   │   └── contexts/   # Auth state management
│   ├── public/         # Static assets
│   └── vercel.json     # Vercel deployment config
└── README.md
```

## ⚙️ Setup & Installation

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shoyo44/AI_Summarizer.git
   cd AI_Summarizer
   ```

2. **Backend Setup**:
   ```bash
   cd Back_end
   pip install -r requirements.txt
   # Create a .env file with your mongo, cloudflare, and firebase keys
   uvicorn api:app --reload
   ```

3. **Frontend Setup**:
   ```bash
   cd ../Front_end
   npm install
   # Create a .env file with your VITE_FIREBASE_* and VITE_API_URL keys
   npm run dev
   ```

## 🌐 Deployment

### Backend (Render)
- **Root Directory**: `Back_end`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn api:app --host 0.0.0.0 --port $PORT`
- **Python Version**: 3.11.7 (managed via `.python-version`)

### Frontend (Vercel)
- **Root Directory**: `Front_end`
- **Framework Preset**: `Vite`
- **Env Var**: `VITE_API_URL` pointing to your Render backend.

## 📄 License

Open-source project created by **shoyo44**.
