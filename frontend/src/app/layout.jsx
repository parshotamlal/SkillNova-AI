import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  metadataBase: new URL("https://www.resumeaionline.in"),
  title: {
    default: "Free AI Resume Builder | ATS Resume Checker & Templates — ResumeAI Online",
    template: "%s | ResumeAI Online",
  },
  description:
    "Build a job-winning ATS resume in 5 minutes with AI. Free resume builder, ATS score checker, 50+ templates & cover letter generator. Trusted by 100,000+ job seekers in India, USA, UK & Canada.",
  keywords: [
    "AI resume builder",
    "free resume builder",
    "ATS resume checker",
    "ATS score checker",
    "resume templates",
    "resume maker",
    "online resume builder",
    "cover letter generator",
    "resume for freshers",
    "software engineer resume",
    "resume builder India",
  ],
  authors: [{ name: "ResumeAI Online" }, { name: "Parshotam Lal", url: "https://github.com/parshotamlal" }],
  creator: "ResumeAI Online",
  publisher: "ResumeAI Online",
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/resumeaionlinelogo.png",
    apple: "/resumeaionlinelogo.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://www.resumeaionline.in/",
    languages: {
      "en-IN": "https://www.resumeaionline.in/",
      "en-US": "https://www.resumeaionline.in/",
      "en-GB": "https://www.resumeaionline.in/",
      "en-CA": "https://www.resumeaionline.in/",
      "en-AU": "https://www.resumeaionline.in/",
      "x-default": "https://www.resumeaionline.in/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://www.resumeaionline.in/",
    siteName: "ResumeAI Online",
    title: "Free AI Resume Builder | ATS Resume Checker — ResumeAI Online",
    description: "Build a job-winning ATS resume in 5 minutes with AI. Free resume builder, ATS score checker & 50+ templates.",
    images: [
      {
        url: "/resumeaionlinelogo.png",
        width: 1200,
        height: 630,
        alt: "ResumeAI Online Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Resume Builder | ATS Resume Checker",
    description: "Build a job-winning ATS resume in 5 minutes. Free AI resume builder for freshers, engineers & professionals.",
    creator: "@parshotamsinghx",
    site: "@resumeaionline",
    images: ["/resumeaionlinelogo.png"],
  },
  verification: {
    google: "JAh_Z3chAYsF6HUtlSeZYCth5Se6R1pgqWMo8VmIyH0",
  },
  other: {
    "geo.region": "IN",
    "geo.placename": "India",
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.resumeaionline.in/#organization",
        name: "ResumeAI Online",
        alternateName: ["resumeaionline.in", "SkillNova AI", "ResumeAI"],
        url: "https://www.resumeaionline.in",
        logo: {
          "@type": "ImageObject",
          url: "https://www.resumeaionline.in/resumeaionlinelogo.png",
          width: 200,
          height: 60,
        },
        sameAs: [
          "https://www.linkedin.com/company/resumeaionline",
          "https://twitter.com/resumeaionline",
          "https://github.com/parshotamlal",
        ],
        founder: {
          "@type": "Person",
          name: "Parshotam Lal",
          url: "https://github.com/parshotamlal",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          availableLanguage: ["English", "Hindi"],
          email: "parshotamworks@gmail.com",
        },
      },
      {
        "@type": "WebSite",
        "@id": "https://www.resumeaionline.in/#website",
        url: "https://www.resumeaionline.in",
        name: "ResumeAI Online",
        publisher: {
          "@id": "https://www.resumeaionline.in/#organization",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: "https://www.resumeaionline.in/templates?q={search_term_string}",
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "SoftwareApplication",
        name: "ResumeAI Online — AI Resume Builder & ATS Checker",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web Browser",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "INR",
          priceValidUntil: "2027-12-31",
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          ratingCount: "3420",
          bestRating: "5",
          worstRating: "1",
        },
        featureList: [
          "AI Resume Builder",
          "ATS Resume Score Checker",
          "50+ ATS-Friendly Resume Templates",
          "Cover Letter Generator",
          "PDF Export with Zero Formatting Errors",
          "Real-time ATS Optimization & Keyword Analysis",
        ],
        url: "https://www.resumeaionline.in/",
      },
      {
        "@type": "FAQPage",
        "@id": "https://www.resumeaionline.in/#faq",
        mainEntity: [
          {
            "@type": "Question",
            name: "How does the AI Resume Builder and ATS Checker work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "ResumeAI Online analyzes your resume against industry-standard ATS algorithms and job descriptions to evaluate formatting, keyword matching, and quantifiable achievements, giving you a detailed score and AI suggestions to reach 90%+ ATS score.",
            },
          },
          {
            "@type": "Question",
            name: "Is ResumeAI Online completely free to use?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes! You can build resumes, test ATS compatibility scores, and download standard ATS-optimized PDF resumes for free.",
            },
          },
          {
            "@type": "Question",
            name: "Are the resume templates ATS friendly?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes, all 50+ resume templates on ResumeAI Online are designed with clean typography, standard headers, and single/dual column hierarchies tested against top ATS parsers like Workday, Greenhouse, Taleo, and Lever.",
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#2563eb" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="https://googleads.g.doubleclick.net" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap"
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2264259885457570"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
