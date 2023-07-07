import React, {useEffect, useState} from 'react'
import Layout from "@/components/Layout";
import {useRouter} from "next/router";
import axios from "axios";
import ProductForm from "@/components/ProductForm";

export default function EditProductPage() {
    const router = useRouter();
    const {id} = router.query;
    const [productInfo, setProductInfo] = useState(null);

    useEffect(() => {
        if (!id) {
            return;
        }
        axios.get('/api/products?id='+id).then(response => {
            setProductInfo(response.data)
        });
    }, [id]);

    return (
        <Layout>
            <h1 className="text-blue-900 mb-2 text-xl">Edit product</h1>
            {productInfo && (
                <ProductForm {...productInfo}/>
            )}
        </Layout>
    )
}
