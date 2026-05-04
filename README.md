<!-- Test Commit: Visibility Engine Sync Verification -->
<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/activity.svg" width="60" alt="Activity Icon" />
  <h1 align="center">Client Visibility Engine</h1>
  <p align="center">
    <strong>An automated pipeline translating raw developer commits into client-friendly progress updates using AI.</strong>
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#installation">Installation</a> •
    <a href="#usage">Usage</a>
  </p>
</div>

---

## ✦ The Problem
Clients often ask, *"What's the status?"* or *"What did you guys work on this week?"* 
Developers push highly technical git commits (`fix: resolve N+1 query issue in user dashboard`) that mean nothing to non-technical business owners. 

## ✦ The Solution
The **Client Visibility Engine** bridges this gap entirely on autopilot. It intercepts GitHub webhook pushes, feeds the raw commits to an AI model (Hugging Face / Mistral), translates them into plain-English business value, and securely stores them. Clients get a real-time, read-only dashboard with a beautiful timeline of updates, and an automated cron job sends them a weekly summary email.

<br />

## ✨ Core Features

- **🤖 Automated AI Translation**: Converts developer jargon into professional updates automatically.
- **⚡ Real-Time Webhooks**: Instantly captures code pushes from GitHub.
- **🎨 Slab-Modernist Dashboard**: A premium, high-contrast UI for clients to view project progress in real-time.
- **📧 Automated Reporting**: Scheduled endpoints to aggregate and dispatch weekly summary reports.
- **🔒 Secure Architecture**: Implements Supabase Row Level Security (RLS) with dedicated Admin client bypassing for backend webhook processing.

<br />

## 🏗️ Architecture

![Architecture Flow](https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/git-branch.svg)

1. **Trigger**: Developer pushes code to GitHub.
2. **Ingestion**: GitHub fires a payload to Next.js API (`/api/webhooks/github`).
3. **Processing**: Hugging Face API translates the commit message.
4. **Storage**: Translated data is securely written to Supabase via Service Role Key.
5. **Visibility**: Client accesses the Next.js frontend to see the live timeline.

<br />

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Custom Slab-Modernist Theme)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **AI Processing**: [Hugging Face](https://huggingface.co/) (`@huggingface/inference`)
- **Icons**: [Lucide React](https://lucide.dev/)

<br />

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/padalarohit12/Client-Visibility-Engine.git
   cd Client-Visibility-Engine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
   SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
   HUGGINGFACE_API_KEY="your_hf_api_key"
   ```

4. **Initialize Database**
   Run the provided `schema.sql` file in your Supabase SQL Editor to create the necessary `Projects`, `Commits`, and `ClientPreferences` tables along with RLS policies.

5. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the client dashboard.

<br />

## 🪝 Usage (GitHub Webhook Setup)

1. Deploy the application to a provider like Vercel.
2. Navigate to your target GitHub Repository -> Settings -> Webhooks -> Add Webhook.
3. Set the Payload URL to `https://your-deployment-url.vercel.app/api/webhooks/github`.
4. Set the Content type to `application/json`.
5. Select **Just the push event** and save. 

Whenever code is pushed, the system will now automatically update your client dashboard!

---
<div align="center">
  <sub>Built with ❤️ for better client communication.</sub>
</div>
