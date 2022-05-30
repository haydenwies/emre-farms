import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import './Login.css'

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Replace with context
    const user = "";

    const handleSubmit = () => {
        // 
    };

    if (user) {

        <Navigate to={'/'} />

    } else {

        return (
            <div className='login'>
                <div className="pannel">
                    <form onSubmit={handleSubmit}>
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
                        <button>
                            login
                        </button>
                    </form>
                </div>
            </div>
        )

    }
}
