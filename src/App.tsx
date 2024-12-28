import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import SignupForm from './components/auth/SignupForm'
import SigninForm from './components/auth/SiginForm'
import Layout from './Layout'

function App() {
return (
  <BrowserRouter>
  <Routes>
    <Route path='/' element={<Layout/>} />
    <Route path='/signup' element={<SignupForm/>} />
    <Route path='/login' element={<SigninForm/>} />
  </Routes>
  </BrowserRouter>
  )
}

export default App
