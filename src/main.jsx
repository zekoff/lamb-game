import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import { initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: "AIzaSyDXwMvsLX2aetiGN0887-v4lunhlf-NxkA",
    authDomain: "lamb-game.web.app",
    databaseURL: "https://lamb-game-default-rtdb.firebaseio.com",
    projectId: "lamb-game",
    storageBucket: "lamb-game.firebasestorage.app",
    messagingSenderId: "656900331",
    appId: "1:656900331:web:995a04dc3f5182d75b3eae",
    measurementId: "G-XT791C1712"
};
initializeApp(firebaseConfig);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
