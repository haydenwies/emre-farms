import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useLogIn } from '../../hooks/useLogIn';
import { useAuthContext } from '../../hooks/useAuthContext';

import './Login.css'

export default function Login() {
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { logIn } = useLogIn();
    const { user } = useAuthContext();

    const handleSubmit = () => {
        logIn(email, password)
    };

    if (user) {

        return <Navigate to={'/'} />

    } else {

        return (
            <div className='login'>
                <div className="pannel">
                    <div className="login-frame">
                        <h1>emre farms manager</h1>
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            handleSubmit()
                        }}>
                            <div className="fields">
                                <input 
                                    type="email" 
                                    placeholder="email"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    required
                                />
                                <input 
                                    type="password" 
                                    placeholder="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    value={password}
                                    required
                                />
                            </div>
                            <button>
                                login
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        )

    }
}
