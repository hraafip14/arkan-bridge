import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./config";

const buildInternalEmail = (username) => {
    return `${username.toLowerCase()}@arkanbridge.app`;
};

export const loginWithUsername = async (username, password) => {
    const internalEmail = buildInternalEmail(username);

    const userCredential = await signInWithEmailAndPassword(auth, internalEmail, password);
    const userDocRef = doc(db, "users", userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        await signOut(auth);
        throw new Error("User data not found. Please contact Super Admin.");
    }

    return {
        uid: userCredential.user.uid,
        ...userDoc.data(),
    };
};

export const logoutUser = async () => {
    await signOut(auth);
}