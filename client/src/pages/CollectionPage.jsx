import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import Seo from "../components/Seo";
import { TwinklingStars } from "../components/ChristmasEffects";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { COLLECTIONS, getCollectionBySlug, productInCollection } from "../data/collections";

export default function CollectionPage({ products = [], addToCart }) {
  const { settings } = useSiteSettings();
  const { slug } = useParams();
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return <Navigate to="/" replace />;
  }

  const collectionProducts = products.filter((product) => productInCollection(product, collection));

  return (
    <div >
      <Seo
        title={collection.title}
        description={collection.description}
        type="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: collection.title,
          description: collection.description,
          url: new URL(
            `/collections/${collection.slug}`,
            settings.siteUrl || window.location.origin,
          ).toString(),
        }}
      />

      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_#7e22ce_0%,_#3b0764_55%,_#1e0533_100%)] text-white">
        <TwinklingStars count={18} />
        <div className="relative z-[3] mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] font-extrabold text-gold-200">
            {collection.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold text-white sm:text-6xl">
            {collection.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-royal-100">
            {collection.hero}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {COLLECTIONS.map((item) => (
              <Link
                key={item.slug}
                to={`/collections/${item.slug}`}
                className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                  item.slug === collection.slug
                    ? "bg-gold-300 text-royal-900 shadow-lg"
                    : "bg-white/10 text-white ring-1 ring-white/30 hover:bg-white/20"
                }`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {collectionProducts.length > 0 ? (
          <div className="grid justify-items-center gap-6 [grid-template-columns:repeat(auto-fill,minmax(230px,1fr))]">
            {collectionProducts.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[32px] border border-dashed border-royal-300 bg-white p-12 text-center">
            <h2 className="font-display text-3xl text-royal-950">
              New bows are being tied right now! 🎀
            </h2>
            <p className="mt-4 text-sm leading-7 text-royal-600">
              Check back soon, or see every bow in the shop.
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-royal-950 px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              See all bows
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
