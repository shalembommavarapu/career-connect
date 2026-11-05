import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Users, Globe, ArrowRight } from 'lucide-react';

const COMPANIES = [
  {
    name: 'Google Cloud',
    logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=120&h=120&fit=crop',
    industry: 'Cloud Infrastructure & AI',
    location: 'Bengaluru / Hyderabad',
    size: '10,000+ employees',
    description: 'Empowering organizations to transform their businesses through enterprise cloud, generative AI, and high-scale Kubernetes compute.',
    openRoles: 4,
    searchKeyword: 'Google'
  },
  {
    name: 'Stripe',
    logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=120&h=120&fit=crop',
    industry: 'Financial Technology (FinTech)',
    location: 'Remote (Pan India)',
    size: '5,000+ employees',
    description: 'Financial infrastructure for the internet, powering billions of online transactions for startups and Fortune 500s.',
    openRoles: 3,
    searchKeyword: 'Stripe'
  },
  {
    name: 'Cisco Systems',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&h=120&fit=crop',
    industry: 'Computer Networks & Security',
    location: 'Bengaluru, Karnataka',
    size: '10,000+ employees',
    description: 'Global technology leader connecting the world through secure networking, cloud infrastructure, and collaboration tools.',
    openRoles: 2,
    searchKeyword: 'Cisco'
  },
  {
    name: 'Zomato',
    logo: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?w=120&h=120&fit=crop',
    industry: 'Consumer Internet & Logistics',
    location: 'Gurugram, Haryana / Remote',
    size: '3,000+ employees',
    description: 'Building high-scale consumer commerce platforms serving tens of millions of food and grocery orders daily.',
    openRoles: 2,
    searchKeyword: 'Zomato'
  },
  {
    name: 'Samsung R&D Institute',
    logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=120&h=120&fit=crop',
    industry: 'Advanced AI & Research',
    location: 'Noida, Uttar Pradesh',
    size: '8,000+ employees',
    description: 'Pioneering frontier research in machine learning, deep neural architectures, and intelligent embedded systems.',
    openRoles: 1,
    searchKeyword: 'Samsung'
  }
];

export const CompaniesPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-slate-200/80 dark:border-dark-border">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Top Hiring Companies
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore organizations and startups actively hiring college students and freshers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMPANIES.map((company, idx) => (
          <div
            key={idx}
            className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border shadow-sm flex flex-col justify-between hover:border-brand-500/50 transition-all"
          >
            <div>
              <div className="flex items-start space-x-3.5 mb-4">
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-100 dark:border-dark-border flex-shrink-0"
                />
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    {company.name}
                  </h3>
                  <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold block">
                    {company.industry}
                  </span>
                  <div className="flex items-center space-x-1 text-slate-400 text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{company.location}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {company.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-dark-border flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {company.openRoles} Active Requisitions
              </span>
              <Link
                to={`/jobs?search=${encodeURIComponent(company.searchKeyword)}`}
                className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-500"
              >
                <span>View Roles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
