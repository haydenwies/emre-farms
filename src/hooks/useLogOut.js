import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';

import { auth } from '../backend/config';
import { useAuthContext } from './useAuthContext';

export const useLogOut = () => {
    const [cancelled, setCancelled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { dispatchAuthContext } = useAuthContext();

    const logOut = async () => {
        setError(null)
        setLoading(true)

        try {
            await signOut(auth);

            dispatchAuthContext({ type: "LOG_OUT" });

            if (!cancelled) {
                setError(null);
                setLoading(false);
            };
        } catch(err) {
            setError(err.message);
            setLoading(false);
        };
    };

    useEffect(() => {
        return () => setCancelled(true);
    }, []);

    return { error, loading, logOut };
}