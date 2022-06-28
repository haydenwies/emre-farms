import { createContext, useEffect, useReducer } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '../backend/config';

export const AuthContext = createContext();

export const authReducer = (auth, action) => {
    switch (action.type) {
        case "LOG_IN":
            return { ...auth, ...action.payload }
        case "LOG_OUT":
            return { ...auth, user: null, userType: null }
        case "AUTH_LOADED":
            return { ...auth, ...action.payload, userLoaded: true }
        default:
            return auth;
    };
};

export const AuthContextProvider = ({ children }) => {
    const [authContext, dispatchAuthContext] = useReducer(authReducer, {
        user: null,
        userLoaded: false,
        userType: null
    });

    // Will run on app mount and check if user is already logged in, then sync response with authContext
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Fetch
                const docRef = doc(db, "users", user.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    dispatchAuthContext({ type: "AUTH_LOADED", payload: { 
                        user: user,
                        userType: docSnap.data().userType
                     } })
                } else {
                    throw new Error("Could not find user type.");
                }
            } else {
                dispatchAuthContext({ type: "AUTH_LOADED", payload: { 
                    user: null,
                    userType: null
                 } })
            }
        })
        unsubscribe()
    }, [])

    // console.log(authContext)

    return (
        <AuthContext.Provider value={{ ...authContext, dispatchAuthContext }} >
            { children }
        </AuthContext.Provider>
    )
}