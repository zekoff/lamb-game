import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

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

// const app = initializeApp(firebaseConfig);
initializeApp(firebaseConfig);
console.log('ran initializeApp');
console.log(getDatabase());
// const database = getDatabase(app);
// console.log(app);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
