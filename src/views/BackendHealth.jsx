import { useEffect, useState } from "react";
import api from "../api/axios";

function BackendHealth() {

    const [status, setStatus] = useState("Checking backend...");
    const [error, setError] = useState("");

    useEffect(() => {

        const checkBackend = async () => {

            try {

                const response = await api.get("/api/health");

                setStatus(response.data);

            } catch (error) {

                console.error(
                    "Backend connection failed:",
                    error
                );

                setStatus("");
                setError(
                    error.response?.data?.message ||
                    error.message ||
                    "Unable to connect to backend"
                );
            }
        };

        checkBackend();

    }, []);

    return (
        <div style={{ padding: "40px" }}>

            <h1>Backend Connection Test</h1>

            {status && (
                <p>
                    {status}
                </p>
            )}

            {error && (
                <p>
                    Backend connection failed: {error}
                </p>
            )}

        </div>
    );
}

export default BackendHealth;