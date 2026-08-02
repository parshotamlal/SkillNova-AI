/**
 * SEO.jsx — Complete per-page SEO meta + structured data (JSON-LD)
 *
 * Usage (place at top of any page component):
 *
 *   <SEO
 *     title="..."
 *     description="..."
 *     url="/ats-resume-checker"
 *     keywords="..."
 *     schemaType="software"    // "software" | "article" | "faq" | "howto" | "breadcrumb"
 *     faqItems={[{ q, a }]}
 *     howToSteps={[{ name, text, url }]}
 *     breadcrumbs={[{ name, url }]}
 *     noindex={false}
 *   />
 */

import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const BASE_URL = 'https://www.resumeaionline.in';
const LOGO_URL = `${BASE_URL}/SkillNova-Logo.png`;
const SITE_NAME = 'ResumeAI Online';
const TWITTER_HANDLE = '@resumeaionline';

// ── Shared schema fragments ────────────────────────────────────────────────
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  alternateName: 'resumeaionline.in',
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: LOGO_URL,
    width: 200,
    height: 60,
  },
  sameAs: [
    'https://www.linkedin.com/company/resumeaionline',
    'https://twitter.com/resumeaionline',
    'https://github.com/parshotamlal',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['English', 'Hindi'],
    email: 'parshotamworks@gmail.com',
  },
  description:
    'AI-powered resume builder and ATS checker helping job seekers in India, USA, UK, Canada and Australia create professional resumes.',
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/templates?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'ResumeAI Online — AI Resume Builder & ATS Checker',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'INR',
    priceValidUntil: '2027-12-31',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '2847',
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    'AI Resume Builder',
    'ATS Resume Score Checker',
    '50+ Resume Templates',
    'Cover Letter Generator',
    'PDF Export',
    'Real-time ATS Optimization',
    'Resume for Freshers',
    'Software Engineer Resume',
  ],
  screenshot: `${BASE_URL}/SkillNova-Logo.png`,
  url: `${BASE_URL}/analyze`,
  publisher: organizationSchema,
};

// ── Default FAQ items (shown on Homepage) ─────────────────────────────────
const defaultFaqItems = [
  {
    q: 'How does the ATS Resume Checker work?',
    a: 'Our AI scans your resume against standard Applicant Tracking System (ATS) algorithms. It checks for keywords, formatting, section structure, and relevance to your job description to provide an ATS match score from 0–100 with actionable improvement tips.',
  },
  {
    q: 'Is ResumeAI Online free to use?',
    a: 'Yes! ResumeAI Online offers a completely free plan that allows you to analyze your resume, get ATS score feedback, and access essential templates to improve your job application — no credit card required.',
  },
  {
    q: 'How accurate is the AI resume feedback?',
    a: 'Our AI is trained on millions of successful resumes and job descriptions, delivering up to 98% accuracy in predicting ATS compatibility and identifying critical resume weaknesses.',
  },
  {
    q: 'What is an ATS resume?',
    a: 'An ATS (Applicant Tracking System) resume is formatted to be correctly parsed by software used by employers to filter applications. ATS resumes use standard formatting, relevant keywords, and avoid complex graphics or tables that confuse parsing software.',
  },
  {
    q: 'Can I build a resume for free without signing up?',
    a: 'Yes. You can start building your resume immediately without creating an account. Sign-up is only required when you are ready to download or save your resume.',
  },
  {
    q: 'What resume formats do you support?',
    a: 'We support PDF upload for ATS analysis. Our resume builder exports high-quality, ATS-friendly PDFs. We offer 50+ templates for roles including software engineers, freshers, data analysts, MBA graduates, and more.',
  },
];

// ── Build FAQ schema ────────────────────────────────────────────────────────
function buildFaqSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

// ── Build HowTo schema ─────────────────────────────────────────────────────
function buildHowToSchema(title, description, steps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description: description,
    totalTime: 'PT30M',
    step: steps.map(({ name, text, url: stepUrl }, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name,
      text,
      ...(stepUrl ? { url: `${BASE_URL}${stepUrl}` } : {}),
    })),
  };
}

// ── Build BreadcrumbList schema ────────────────────────────────────────────
function buildBreadcrumbSchema(crumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map(({ name, url: crumbUrl }, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: `${BASE_URL}${crumbUrl}`,
    })),
  };
}

// ── Main SEO Component ─────────────────────────────────────────────────────
export default function SEO({
  title,
  description,
  url,
  imageUrl,
  keywords,
  type,
  noindex,
  // Schema toggles
  showFaq,
  faqItems,
  showHowTo,
  howToTitle,
  howToDescription,
  howToSteps,
  showBreadcrumb,
  breadcrumbs,
  schemaType,   // 'software' | 'website' | 'page'
}) {
  const canonicalUrl = `${BASE_URL}${url}`;
  const ogImage = imageUrl || LOGO_URL;

  // Build the array of JSON-LD schemas to inject
  const schemas = [
    organizationSchema,
    websiteSchema,
  ];

  if (schemaType === 'software' || schemaType === 'home') {
    schemas.push(softwareSchema);
  }

  if (showFaq) {
    schemas.push(buildFaqSchema(faqItems && faqItems.length ? faqItems : defaultFaqItems));
  }

  if (showHowTo && howToSteps && howToSteps.length) {
    schemas.push(buildHowToSchema(howToTitle, howToDescription, howToSteps));
  }

  if (showBreadcrumb && breadcrumbs && breadcrumbs.length) {
    schemas.push(buildBreadcrumbSchema(breadcrumbs));
  }

  return (
    <Helmet>
      {/* ── Standard SEO ────────────────────────────────────────── */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      {noindex
        ? <meta name="robots" content="noindex, nofollow" />
        : <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      }

      {/* ── Open Graph ──────────────────────────────────────────── */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:locale:alternate" content="en_US" />

      {/* ── Twitter Card ────────────────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content="@parshotamsinghx" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* ── JSON-LD Structured Data ──────────────────────────────── */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

// ── PropTypes ──────────────────────────────────────────────────────────────
SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  url: PropTypes.string,
  imageUrl: PropTypes.string,
  keywords: PropTypes.string,
  type: PropTypes.string,
  noindex: PropTypes.bool,
  showFaq: PropTypes.bool,
  faqItems: PropTypes.arrayOf(PropTypes.shape({ q: PropTypes.string, a: PropTypes.string })),
  showHowTo: PropTypes.bool,
  howToTitle: PropTypes.string,
  howToDescription: PropTypes.string,
  howToSteps: PropTypes.arrayOf(
    PropTypes.shape({ name: PropTypes.string, text: PropTypes.string, url: PropTypes.string })
  ),
  showBreadcrumb: PropTypes.bool,
  breadcrumbs: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, url: PropTypes.string })),
  schemaType: PropTypes.oneOf(['software', 'website', 'home', 'page']),
};

SEO.defaultProps = {
  title: 'Free AI Resume Builder | ATS Resume Checker & Templates — ResumeAI Online',
  description:
    'Build a job-winning ATS resume in 5 minutes with AI. Free resume builder, ATS score checker, 50+ templates & cover letter generator. Trusted by 100,000+ job seekers.',
  url: '/',
  imageUrl: LOGO_URL,
  keywords:
    'AI resume builder, free resume builder, ATS resume checker, ATS score checker, resume templates, resume maker, online resume builder, resume for freshers, software engineer resume, resume builder India',
  type: 'website',
  noindex: false,
  showFaq: false,
  showHowTo: false,
  showBreadcrumb: false,
  schemaType: 'website',
};
