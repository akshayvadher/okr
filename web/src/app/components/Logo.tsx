const Logo = ({ className = "" }: { className?: string }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative w-8 h-8">
                {/* Main Circle */}
                <div className="absolute inset-0 border-4 border-gray-900 rounded-full"></div>
                {/* Spinning Segment */}
                <div className="absolute inset-0 border-4 border-transparent border-t-gray-900 rounded-full animate-spin-slow"></div>
                {/* Center Dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                </div>
            </div>
            <span className="text-xl font-semibold text-gray-900">OKR</span>
        </div>
    );
};

export default Logo; 