import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

export default function SEO({ title, description, name, type, url, imageUrl, keywords }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "ResumeAi Online Resume Analyzer",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": description,
    "url": url,
    "image": imageUrl,
  };

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="ResumeAi Online" />
      <meta property="og:image" content={imageUrl} />

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  url: PropTypes.string,
  imageUrl: PropTypes.string,
  keywords: PropTypes.string,
};

SEO.defaultProps = {
  title: "ResumeAi Online Resume Analyzer | Free AI Resume Review Tool",
  description: "ResumeAi Online Resume Analyzer helps you analyze and improve your resume using AI. Get instant resume feedback, ATS score, and career suggestions for free.",
  name: "ResumeAi Online",
  type: "website",
  url: "https://www.resumeaionline.in",
  imageUrl: "https://www.resumeaionline.in/SkillNova-Logo.png",
  keywords: "AI Resume Analyzer, Resume Checker, ATS Resume Score, Resume Review Tool, ResumeAi Online, Resume Optimization"
};
