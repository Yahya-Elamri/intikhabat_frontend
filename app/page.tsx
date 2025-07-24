"use client"
import Image from "./components/image";
import { getRolesFromToken } from "./utils/getRole";
import React, { useState,useEffect } from "react";
import { isValidString } from "./utils/validateString";
import { Formats, ICUArgs, ICUTags, MarkupTagsFunction, NestedValueOf, RichTagsFunction, useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ArrowRight, LogIn, Mail, MapPin, Phone } from "lucide-react";
import NonlogedHeader from "./components/NonlogedHeader";
import Link from "next/link";
import Footer from "./components/Footer";


function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState("");
  const t = useTranslations('home');

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const role = getRolesFromToken();
  useEffect(() => {
    // Check for the presence of the authToken in cookies
    if (isValidString(role)) {
      setIsAuthenticated(true);
    } else {
      // If token exists, assume authenticated
      setIsAuthenticated(false);
    }
  }, []);

  // While authentication check is in progress, don't render anything
  if (isAuthenticated === null) {
    return null; // You can show a loading spinner here if you'd like
  }
  // If not authenticated, return null or a redirect page
  if (isAuthenticated) {
    
  }


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (res.ok) {
        
      } else {
        setResponse("Error: Invalid email or password");
      }
    } catch (error) {
      if (error instanceof Error) {
        // TypeScript now knows 'error' is of type 'Error'
        setResponse(`Error dyal catch: ${error.message}`);
      } else {
        // Fallback for unexpected types
        setResponse("An unknown error occurred");
      }
    }
  };
  
  return (
      <div className="w-full">
        <NonlogedHeader></NonlogedHeader>
        <section className="bg-white py-20">
        <div className="container mx-auto px-8">
          <div className="flex items-center justify-around gap-20">

            {/* Left Side - Text Content */}
            <div className="flex-1 max-w-xl">
              <h1 className="text-5xl font-medium text-gray-900 leading-tight mb-6">
                {t('herotitle')} <br />
                <span className="text-red-600">{t('herotitlehighlight')}</span> <br />
                <span className="text-3xl text-gray-700">{t('herotitlesub')}</span>
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed mb-10">
                {t('herodescription')}
              </p>

              {/* Login Button */}
              <div className="flex items-center gap-4">
                <Link href="/login" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  {t('herologin')}
                </Link>

                <button className="text-gray-600 hover:text-gray-900 px-4 py-3 font-medium transition-colors">
                  {t('heromore')}
                </button>
              </div>
            </div>

            {/* Right Side - Image */}
            <Image
              src="/assets/hero2.png"
              fallbackSrc="/api/placeholder/450/350"
              className="w-96"
              alt={"image d'election"}
            />
          </div>
        </div>
      </section>  
      <Footer />     
      </div>
  );
}

export default Home;

