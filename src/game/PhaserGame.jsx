import PropTypes from 'prop-types';
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import StartGame from './main';
import { EventBus } from './EventBus';
import { getDatabase } from 'firebase/database';
import { get, child, ref as fbDbRef } from 'firebase/database';
export const PhaserGame = forwardRef(function PhaserGame({ currentActiveScene }, ref) {
    const game = useRef();
    const [lambs, setLambs] = useState([]);
    const firebaseListenerSet = useRef(false); // Ref to track if the listener is set
    const [phaserLoaded, setPhaserLoaded] = useState(false);

    useEffect(() => {
        // const app = getApp();
        // const database = getDatabase(app);
        if (!firebaseListenerSet.current && phaserLoaded) {

            const database = getDatabase();
            const dbRef = fbDbRef(database);

            get(child(dbRef, '/')).then((snapshot) => {
                if (snapshot.exists()) {
                    console.log(snapshot.val());
                    EventBus.emit('lamb-data-loaded', snapshot.val());
                    setLambs(snapshot.val());
                } else {
                    console.log('No data available');
                }
            }).catch((error) => {
                console.error(error);
            });
            // console.log('in useEffect in PhaserGame');
            // return () => {
            //     console.log('unmounting PhaserGame');
            //     if (game.current)
            //     {
            //         game.current.destroy(true);
            //         game.current = undefined;
            //     }
            // }
            // TODO disconnect cleanly from database
            firebaseListenerSet.current = true;
        }

    }, [phaserLoaded]);

    // Create the game inside a useLayoutEffect hook to avoid the game being created outside the DOM
    useLayoutEffect(() => {

        console.log('inside useLayoutEffect in PhaserGame');

        if (game.current === undefined) {
            game.current = StartGame("game-container");

            if (ref !== null) {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () => {

            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
            }

        }
    }, [ref]);

    useEffect(() => {

        // console.log(getApp());
        console.log('firebase database', getDatabase());
        // console.log(database);
        console.log('in useeffect in PhaserGame');

        EventBus.on('current-scene-ready', (currentScene) => {
            setPhaserLoaded(true);
            if (currentActiveScene instanceof Function) {
                currentActiveScene(currentScene);
            }
            ref.current.scene = currentScene;

        });

        return () => {

            EventBus.removeListener('current-scene-ready');

        }

    }, [currentActiveScene, ref])

    return (
        <div id="game-container"></div>
    );

});

// Props definitions
PhaserGame.propTypes = {
    currentActiveScene: PropTypes.func
}
