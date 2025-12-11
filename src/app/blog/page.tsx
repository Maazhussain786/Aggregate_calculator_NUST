import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'NUST Admission Blog | Tips & Guides',
  description: 'Read tips, guides, and insights about NUST admissions, NET preparation, and more.',
  alternates: {
    canonical: '/blog',
  },
};

// Placeholder blog posts
const blogPosts = [
  {
    id: '1',
    title: 'How to Prepare for NUST NET 2025',
    excerpt: 'A comprehensive guide to preparing for the NUST Entry Test, including study resources, time management tips, and strategies for each section.',
    date: '2025-01-15',
    category: 'Preparation',
    readTime: '8 min read',
  },
  {
    id: '2',
    title: 'Understanding NUST Aggregate Formula',
    excerpt: 'Deep dive into how NUST calculates aggregate scores, what each component means, and how to maximize your overall score.',
    date: '2025-01-10',
    category: 'Guide',
    readTime: '5 min read',
  },
  {
    id: '3',
    title: 'NUST Merit Lists Explained',
    excerpt: 'Everything you need to know about NUST merit lists - how they work, what to expect, and how to track your status.',
    date: '2025-01-05',
    category: 'Guide',
    readTime: '6 min read',
  },
];

export default function BlogPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <section className="py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
            Blog
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Tips, guides, and insights for NUST aspirants
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {blogPosts.map((post) => (
              <article 
                key={post.id}
                className="card rounded-2xl p-6 md:p-8 hover:border-[var(--accent-primary)] transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-[var(--success-light)] text-[var(--success)] text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-[var(--text-muted)]">{post.date}</span>
                  <span className="text-sm text-[var(--text-muted)]">•</span>
                  <span className="text-sm text-[var(--text-muted)]">{post.readTime}</span>
                </div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-3 hover:text-[var(--accent-primary)] transition-colors">
                  <Link href={`/blog/${post.id}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="text-[var(--text-secondary)] mb-4">{post.excerpt}</p>
                <Link 
                  href={`/blog/${post.id}`}
                  className="text-[var(--accent-primary)] text-sm font-medium hover:underline transition-colors"
                >
                  Read more →
                </Link>
              </article>
            ))}
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-12 p-6 card rounded-2xl text-center">
            <p className="text-[var(--text-secondary)]">
              More articles coming soon! Check back regularly for updates.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

