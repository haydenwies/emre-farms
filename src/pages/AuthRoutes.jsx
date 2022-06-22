import { Route, Routes, useLocation } from 'react-router-dom';

import Nav from '../components/Nav';
import Clients from './clients/Clients'
import OrderPlacement from './order-placement/OrderPlacement';
import OrderOverview from './order-overview/OrderOverview';
import Settings from './settings/Settings'

import './AuthRoutes.css'

export default function AuthRoutes() {

    return (
        <div className="auth-routes" >
            <Nav />
            <Routes>
                <Route path={'/order-overview'} element={<OrderOverview />} />
                <Route path={'/order-placement'} element={<OrderPlacement />} />
                <Route path={`/clients`} element={<Clients />} />
                <Route path={'/settings'} element={<Settings />} />

            </Routes>
        </div>
    )
}
