import RegisterPage from "@/components/RegisterPage";

export const metadata = {
    title: "Create Account — FastProxy",
    description: "Create your free FastProxy account.",
};

export default function RegisterRoute() {
    return (
        <div className="relative min-h-screen bg-background">
            <div className="bg-depth" />
            <div className="grain-overlay" />
            <RegisterPage />
        </div>
    );
}
