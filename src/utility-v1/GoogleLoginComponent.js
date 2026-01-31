import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate, useLocation } from "react-router-dom";

const allowedEmails = ["ammujgd@gmail.com", "illolam.anjana@gmail.com", "rcp.rahul@gmail.com"]; // Allowed emails

const GoogleLoginComponent = ({ setUserParent }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Get the location the user was trying to access
  const from = location.state?.from?.pathname || "/jewels";

  const handleSuccess = (credentialResponse) => {
    const jwt = credentialResponse.credential;

    // Decode JWT payload to get user information
    const userPayload = JSON.parse(atob(jwt.split(".")[1]));
    console.log("User Info:", userPayload);

    const email = userPayload.email;

    if (allowedEmails.includes(email)) {
      // Set user details if email is authorized
      setUser({
        name: userPayload.name,
        email: userPayload.email,
        picture: userPayload.picture,
      });
      setUserParent({
        name: userPayload.name,
        email: userPayload.email,
        picture: userPayload.picture,
      });
      sessionStorage.setItem("user", JSON.stringify(userPayload));
      setError(""); // Clear any previous error
      // Navigate to the original page or default to /welcome
      navigate("/jewels/sales", { replace: true });
    } else {
      // If email is not allowed, show error and do not set user
      setUser(null);
      setError("Access denied. Your email is not authorized.");
    }
  };

  const handleError = () => {
    console.error("Google Login Failed");
    setError("Google login failed. Please try again.");
  };

  return (
    <GoogleOAuthProvider clientId="354405613777-k3h1o5cu1o3v76giilfqbofggadq578e.apps.googleusercontent.com">
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2>Google Login</h2>
        {/* Render Google Login button if user is not logged in */}
        {!user && (
          <>
            <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
          </>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleLoginComponent;
