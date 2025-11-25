"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const VerifyEmail = () => {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");
  const router=useRouter();

  const searchParams = useSearchParams();
  const verifyToken = searchParams.get("token");
  const id = searchParams.get("id");

  const initialized = useRef(false);

  useEffect(() => {
   
      if (!initialized.current) {
      initialized.current = true;
      verifyEmail();
    }
  }, []);

  const verifyEmail = async () => {
    if (!verifyToken || !id) {
      setError(true);
      setMessage("Invalid URL.");
      return;
    }

    setLoading(true);
    setError(false);
    setVerified(false);

    try {
        console.log('data',verifyToken)
      const res = await fetch(
        `/api/auth/verify-email?verifyToken=${verifyToken}&id=${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        setVerified(true);
        setMessage("Your email has been verified successfully.");
        setTimeout(() => {
    router.push("/login"); // or whatever your login page route is
  }, 3000);
      } else {
        const data = await res.json();
        setError(true);
        setMessage(data.error || "An error occurred during verification.");
      }
    } catch (err) {
      console.error(err);
      setError(true);
      setMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.5rem' }}>
        Verifying your Email address. Please wait...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        {verified && (
          <div style={{ color: 'green', textAlign: 'center' }}>
            <h2>Email Verified! ✅</h2>
            <p>{message}</p>
          </div>
        )}

        {error && (
          <div style={{ color: 'red', textAlign: 'center' }}>
            <h2>Verification Failed! ❌</h2>
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;