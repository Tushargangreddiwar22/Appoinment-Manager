import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { TodoIndex } from './to-do/todo-index.jsx'
import {CookiesProvider} from 'react-cookie';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CookiesProvider>
      <TodoIndex />
    </CookiesProvider>
  </StrictMode>,
)
