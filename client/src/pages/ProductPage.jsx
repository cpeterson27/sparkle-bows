import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Gift, Minus, Plus, Scissors, ShoppingBag, Star, Truck } from "lucide-react";
import Confetti from "../components/Confetti";
import Seo from "../components/Seo";
import { SparkleIcon } from "../components/ChristmasEffects";
import { fetchProductById } from "../api/products";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { trackViewItem } from "../lib/analytics";
import { BUNDLE, DEFAULT_MADE_TO_ORDER_DAYS, FREE_SHIPPING_THRESHOLD, OCCASIONS, PERSONALIZATION_FEE, styleLabel } from "../config/shop";

function formatPrice(price) {
  return `$${Number(price || 0).toFixed(2)}`;
}

const DEFAULT_SAFETY_WARNING =
  "WARNING: Contains small parts. Not intended for children under 3. Use with adult supervision. Remove before sleeping.";

function formatReviewDate(value) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString();
}

function Stars({ value, size = "h-4 w-4" }) {
  return (
    <span className="flex items-center gap-0.5 text-gold-400">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={`${size} ${index < Math.round(value) ? "fill-current" : ""}`} />
      ))}
    </span>
  );
}

export default function ProductPage({ products = [], onAddToCart, user, onAddReview }) {
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const { id } = useParams();
  const productFromList = useMemo(() => products.find((item) => item._id === id || item.id === id), [id, products]);
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(!productFromList);
  const product = productFromList || fetchedProduct;

  const [quantity, setQuantity] = useState(1);
  const [personalization, setPersonalization] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    if (productFromList) {
      setFetchedProduct(null);
      setProductLoading(false);
      return;
    }

    let active = true;
    setProductLoading(true);
    setFetchedProduct(null);

    fetchProductById(id)
      .then(({ data }) => {
        if (active) setFetchedProduct(data);
      })
      .catch(() => {
        if (active) setFetchedProduct(null);
      })
      .finally(() => {
        if (active) setProductLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, productFromList]);

  useEffect(() => {
    if (product?._id) trackViewItem(product);
  }, [product]);

  // A new bow always starts on its first photo.
  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setPersonalization("");
  }, [id]);

  if (productLoading && !product) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-candy-500 border-t-transparent" />
          <p className="mt-4 text-sm font-bold text-royal-600">Loading this bow...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] px-4 py-20">
        <div className="mx-auto max-w-xl rounded-[36px] bg-white p-10 text-center shadow-[0_20px_50px_-25px_rgba(91,33,182,0.45)] ring-1 ring-royal-100">
          <p className="text-5xl">🎀</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-royal-950">We couldn't find that bow.</h1>
          <p className="mt-3 text-base leading-7 text-royal-700/80">It may have been taken down. Come see the bows in the shop!</p>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-candy-500 to-royal-600 px-6 py-3 text-sm font-bold text-white shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to shop
          </button>
        </div>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [{ url: "/logo.svg", alt: product.name }];

  const reviewCount = product.reviews?.length || 0;
  const averageRating = reviewCount ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : 0;
  const safetyWarning = product.safetyWarning || DEFAULT_SAFETY_WARNING;
  const occasion = OCCASIONS.find((item) => product.occasions?.includes(item.id));
  const makeDays = product.madeToOrderDays || DEFAULT_MADE_TO_ORDER_DAYS;
  const unitPrice = Number(product.price || 0) + (product.personalizable && personalization.trim() ? PERSONALIZATION_FEE : 0);

  const handleAddToCart = () => {
    onAddToCart(product, quantity, product.personalizable ? personalization : "");
    setShowConfetti(true);
    window.setTimeout(() => setShowConfetti(false), 1500);
  };

  const handleSubmitReview = async () => {
    if (!reviewText.trim() || reviewSaving) return;

    setReviewSaving(true);
    setReviewError("");
    try {
      const savedReview = await onAddReview(product._id, {
        productId: product._id,
        userName: user?.name || "Guest",
        rating: reviewRating,
        text: reviewText,
        date: new Date().toISOString(),
      });

      if (fetchedProduct && savedReview) {
        setFetchedProduct((current) => (current ? { ...current, reviews: [...(current.reviews || []), savedReview] } : current));
      }

      setReviewText("");
      setReviewRating(5);
      setShowReviewForm(false);
    } catch {
      setReviewError("Your review could not be published. Please try again.");
    } finally {
      setReviewSaving(false);
    }
  };

  const pageUrl = new URL(`/product/${product._id}`, settings.siteUrl || window.location.origin).toString();

  return (
    <div className="text-royal-950">
      <Seo
        title={product.seoTitle || product.name}
        description={product.seoDescription || product.description || "A sparkly hair bow, tied by hand to order."}
        keywords={product.seoKeywords}
        type="product"
        image={images[0]?.url}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.seoDescription || product.description || "A sparkly hair bow, tied by hand to order.",
          image: images.map((image) => image.url).filter(Boolean),
          brand: { "@type": "Brand", name: settings.organizationName || settings.siteName || "Sparkle Bows" },
          category: product.category || undefined,
          url: pageUrl,
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price: Number(product.price || 0).toFixed(2),
            url: pageUrl,
            availability: "https://schema.org/MadeToOrder",
          },
        }}
      />

      <section className="mx-auto max-w-6xl px-4 pb-6 pt-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-royal-700 ring-1 ring-royal-100 transition hover:bg-white hover:text-candy-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </button>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Photos */}
          <div className="lg:sticky lg:top-32">
            <div className="relative overflow-hidden rounded-[40px] bg-white p-3 shadow-[0_30px_60px_-30px_rgba(91,33,182,0.55)] ring-1 ring-royal-100">
              <div className="aspect-square overflow-hidden rounded-[32px] bg-gradient-to-br from-candy-50 via-white to-royal-50">
                <img src={images[selectedImage]?.url} alt={images[selectedImage]?.alt || product.name} className="h-full w-full object-cover" />
              </div>
              <SparkleIcon size={22} className="twinkle-star right-8 top-8 text-white drop-shadow" />
              <SparkleIcon size={14} className="twinkle-star bottom-10 left-8 text-gold-200 drop-shadow" style={{ animationDelay: "1s" }} />
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex justify-center gap-3">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={image.url || index}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`Show photo ${index + 1}`}
                    className={`h-20 w-20 overflow-hidden rounded-2xl bg-white transition ${
                      selectedImage === index ? "ring-4 ring-candy-400" : "ring-1 ring-royal-100 hover:ring-candy-200"
                    }`}
                  >
                    <img src={image.url} alt={image.alt || `${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap gap-2">
              {occasion && (
                <span className="rounded-full bg-candy-100 px-3 py-1 text-xs font-extrabold text-candy-700">
                  {occasion.emoji} {occasion.label}
                </span>
              )}
              {product.category && (
                <span className="rounded-full bg-royal-100 px-3 py-1 text-xs font-extrabold text-royal-700">{styleLabel(product.category)}</span>
              )}
              {product.bestseller && <span className="rounded-full bg-gold-200 px-3 py-1 text-xs font-extrabold text-royal-900">👑 Favorite</span>}
            </div>

            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-royal-950 sm:text-5xl">{product.name}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <p className="font-display text-3xl font-semibold text-candy-600">{formatPrice(product.price)}</p>
              {reviewCount > 0 && (
                <a href="#reviews" className="inline-flex items-center gap-2 text-sm font-bold text-royal-700">
                  <Stars value={averageRating} />
                  {averageRating.toFixed(1)} · {reviewCount} review{reviewCount === 1 ? "" : "s"}
                </a>
              )}
            </div>

            <p className="mt-6 whitespace-pre-line text-[17px] leading-8 text-royal-800/85">
              {product.longDescription || product.description || "A sparkly bow tied by hand, just for you."}
            </p>

            <div className="mt-8 rounded-[32px] bg-white p-6 shadow-[0_20px_50px_-28px_rgba(91,33,182,0.5)] ring-1 ring-royal-100">
              {product.personalizable ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-extrabold text-royal-900">
                    ✨ Add a name (optional, +${PERSONALIZATION_FEE})
                  </span>
                  <input
                    id="bow-personalization"
                    type="text"
                    maxLength={40}
                    value={personalization}
                    onChange={(event) => setPersonalization(event.target.value)}
                    placeholder="Name, initial, or team colors"
                    className="w-full rounded-2xl border-2 border-royal-100 bg-royal-50/50 px-4 py-3 text-base outline-none focus:border-candy-300 focus:ring-0"
                  />
                </label>
              ) : null}

              <div className={`flex items-center gap-3 ${product.personalizable ? "mt-5" : ""}`}>
                <div className="inline-flex items-center rounded-full bg-royal-50 p-1 ring-1 ring-royal-100">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="rounded-full p-3 text-royal-700 transition hover:bg-white"
                    aria-label="One fewer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-10 text-center text-lg font-extrabold text-royal-950">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.min(20, current + 1))}
                    className="rounded-full p-3 text-royal-700 transition hover:bg-white"
                    aria-label="One more"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-candy-500 to-royal-600 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-candy-500/30 transition hover:scale-[1.02]"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Add to cart · {formatPrice(unitPrice * quantity)}
                </button>
              </div>

              {product.bundleEligible !== false && (
                <p className="mt-4 rounded-2xl bg-gold-200/50 px-4 py-2.5 text-center text-sm font-bold text-royal-800">
                  🎁 Any {BUNDLE.size} bows for ${BUNDLE.price} · free shipping over ${FREE_SHIPPING_THRESHOLD}
                </p>
              )}
            </div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Scissors, title: "Tied by hand", text: "Made after you order" },
                { icon: Truck, title: `Ships in ${makeDays} days`, text: "Packed with care" },
                { icon: Gift, title: "Ready to give", text: "Clipped to a bow card" },
              ].map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 ring-1 ring-royal-100">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-candy-400 to-royal-500 text-white">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-royal-900">{title}</span>
                    <span className="block text-xs text-royal-600">{text}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 ring-1 ring-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p>{safetyWarning}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="mx-auto max-w-4xl scroll-mt-32 px-4 pb-20 sm:px-6">
        <div className="rounded-[36px] bg-white p-6 shadow-[0_20px_50px_-28px_rgba(91,33,182,0.45)] ring-1 ring-royal-100 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold text-royal-950">Reviews</h2>
              <p className="mt-1 text-sm font-semibold text-royal-600">
                {reviewCount > 0 ? `${averageRating.toFixed(1)} stars from ${reviewCount} review${reviewCount === 1 ? "" : "s"}` : "No reviews yet"}
              </p>
            </div>
            {user ? (
              <button
                type="button"
                onClick={() => setShowReviewForm((current) => !current)}
                className="rounded-full bg-royal-50 px-5 py-2.5 text-sm font-bold text-royal-800 ring-1 ring-royal-200 transition hover:bg-candy-50 hover:ring-candy-300"
              >
                {showReviewForm ? "Close" : "Write a review"}
              </button>
            ) : (
              <p className="text-sm font-semibold text-royal-500">Sign in to leave a review.</p>
            )}
          </div>

          {showReviewForm && (
            <div className="mt-6 rounded-[28px] bg-royal-50/60 p-6 ring-1 ring-royal-100">
              <p className="text-sm font-extrabold text-royal-900">How many stars?</p>
              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="text-gold-400 transition hover:scale-110"
                    aria-label={`${star} star${star === 1 ? "" : "s"}`}
                  >
                    <Star className={`h-8 w-8 ${star <= (hoverRating || reviewRating) ? "fill-current" : ""}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                placeholder="What did you love about this bow?"
                className="mt-4 min-h-32 w-full rounded-3xl border-2 border-royal-100 bg-white px-5 py-4 text-base text-royal-900 outline-none focus:border-candy-300 focus:ring-0"
              />
              {reviewError && <p className="mt-3 text-sm font-bold text-red-600">{reviewError}</p>}
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={reviewSaving || !reviewText.trim()}
                className="mt-4 rounded-full bg-gradient-to-r from-candy-500 to-royal-600 px-6 py-3 text-sm font-extrabold text-white shadow transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reviewSaving ? "Posting..." : "Post review"}
              </button>
            </div>
          )}

          <div className="mt-6 space-y-4">
            {reviewCount > 0 ? (
              product.reviews.map((review, index) => (
                <div key={review._id || `${review.userName}-${index}`} className="rounded-[24px] bg-royal-50/50 p-5 ring-1 ring-royal-100">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <p className="font-display font-semibold text-candy-600">{review.userName || "Customer"}</p>
                      <Stars value={review.rating} />
                    </div>
                    <p className="text-xs font-semibold text-royal-400">{formatReviewDate(review.date)}</p>
                  </div>
                  <p className="mt-3 text-[15px] leading-7 text-royal-800/85">{review.text}</p>
                </div>
              ))
            ) : (
              <p className="rounded-[24px] border-2 border-dashed border-royal-200 p-8 text-center text-sm font-semibold text-royal-500">
                Be the first to tell us what you think! 💖
              </p>
            )}
          </div>
        </div>
      </section>

      <Confetti show={showConfetti} />
    </div>
  );
}
