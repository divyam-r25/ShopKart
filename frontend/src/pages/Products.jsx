import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { getProducts } from "../services/api";

const categories = ["All", "Electronics", "Fashion", "Books", "Home"];

export default function Products({ user, setUser }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("");
  const [state, setState] = useState("loading");

  useEffect(() => {
    const timer = setTimeout(async () => {
      setState("loading");
      try {
        const { data } = await getProducts({
          ...(search && { search }),
          ...(category !== "All" && { category }),
          ...(sort && { sort })
        });
        setProducts(data.products || []);
        setState("ready");
      } catch {
        setState("error");
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, sort]);

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <main className="catalog">
        <div className="catalog-heading">
          <p className="eyebrow accent">THE SHOPKART EDIT</p>
          <h1>
            Discover something <i>good.</i>
          </h1>
          <p>A collection chosen with character, comfort, and curiosity in mind.</p>
        </div>

        <div className="filters">
          <div className="search-wrap">
            <span>⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search the collection"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort products"
          >
            <option value="">Newest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
          </select>
        </div>

        <div className="catalog-meta">
          <span>
            {state === "ready"
              ? `${products.length} ${products.length === 1 ? "find" : "finds"}`
              : "The collection"}
          </span>
          <span>Curated for everyday delight</span>
        </div>

        {state === "loading" && (
          <div className="state">
            <div className="spinner" />
            <p>Gathering beautiful things…</p>
          </div>
        )}
        {state === "error" && (
          <div className="state">
            <h3>Something went wrong.</h3>
            <p>We couldn’t load the collection. Please make sure the API is running and try again.</p>
          </div>
        )}
        {state === "ready" && !products.length && (
          <div className="state">
            <h3>No products found.</h3>
            <p>Try a different search or category. Run `npm run seed` in the backend to populate items.</p>
          </div>
        )}
        {state === "ready" && products.length > 0 && (
          <section className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </section>
        )}
      </main>
    </>
  );
}
