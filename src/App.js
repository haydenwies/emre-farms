import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Clients from './pages/clients/Clients'
import Login from './pages/login/Login';
import OrderPlacement from './pages/order-placement/OrderPlacement';
import OrderOverview from './pages/order-overview/OrderOverview';
import Settings from './pages/settings/Settings'

import './App.css';
import AuthRoutes from './pages/AuthRoutes';

function App() {
  return (
    <div className='App'>

    <BrowserRouter>
    
      <Routes>

        <Route path={'/login'} element={<Login />} />

        <Route path={'/*'} element={<AuthRoutes />} /> 

        {/* <Route path={'/order-overview'} element={<OrderOverview />} />
        <Route path={'/order-placement'} element={<OrderPlacement />} />
        <Route path={'/clients'} element={<Clients />} />
        <Route path={'/settings'} element={<Settings />} /> */}

      </Routes>

    </BrowserRouter>

    </div>
  );
}

export default App;
