import {addDoc, collection, getDocs, getFirestore, orderBy, query, where} from "firebase/firestore/lite";
import {firebaseApp} from './config'

const db = getFirestore(firebaseApp);
const path = 'daily_results'

//Runs query for all results on a supplied wordle.
//Order bys amount of guesses
async function queryByResults(wordle) {
    return (
        await getDocs(
            query(collection(db, path), where('wordle', '==', wordle), orderBy('guess', "asc"), orderBy('submissionTime'))
        )
    );
}

//Upload object into firestore and generates the time it was uploaded
async function uploadResults(user, result, message, wordle, guess) {
    return (await addDoc(collection(db, path), {
        user: user,
        result: result,
        message: message,
        submissionTime: Date.now(),
        wordle: wordle,
        guess: guess
    }));
}

export {queryByResults, uploadResults};
