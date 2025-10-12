// Ruta: cucurucho-frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            await authService.login(username, password);
            // --- CORRECCIÓN AQUÍ ---
            // Redirigimos a "/pos" que es la nueva página principal para usuarios autenticados.
            navigate('/pos');
        } catch (err) {
            setError('Usuario o contraseña incorrectos.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h1 className="login-logo">🍦 Cucurucho Digital</h1>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Usuario o Email"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Contraseña"
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Iniciar Sesión</button>
                    {error && <p className="login-error">{error}</p>}
                </form>
            </div>
        </div>
    );
}

export default LoginPage;