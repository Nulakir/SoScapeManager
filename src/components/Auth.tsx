import React from "react";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth } from "./Root";

export default function Auth(props: any) {
  const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth);

  return (
    <>
      <div className="grid place-items-center">
        <div className="grid bg-white py-8 px-6 rounded">
          User not signed in
          <button onClick={() => signInWithGoogle()}>
            Sign in with Google
          </button>
        </div>
      </div>
    </>
  );
}
