import { useEffect, useState } from "react";
import { getAllProducts } from "../services/api";

export default function ShowProducts() {
    const [allProducts, setAllProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        getAllProducts().then(data => {
            setAllProducts(data);
            setProducts(data);
        });
    }, []);

    useEffect(() => {
        const filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(keyword.toLowerCase()) ||
            p.brand?.toLowerCase().includes(keyword.toLowerCase()) ||
            p.sku.toLowerCase().includes(keyword.toLowerCase())
        );
        setProducts(filtered);
    }, [keyword, allProducts]);

    return (
        <div>
            <h2>My Products</h2>

            <input
                placeholder="Search by name, brand, SKU"
                value={keyword}
                onChange={e => setKeyword(e.target.value)}
            />

            {products.map(p => (
                <div
                    key={p.id}
                    style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}
                >
                    <p><strong>{p.name}</strong></p>
                    <p>Brand: {p.brand}</p>
                    <p>SKU: {p.sku}</p>
                    <p>Price: RM {p.price}</p>
                    <p>Status: {p.status}</p>
                </div>
            ))}
        </div>
    );
}

