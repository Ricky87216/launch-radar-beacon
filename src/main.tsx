import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import './styles/dashboard.css' // Import our dashboard styles

import App from './App.tsx'

createRoot(document.getElementById("root")!).render(<App />);
