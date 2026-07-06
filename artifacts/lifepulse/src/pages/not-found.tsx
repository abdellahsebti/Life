export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold text-slate-800 mb-2">404</h1>
      <p className="text-slate-500 mb-6">Oops! The page you're looking for doesn't exist.</p>
      <a href="/" className="px-6 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors">
        Go Home
      </a>
    </div>
  );
}