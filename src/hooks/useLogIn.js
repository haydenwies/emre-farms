import { useEffect, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '../backend/config';
import { useAuthContext } from './useAuthContext'

export const useLogIn = () => {
    const [cancelled, setCancelled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { dispatchAuthContext } = useAuthContext()

    const logIn = async (email, password) => {
        setError(null);
        setLoading(true);

        try  {
            const credentials = await signInWithEmailAndPassword(auth, email, password);
            const user = credentials.user
            // Fetch user permissions
            const docRef = doc(db, "users", user.uid)
            const docSnap = await getDoc(docRef)
            
            if (docSnap.exists()) {
                dispatchAuthContext({ type: "LOG_IN", payload: { 
                    user: credentials.user, 
                    userType: docSnap.data().userType 
                } });
            } else {
                throw new Error("Could not find user type.");
            };

            if (!cancelled) {
                setError(null);
                setLoading(false);
            };
        } catch(err) {
            setError(err.message);
            setLoading(false);
        };
    };

    // Fires if page is closed after login initiates and before it's complete
    useEffect(() => {
        return () => setCancelled(true);
    }, []);

    return { error, loading, logIn };
}