import ProductCard from "./ProductCard";

export default function ProductTable({ products }) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  );
}
