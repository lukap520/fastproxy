import LoginPage from "@/components/LoginPage";

export const metadata = {
    title: "Log In — FastProxy",
    description: "Sign in to your FastProxy account.",
};

export default function LoginRoute() {
    return (
        <div className="relative min-h-screen bg-background">
            <div className="bg-depth" />
            <div className="grain-overlay" />
            <LoginPage />
        </div>
    );
}
