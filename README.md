Ek recruiter ya mentor jab aapka GitHub dekhta hai, toh **README.md** hi woh pehli cheez hoti hai jo unhe impress karti hai. Aapke Figma-style editor ke liye maine ek professional aur detailed README taiyar ki hai jo aapke logic aur approach ko effectively show-case karegi.

---

# 🎨 Figma-Style DOM Editor

**A professional, web-based design tool built with pure JavaScript logic and state-driven architecture.**

---

## 🚀 Overview

Is project ka maksad ek aisa interactive environment banana hai jahan users bina kisi heavy software ke browser mein hi UI layouts design kar sakein. Ye editor pure DOM manipulation par based hai, jisme har ek element ko ek "Object" ki tarah treat kiya jata hai.

### ✨ Key Features

- **Dynamic Shape Creation:** Rectangles, Circles, Triangles aur Text components ko instant add karne ki suvidha.
- **Image Integration:** Kisi bhi web URL se images ko canvas par fetch aur manipulate karne ka option.
- **Advanced Transformation:** \* **Drag & Drop:** Smooth movement logic.
- **Multi-point Resizing:** 8-way resizing handles.
- **Rotation:** Custom math-based rotation logic ( formula ka upyog karke).

- **Smart Layers System:** macOS jaisa layers panel jahan se aap elements ki visibility aur depth (z-index) control kar sakte hain.
- **Robust History:** 50-step Undo/Redo system jo JSON snapshots ka use karta hai.
- **Pro Exports:** Apne design ko `.json` (backup) ya ready-to-use `.html` code mein export karein.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, JavaScript (ES6+)
- **Styling:** SCSS (Glassmorphism & macOS Aesthetic)
- **Deployment:** Vercel
- **State Persistence:** LocalStorage API

---

## 🧠 Approach & Logic

Maine is project ko **"State-to-UI"** principle par banaya hai:

1. **State Management:** Poore canvas ka data ek centralized `elements` array mein store hota hai.

   > _Example Object:_ `{ id: 'el_1', type: 'rect', x: 100, y: 100, w: 200, h: 100, rotate: 0, bg: '#3b82f6' }`

2. **The Rendering Engine:** Jab bhi koi property (jaise color ya size) change hoti hai, `render()` function trigger hota hai jo state ke basis par DOM nodes ko optimize tarike se update karta hai.
3. **Coordinate Math:** Resizing aur boundaries ke liye maine custom math logic likha hai taaki elements canvas se bahar na nikal sakein ( & limits).

---

## ⏱️ Project Timeline & Development

- **Total Time Taken:** ~28 Hours (Logic building, UI refinement, and bug fixing).
- **AI Disclosure:** Maine AI tools ka upyog complex geometry math (rotation calculations) aur code optimization techniques ke liye kiya hai.
- **Last Commit:** 23rd January 2026 (strictly adhering to the 24th Jan deadline).

---

## 📂 Project Structure

```bash
├── index.html       # Application Structure
├── style.css        # Core UI & Glassmorphism
├── script.js       # Main Engine (Logic, Drag, Resize, History)
└── images/          # Icons and static images

```

---

## 🔧 Installation & Setup

1. Repo clone karein:

```bash
git clone https://github.com/ritikweb22/figma-style-dom.git

```

2. `index.html` ko kisi bhi browser mein open karein ya Live Server use karein.

---

### 👨‍💻 Developed by

**[Ritik]**

---

**Tip:** README mein `https://figma-style-dom.vercel.app/` ki jagah apna asli link zaroor daal dena.

**Kya aap chahte hain ki main aapke GitHub ke liye ek achha "About" section ya "Social Preview Image" generate karne mein madad karun?**
