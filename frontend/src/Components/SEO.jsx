import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, canonical }) => {
    const siteTitle = 'Shivalik Service Hub';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || "Shivalik Service Hub - Your trusted partner for digital services, pan cards, and more."} />
            <meta name="keywords" content={keywords || "shivalik service hub, digital services, pan card, online services, india"} />

            {/* Canonical URL */}
            {canonical && <link rel="canonical" href={canonical} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || "Shivalik Service Hub - Your trusted partner for digital services."} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || "Shivalik Service Hub - Your trusted partner for digital services."} />
        </Helmet>
    );
};

export default SEO;
