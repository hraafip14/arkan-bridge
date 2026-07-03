import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { use } from "react";

/**
 * Jalankan fungsi ini SEKALI SAJA dari browser console atau
 * panggil sementara di main.jsx, lalu hapus file ini.
 */

export const seedSuperAdmin = async () => {
    const username = "SuperAdminArkanBRIDGE";
    const password = "9SuperAdmin9";
    const internalEmail = `${username.toLowerCase()}@arkanbridge.app`;

    try {
        const cred = await createUserWithEmailAndPassword(auth, internalEmail, password);
        await setDoc(doc(db, "users", cred.user.uid), {
            username: username,
            name: "Super Admin Arkan Bridge",
            role: "super_admin",
            createdAt: new Date(),
        });

        console.log("Super Admin seeded successfully!");
    } catch (error) {
        console.error("Error seeding Super Admin:", error);
    }
};