import { FcGoogle } from "react-icons/fc";
 
export default function GoogleSignupButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-3 px-6 h-12 min-w-[240px] bg-white border border-gray-300 rounded-2xl text-sm font-medium text-gray-700 cursor-pointer select-none transition-all duration-150 hover:bg-gray-50 hover:shadow-md hover:border-gray-400 active:scale-95 active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <FcGoogle size={20} />
      <span className="tracking-wide">Continue with Google</span>
    </button>
  );
}