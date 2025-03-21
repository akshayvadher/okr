import { useNetworkStatus } from "@/sync/network-status-memory";
import useSyncEngine from "@/sync/useSyncEngine";
import { useState } from "react";
import { useEffect } from "react";

const loadingMessages = [
    {
        title: "Teaching hamsters to code...",
        subtitle: "They're surprisingly good at it, just a bit slow"
    },
    {
        title: "Brewing coffee for the servers...",
        subtitle: "They prefer dark roast, but we're out"
    },
    {
        title: "Counting to infinity...",
        subtitle: "We're halfway there!"
    },
    {
        title: "Downloading more RAM...",
        subtitle: "Just kidding, that's not how it works"
    },
    {
        title: "Generating random excuses...",
        subtitle: "This one is actually true"
    },
    {
        title: "Calculating the meaning of life...",
        subtitle: "It's 42, but we're double-checking"
    },
    {
        title: "Reticulating splines...",
        subtitle: "No one knows what that means"
    },
    {
        title: "Loading awesome...",
        subtitle: "Please wait while we awesome-ify everything"
    },
    {
        title: "Warming up the quantum processor...",
        subtitle: "It's still in beta, but promising"
    },
    {
        title: "Convincing AI to be friendly...",
        subtitle: "It's asking too many questions"
    },
    {
        title: "Collecting unicorn sparkles...",
        subtitle: "The rainbow factory is running low"
    },
    {
        title: "Training the office plants...",
        subtitle: "They're learning photosynthesis 2.0"
    },
    {
        title: "Recharging the flux capacitor...",
        subtitle: "1.21 gigawatts coming right up"
    },
    {
        title: "Consulting the crystal ball...",
        subtitle: "It's a bit cloudy today"
    },
    {
        title: "Waking up the sleeping servers...",
        subtitle: "They had a late night"
    },
    {
        title: "Polishing the pixels...",
        subtitle: "Making them extra shiny"
    },
    {
        title: "Feeding the hamsters...",
        subtitle: "They need energy to code"
    },
    {
        title: "Untangling the cables...",
        subtitle: "The cat was here earlier"
    }
];

const AppLoading = ({ children }: { children: React.ReactNode }) => {
    useSyncEngine();
    const { status } = useNetworkStatus();
    const connecting = status === 'checking';
    const [messageIndex, setMessageIndex] = useState(0);

    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setMessageIndex(Math.floor(Math.random() * loadingMessages.length));
        setIsClient(true);
    }, [connecting]);

    if (!isClient) {
        return null;
    }

    if (connecting) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
                <div className="relative flex flex-col items-center">
                    {/* Main Spinner */}
                    <div className="relative w-32 h-32">
                        {/* Outer Ring */}
                        <div className="absolute inset-0 border-8 border-gray-200 rounded-full animate-wiggle"></div>
                        {/* Spinning Ring */}
                        <div className="absolute inset-0 border-8 border-transparent border-t-gray-900 rounded-full animate-spin-slow"></div>

                        {/* Magical Particles */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                            <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
                        </div>

                        {/* Sparkle Effects */}
                        <div className="absolute inset-0">
                            <div className="absolute top-0 left-0 w-2 h-2 bg-gray-900 rounded-full animate-sparkle" style={{ animationDelay: '0s' }}></div>
                            <div className="absolute top-0 right-0 w-2 h-2 bg-gray-900 rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }}></div>
                            <div className="absolute bottom-0 left-0 w-2 h-2 bg-gray-900 rounded-full animate-sparkle" style={{ animationDelay: '1s' }}></div>
                            <div className="absolute bottom-0 right-0 w-2 h-2 bg-gray-900 rounded-full animate-sparkle" style={{ animationDelay: '1.5s' }}></div>
                        </div>
                    </div>

                    {/* Loading Text */}
                    <div className="mt-8 text-center">
                        <h2 className="text-xl font-medium text-gray-900 animate-pulse-slow">
                            {loadingMessages[messageIndex].title}
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            {loadingMessages[messageIndex].subtitle}
                        </p>
                    </div>
                </div>
            </div>
        )
    }
    return children;
}

export default AppLoading;
