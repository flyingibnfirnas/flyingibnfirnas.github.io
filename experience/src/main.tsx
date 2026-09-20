import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { preloadExperienceModels } from './lib/preloadModels'

function hideBootSplash() {
  const splash = document.getElementById('boot-splash')
  if (!splash) return
  splash.classList.add('hide')
  window.setTimeout(() => splash.remove(), 400)
}

function showBootError(message: string) {
  const splash = document.getElementById('boot-splash')
  const text = document.getElementById('boot-splash-text')
  if (text) {
    text.className = 'err'
    text.textContent = message
  }
  if (splash) splash.classList.remove('hide')
}

const rootEl = document.getElementById('root')
if (!rootEl) {
  showBootError('Page failed to start. Try a hard refresh.')
} else {
  try {
    preloadExperienceModels()
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    // Let first paint land, then drop the HTML splash
    requestAnimationFrame(() => {
      requestAnimationFrame(hideBootSplash)
    })
  } catch (err) {
    console.error(err)
    showBootError('Something went wrong loading the journey. Hard-refresh, or open /journey/ in a private window.')
  }
}

window.addEventListener('error', () => {
  // Keep splash visible only if React never painted UI
  if (!document.querySelector('.chapter-ui')) {
    showBootError('The journey hit a browser error. Try Chrome/Edge, or hard-refresh.')
  }
})
