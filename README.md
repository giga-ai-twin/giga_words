# GigaWords — Personal AI Vocabulary Learning App

![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=for-the-badge&logo=google-gemini&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

GigaWords is a minimalist, Google-inspired vocabulary learning application designed for efficiency and aesthetics. It leverages AI to provide contextual analysis, accurate translations, and seamless cross-device synchronization.

## 🌟 Key Features

- **Google Minimalist UI**: A clean, light-themed Material Design interface for focused learning.
- **AI-Powered Analysis**: Integrated with **Google Gemini (Flash Vision)** for contextual word analysis, Traditional Chinese translations, and DJ/KK phonetics.
- **Contextual OCR**: Upload screenshots to automatically extract and analyze target words within their original context.
- **Progressive Web App (PWA)**: Install GigaWords directly on your iPhone or Android device for a native app experience.
- **Cloud Sync**: Real-time synchronization across devices using **Supabase (PostgreSQL)**.
- **Interactive Flashcards**: Premium study mode with high-quality TTS (US/UK) and familiarity tracking (1-5 stars).

## 🛠️ Tech Stack

- **Frontend**: Vite, React, Framer Motion, Lucide React
- **Backend / DB**: Supabase (PostgreSQL)
- **AI Engine**: Google Gemini API (@google/generative-ai)
- **Deployment**: GitHub Pages
- **Local Cache**: Dexie.js (IndexedDB)

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest stable version)
- npm or yarn
- [Google Gemini API Key](https://aistudio.google.com/app/apikey) (Get it for free here)
- [Supabase Project URL & Anon Key](https://supabase.com/) (Sign up for free here)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/giga-ai-twin/giga_words.git
   cd giga_words
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Setup:
   Create a `.env` file in the root directory and add your keys:
   ```env
   VITE_GEMINI_API_KEY="your_api_key"
   VITE_SUPABASE_URL="your_supabase_url"
   VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
   ```

4. Run locally:
   ```bash
   npm run dev
   ```

## 📱 Mobile Installation

On iOS (Safari):
1. Navigate to the live URL.
2. Tap the **Share** button.
3. Select **Add to Home Screen**.

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

*GigaWords is designed for personal learning and research purposes.*
