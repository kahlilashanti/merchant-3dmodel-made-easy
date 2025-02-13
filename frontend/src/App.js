import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const App = () => {
    const [shopifyUrl, setShopifyUrl] = useState("");
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [meshyModel, setMeshyModel] = useState(null);
    const [masterpieceModel, setMasterpieceModel] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchProducts = async () => {
        if (!shopifyUrl) {
            toast.error("Please enter a Shopify store URL.");
            return;
        }

        // Ensure the URL starts with "https://"
        let formattedUrl = shopifyUrl.trim();
        if (!formattedUrl.startsWith("https://")) {
            formattedUrl = `https://${formattedUrl}`;
        }

        // Ensure the Shopify API request points to the correct endpoint
        const apiUrl = `${formattedUrl}/products.json`;

        try {
            console.log("Fetching products from:", apiUrl); // ✅ Debugging log
            const response = await axios.get(apiUrl);
            console.log("Shopify API Response:", response.data);

            // ✅ Fix image URLs and limit to 5 products
            const filteredProducts = (response.data.products || []).slice(0, 5).map(product => ({
                ...product,
                image: product?.images?.[0]?.src || "https://via.placeholder.com/150"
            }));

            setProducts(filteredProducts);
            toast.success("Products loaded successfully!");
        } catch (error) {
            console.error("Error fetching products:", error);
            toast.error("Failed to load products. Please check the URL.");
        }
    };

    const convertTo3D = async () => {
        if (!selectedProduct || !selectedProduct.image) {
            toast.error("No product selected or missing image.");
            return;
        }

        setLoading(true);
        toast.info("Converting to 3D...");

        try {
            const meshyResponse = await axios.post("http://localhost:5001/meshy/upload", { imageUrl: selectedProduct.image });
            const masterpieceResponse = await axios.post("http://localhost:5001/masterpiece/upload", { imageUrl: selectedProduct.image });

            console.log("Meshy API Response:", meshyResponse.data);
            console.log("Masterpiece API Response:", masterpieceResponse.data);

            setMeshyModel(meshyResponse.data.taskId);
            setMasterpieceModel(masterpieceResponse.data.requestId);
            toast.success("3D models are being generated!");
        } catch (error) {
            console.error("Error converting image to 3D:", error);
            toast.error("3D conversion failed. Please try again.");
        }

        setLoading(false);
    };

    return (
        <div>
            <h1>Convert Shopify Products to 3D</h1>
            <input
                type="text"
                placeholder="Enter Shopify Store URL"
                value={shopifyUrl}
                onChange={(e) => setShopifyUrl(e.target.value)}
            />
            <button onClick={fetchProducts}>Load Products</button>

            {/* ✅ Display fetched products */}
            <div className="product-list">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div key={product.id} className="product-item" onClick={() => setSelectedProduct(product)}>
                            <img src={product.image} alt={product.title} style={{ width: "150px", height: "150px" }} />
                            <p>{product.title}</p>
                        </div>
                    ))
                ) : (
                    <p>No products found.</p>
                )}
            </div>

            {/* ✅ Show selected product */}
            {selectedProduct && (
                <div>
                    <h2>Selected Product: {selectedProduct.title}</h2>
                    <img src={selectedProduct.image} alt={selectedProduct.title} />
                    <button onClick={convertTo3D}>Convert to 3D</button>
                </div>
            )}
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default App;

