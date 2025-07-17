export async function searchByProduct(productName: string) {
  const res = await fetch(
    `/search/api/by-product?product=${encodeURIComponent(productName)}`
  );
  if (!res.ok) throw new Error("Erreur lors de la recherche");
  return await res.json();
}
