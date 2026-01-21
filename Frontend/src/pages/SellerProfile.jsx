import { useEffect, useState } from "react";
import SellerLayout from "../layout/SellerLayout";
import "../styles/SellerProfile.css";

export default function SellerProfile() {
    const sellerId = localStorage.getItem("userId");

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    if (!sellerId) {
        return <p className="auth-warning">Please login as seller.</p>;
    }

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const res = await fetch(`/api/v1/seller/user/${sellerId}`);

            if (!res.ok) {
                throw new Error("Failed to load seller profile");
            }

            const data = await res.json();
            setProfile(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <SellerLayout>
            <div className="seller-profile">
                <header className="profile-header">
                    <h1>Seller Profile</h1>
                    <p className="subtitle">
                        View your account and store information
                    </p>
                </header>

                {loading && <p className="muted">Loading profile...</p>}
                {error && <p className="error">{error}</p>}

                {profile && (
                    <section className="card profile-card">

                        <div className="profile-row">
                            <span>Email</span>
                            <strong>{profile.email}</strong>
                        </div>

                        <div className="profile-row">
                            <span>Store Name</span>
                            <strong>{profile.storeName}</strong>
                        </div>

                        <div className="profile-row">
                            <span>Status</span>
                            <span className={`badge ${profile.status?.toLowerCase()}`}>
                                {profile.status}
                            </span>
                        </div>

                        <div className="profile-row">
                            <span>Joined</span>
                            <strong>
                                {new Date(profile.createdAt).toLocaleDateString()}
                            </strong>
                        </div>
                    </section>
                )}
            </div>
        </SellerLayout>
    );
}
