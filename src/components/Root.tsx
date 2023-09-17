import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Outlet, useLocation } from "react-router-dom";
import Auth from "./Auth";
import { getDatabase, ref, set } from "firebase/database";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import App from "../App";
import { getStorage } from "firebase/storage";

// Initialize Firebase
const firebaseConfigMain = {
  apiKey: "AIzaSyDJTq_zXGe7mp5og_SIUZx1u1NQny30fjU",
  authDomain: "soscape-93544.firebaseapp.com",
  databaseURL:
    "https://soscape-93544-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "soscape-93544",
  storageBucket: "soscape-93544.appspot.com",
  messagingSenderId: "378686563437",
  appId: "1:378686563437:web:36a8370c1ef012953b0b64",
};

const firebaseConfigManager = {
  apiKey: "AIzaSyB7u8mLeE2MTllenMuDAVY7KY3TAAYqavA",
  authDomain: "soscapemanager.firebaseapp.com",
  projectId: "soscapemanager",
  storageBucket: "soscapemanager.appspot.com",
  messagingSenderId: "205911616592",
  appId: "1:205911616592:web:d19692eb3e4fbd6c577555"
};

const appManager = initializeApp(firebaseConfigManager);
const appMain = initializeApp(firebaseConfigMain);
export const auth = getAuth(appMain);
export const db = getDatabase(appMain);
export const storage = getStorage(appMain);

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
