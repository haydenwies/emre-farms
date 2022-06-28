import { BrowserRouter, Route, Routes } from 'react-router-dom'

import { useAuthContext } from './hooks/useAuthContext';

import AuthRoutes from './pages/AuthRoutes';
import Login from './pages/login/Login';
import Loading from './components/Loading'

import './App.css';


export default function App() {
  const { userLoaded } = useAuthContext();

  if (userLoaded) {
    return (
      <div className='app'>
        <BrowserRouter>
          <Routes>
            <Route path={'/login'} element={<Login />} />
            <Route path={'/*'} element={<AuthRoutes />} /> 
          </Routes>
        </BrowserRouter>
      </div>
    )
  } else {
    return (
      <Loading />
    )
  }
}