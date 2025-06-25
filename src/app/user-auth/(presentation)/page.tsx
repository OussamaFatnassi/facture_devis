import Link from 'next/link';

export default function UserAuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Invoice & Quotation System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please sign in to your account or create a new one
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/user-auth/login"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign In
          </Link>
          
          <Link
            href="/user-auth/signup"
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Account
          </Link>
        </div>

        <div className="text-center">
          <Link href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
