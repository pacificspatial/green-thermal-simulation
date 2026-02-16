import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import dayjs from 'dayjs'
import utc from "dayjs/plugin/utc.js"
import timezone from "dayjs/plugin/timezone.js"
import {getApps, initializeApp} from "firebase/app"
import "dayjs/locale/ja"
import "./main.css"
import {CssBaseline, ThemeProvider, createTheme} from "@mui/material"
import {LocalizationProvider} from "@mui/x-date-pickers"
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs"
import {ComposeProvider} from "@_components/composeProvider.jsx"
import {DialogProvider} from "@_components/dialog.jsx"
import {ToastContainer} from "react-toastify"
import _ from "ansuko"
import {ErrorBoundary} from "react-error-boundary"
import ErrorFallback from "@_src/error.jsx"
import { AppDataProvider } from "@team4am/fp-core"

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("Asia/Tokyo")
dayjs.locale("ja")

if (_.size(getApps()) === 0) {
    initializeApp({
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    })
}

const lightTheme = createTheme({
    palette: {
        mode: 'light',
    },
});

document.title = import.meta.env.VITE_PROJECT_SHORT_NAME

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <ThemeProvider theme={lightTheme}>
          <CssBaseline />
          <ErrorBoundary FallbackComponent={ErrorFallback} onError={console.error}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ja">
                  <ComposeProvider providers={[DialogProvider,AppDataProvider]}>
                      <App />
                      <ToastContainer />
                  </ComposeProvider>
              </LocalizationProvider>
          </ErrorBoundary>
      </ThemeProvider>
  </StrictMode>,
)
