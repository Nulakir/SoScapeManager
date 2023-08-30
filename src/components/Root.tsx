import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Outlet, useLocation } from "react-router-dom";
import Auth from "./Auth";
import { getDatabase, ref, set } from "firebase/database";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import App from "../App";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDJTq_zXGe7mp5og_SIUZx1u1NQny30fjU",
  authDomain: "soscape-93544.firebaseapp.com",
  databaseURL:
    "https://soscape-93544-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "soscape-93544",
  storageBucket: "soscape-93544.appspot.com",
  messagingSenderId: "378686563437",
  appId: "1:378686563437:web:36a8370c1ef012953b0b64",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

export default function Root(props) {
  const location = useLocation();
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <div>Initialising user...</div>;
  }

  if (user) {
    console.log(user);
    return <>{location.pathname === "/" ? <App /> : <Outlet />}</>;
  }

  return <Auth />;
}
