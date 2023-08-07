import React, {useEffect, useState} from 'react'
import Layout from "@/components/Layout";
import axios from "axios";
import Spinner from "@/components/Spinner";
import {withSwal} from "react-sweetalert2";

function SettingPage({swal}) {
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [featuredLoading, setFeaturedLoading] = useState(false);
    const [featuredProductId, setFeaturedProductId] = useState("");

    useEffect(() => {
        setProductsLoading(true);
        setFeaturedLoading(true);
        axios.get("/api/products").then(res => {
            setProducts(res.data);
            setProductsLoading(false);
        });
        axios.get("/api/settings?name=featuredProductId").then(res => {
            setFeaturedProductId(res.data.value);
            setFeaturedLoading(false);
        })
    }, []);

    async function saveSettings() {
        await axios.put("/api/settings", {
            name: "featuredProductId",
            value: featuredProductId,
        }).then(() => {
            swal.fire({
                title: "Lưu cài đặt thành công!",
                icon: "success",
            });
        });
    }

    return (
        <Layout>
            <h1>Cài đặt</h1>
            {(productsLoading || featuredLoading) && (
                <Spinner/>
            )}
            {(!productsLoading && !featuredLoading) && (
                <>
                    <label>Sản phẩm nổi bật</label>
                    <select
                        onChange={ev => setFeaturedProductId(ev.target.value)}
                        value={featuredProductId}
                    >
                        {products.length > 0 && products.map(product => (
                            <option value={product._id} key={product._id}>{product.title}</option>
                        ))}
                    </select>
                    <div>
                        <button className="btn-primary" onClick={saveSettings}>Lưu</button>
                    </div>
                </>
            )}
        </Layout>
    );
}

export default withSwal(({swal}) => (
    <SettingPage swal={swal}/>
));