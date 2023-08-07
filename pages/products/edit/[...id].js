import React, {useEffect, useState} from 'react'
import Layout from "@/components/Layout";
import {useRouter} from "next/router";
import axios from "axios";
import ProductForm from "@/components/ProductForm";
import Spinner_alt from "@/components/Spinner_alt";

export default function EditProductPage() {
    const router = useRouter();
    const {id} = router.query;
    const [productInfo, setProductInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!id) {
            return;
        }
        setIsLoading(true);
        axios.get('/api/products?id='+id).then(response => {
            setProductInfo(response.data)
            setIsLoading(false);
        });
    }, [id]);

    return (
        <Layout>
            <h1 className="text-blue-900 mb-2 text-xl">Chỉnh sửa thông tin sản phẩm</h1>
            {isLoading && (
                <Spinner_alt fullWidth={true}/>
            )}
            {productInfo && (
                <ProductForm {...productInfo}/>
            )}
        </Layout>
    )
}
