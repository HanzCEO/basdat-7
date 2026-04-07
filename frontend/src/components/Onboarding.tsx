import { useState, useEffect } from "react";
import "./Onboarding.scss";

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: "Selamat Datang di MakanAntar",
    description: "Pesan makanan favorit dari restoran terdekat dengan mudah dan cepat",
    icon: (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="#EBF5FF"/>
        <rect x="70" y="60" width="60" height="90" rx="8" fill="#2563EB"/>
        <rect x="78" y="68" width="44" height="50" rx="4" fill="#FFFFFF"/>
        <circle cx="100" cy="85" r="12" fill="#FBBF24"/>
        <rect x="85" y="125" width="30" height="4" rx="2" fill="#FFFFFF"/>
        <rect x="85" y="133" width="20" height="4" rx="2" fill="#FFFFFF"/>
        <path d="M140 100L160 85L160 115L140 100Z" fill="#2563EB"/>
      </svg>
    ),
  },
  {
    id: 2,
    title: "Pilih Menu Favorit",
    description: "Telusuri berbagai menu dari restoran mitra dan pilih sesuai selera Anda",
    icon: (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="#FEF3C7"/>
        <rect x="50" y="55" width="100" height="90" rx="12" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="3"/>
        <rect x="60" y="70" width="35" height="35" rx="6" fill="#F59E0B"/>
        <rect x="105" y="70" width="35" height="35" rx="6" fill="#FBBF24"/>
        <rect x="60" y="115" width="80" height="8" rx="4" fill="#E5E7EB"/>
        <rect x="60" y="128" width="60" height="8" rx="4" fill="#E5E7EB"/>
      </svg>
    ),
  },
  {
    id: 3,
    title: "Driver Profesional",
    description: "Driver terverifikasi mengantar pesanan Anda dengan cepat dan aman",
    icon: (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="#D1FAE5"/>
        <circle cx="100" cy="80" r="25" fill="#2563EB"/>
        <path d="M60 160C60 130 80 115 100 115C120 115 140 130 140 160" fill="#2563EB"/>
        <rect x="55" y="130" width="30" height="40" rx="8" fill="#2563EB"/>
        <rect x="115" y="130" width="30" height="40" rx="8" fill="#2563EB"/>
        <circle cx="70" cy="170" r="12" fill="#1F2937" stroke="#2563EB" strokeWidth="3"/>
        <circle cx="130" cy="170" r="12" fill="#1F2937" stroke="#2563EB" strokeWidth="3"/>
        <path d="M85 75C85 75 92 85 100 85C108 85 115 75 115 75" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 4,
    title: "Lacak Pengiriman",
    description: "Pantau status pesanan secara real-time dari dapur hingga tujuan",
    icon: (
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="80" fill="#E0E7FF"/>
        <rect x="40" y="50" width="120" height="80" rx="8" fill="#FFFFFF"/>
        <path d="M55 90L80 65L100 80L130 55L145 70" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="55" cy="90" r="6" fill="#2563EB"/>
        <circle cx="80" cy="65" r="6" fill="#2563EB"/>
        <circle cx="100" cy="80" r="6" fill="#2563EB"/>
        <circle cx="130" cy="55" r="6" fill="#2563EB"/>
        <circle cx="145" cy="70" r="6" fill="#10B981"/>
        <rect x="55" y="105" width="30" height="6" rx="3" fill="#E5E7EB"/>
        <rect x="55" y="115" width="50" height="6" rx="3" fill="#E5E7EB"/>
      </svg>
    ),
  },
];

const STORAGE_KEY = "makanantar_onboarding_completed";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const totalSlides = slides.length;
  const isLastSlide = currentSlide === totalSlides - 1;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleNext = () => {
    if (isLastSlide) {
      handleComplete();
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    onComplete();
  };

  const handleDotClick = (index: number) => {
    if (index !== currentSlide) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide(index);
        setIsAnimating(false);
      }, 300);
    }
  };

  return (
    <div className="onboarding">
      <div className="onboarding-content">
        <button className="onboarding-skip" onClick={handleSkip}>
          Lewati
        </button>

        <div className={`onboarding-slides ${isAnimating ? "animating" : ""}`}>
          <div
            className="onboarding-slide"
            key={currentSlide}
          >
            <div className="onboarding-icon">{slides[currentSlide].icon}</div>
            <h1 className="onboarding-title">{slides[currentSlide].title}</h1>
            <p className="onboarding-description">
              {slides[currentSlide].description}
            </p>
          </div>
        </div>

        <div className="onboarding-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`onboarding-dot ${index === currentSlide ? "active" : ""}`}
              onClick={() => handleDotClick(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button className="onboarding-next" onClick={handleNext}>
          {isLastSlide ? "Mulai" : "Berikutnya"}
        </button>
      </div>
    </div>
  );
}

export function checkOnboardingCompleted(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true";
}