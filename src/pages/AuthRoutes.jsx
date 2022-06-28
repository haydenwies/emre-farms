import { Navigate, Route, Routes } from 'react-router-dom';

import { useAuthContext } from '../hooks/useAuthContext';

import Nav from '../components/Nav';
import Clients from './clients/Clients'
import OrderPlacement from './order-placement/OrderPlacement';
import OrderOverview from './order-overview/OrderOverview';
import Settings from './settings/Settings'

export default function AuthRoutes() {
    const { user } = useAuthContext();

    if (!user) {
        return <Navigate to={"/login"}/>
    } else {
        return (
            <>
                <Nav />
                <Routes>
                    <Route path={'/'} element={''} />
                    <Route path={'/order-overview'} element={<OrderOverview />} />
                    <Route path={'/order-placement'} element={<OrderPlacement />} />
                    <Route path={'/clients'} element={<Clients />} />
                    <Route path={'/settings'} element={<Settings />} />
                </Routes>
            </>
        )
    }
}
