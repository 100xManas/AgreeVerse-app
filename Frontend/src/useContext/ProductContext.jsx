import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const ProductContext = createContext();

const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const getProducts = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("https://agreeverse-app.onrender.com/api/v1/user/previewcrop");
            // console.log(data);
            setProducts(data.crops);
        } catch (err) {
            console.error("Error fetching products:", err);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getProducts();
    }, []);

    return (
        <ProductContext.Provider value={[products, setProducts, loading, getProducts]}>
            {children}
        </ProductContext.Provider>
    );
};

export default ProductProvider;