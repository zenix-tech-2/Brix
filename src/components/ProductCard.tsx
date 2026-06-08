import { Link } from "../lib/router";
import { money, typeLabel } from "../lib/data";
import type { Product } from "../lib/types";
import { Stars, Badge } from "./ui";
import { TypeIcon } from "./Icons";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-slate-800 dark:to-slate-800">
        {product.cover_url ? (
          <img
            src={product.cover_url}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-indigo-400/70 dark:text-slate-600">
            <TypeIcon type={product.type} className="h-14 w-14" />
          </div>
        )}
        {product.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold text-amber-950">
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.9 6.3L22 9.3l-5 4.7 1.3 6.9L12 17.8 5.7 20.9 7 14 2 9.3l7.1-1Z" /></svg>
            FEATURED
          </span>
        )}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
          <TypeIcon type={product.type} className="h-3.5 w-3.5" /> {typeLabel(product.type)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-bold text-slate-900 dark:text-white">
          {product.title}
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500 dark:text-slate-400">
          {product.short_desc}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[9px] font-bold text-white">
            {(product.creator?.username || "?").charAt(0).toUpperCase()}
          </span>
          <span className="truncate">@{product.creator?.username || "creator"}</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {product.rating_count > 0 ? (
              <>
                <Stars value={product.rating} />
                <span className="text-xs text-slate-400">
                  ({product.rating_count})
                </span>
              </>
            ) : (
              <Badge color="slate">New</Badge>
            )}
          </div>
          <span className="text-lg font-extrabold text-slate-900 dark:text-white">
            {Number(product.price) === 0 ? "Free" : money(product.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}
