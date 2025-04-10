import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            JavaScript Interview Q&A
          </h1>
          <p className="text-gray-600">Create your account</p>
        </div>
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-md rounded-lg border border-gray-200",
              headerTitle: "text-xl font-semibold text-center",
              headerSubtitle: "text-center",
              socialButtonsBlockButton: "border border-gray-300",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
              footerActionLink: "text-blue-600 hover:text-blue-800"
            }
          }}
        />
      </div>
    </div>
  );
} 