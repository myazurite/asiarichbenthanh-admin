import {useRouter} from "next/router";
import axios from "axios";
import {useEffect, useState} from "react";
import {ReactSortable} from "react-sortablejs";
import Spinner from "@/components/Spinner";

export default function ProductForm({
    _id,
    title: existingTitle,
    description: existingDescription,
    price: existingPrice,
    images: existingImages,
    category: assignedCategory,
    properties: assignedProperties,
}) {
    const [title, setTitle] = useState(existingTitle || '');
    const [description, setDescription] = useState(existingDescription || '');
    const [price, setPrice] = useState(existingPrice || '');
    const [images, setImages] = useState(existingImages || []);
    const [goToProducts, setGoToProducts] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [category, setCategory] = useState(assignedCategory || '');
    const [productProperties, setProductProperties] = useState(assignedProperties || {});

    useEffect(() => {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
        })
    }, []);

    async function saveProduct(ev) {
        ev.preventDefault();

        const propertiesToSave = [];

        // Include properties from the selected category
        if (category) {
            const selectedCategory = categories.find((c) => c._id === category);
            propertiesToSave.push(...selectedCategory.properties);

            // Include properties from parent categories
            let parentCategory = selectedCategory.parent;
            while (parentCategory) {
                const parentCategoryInfo = categories.find((c) => c._id === parentCategory._id);
                propertiesToSave.push(...parentCategoryInfo.properties);
                parentCategory = parentCategoryInfo.parent;
            }
        }

        const data = {
            title,
            description,
            price,
            images,
            category,
            properties: productProperties,
        };

        // Filter out properties not included in propertiesToSave
        data.properties = Object.keys(data.properties)
            .filter((prop) => propertiesToSave.some((p) => p.name === prop))
            .reduce((obj, prop) => {
                obj[prop] = data.properties[prop];
                return obj;
            }, {});

        if (_id) {
            // Update existing product
            await axios.put('/api/products', { ...data, _id });
        } else {
            // Create new product
            await axios.post('/api/products', data);
        }

        setGoToProducts(true);
    }


    if (goToProducts) {
        router.push('/products');
    }

    async function uploadImages(ev) {
        const files = ev.target?.files;
        if (files?.length > 0) {
            setIsUploading(true);
            const data = new FormData();
            for (const file of files) {
                data.append('file', file);
            }
            const res = await axios.post('/api/upload', data);
            setImages(oldImages => {
                return [...oldImages, ...res.data.links];
            });
            setIsUploading(false);
        }
    }

    async function deleteImage(imageLink) {
        const newImages = images.filter(link => link !== imageLink);
        setImages(newImages);

        const imageName = imageLink.split("/").pop();

        await axios.delete('/api/deleteImage', {data: {imageName}});
    }

    function updateImagesOrder(images) {
        setImages(images);
    }

    const propertiesToFill = [];
    if (categories.length > 0 && category) {
        let catInfo = categories.find(({_id}) => _id === category);
        propertiesToFill.push(...catInfo.properties);
        while (catInfo?.parent?._id) {
            const parentCat = categories.find(({_id}) => _id === catInfo?.parent?._id);
            propertiesToFill.push(...parentCat.properties);
            catInfo = parentCat;
        }
    }

    function setProductProp(propName, value) {
        setProductProperties(prev => {
            const newProductProps = {...prev};
            newProductProps[propName] = value;
            return newProductProps;
        })
    }

    return (
        <form onSubmit={saveProduct}>
            <label>Tên sản phẩm</label>
            <input
                type="text"
                placeholder="product name"
                value={title}
                onChange={ev => setTitle(ev.target.value)}
            />
            <label>Danh mục</label>
            <select
                value={category}
                onChange={ev => setCategory(ev.target.value)}
                required
            >
                <option value="">Chưa có danh mục</option>
                {categories.length > 0 && categories.map(c => (
                    <option value={c._id} key={c._id}>{c.name}</option>
                ))}
            </select>
            {propertiesToFill.length > 0 && propertiesToFill.map(p => (
                <div className="flex gap-1" key={p._id}>
                    <div className="">{p.name}</div>
                    <select
                        value={productProperties[p.name]}
                        onChange={ev => setProductProp(p.name, ev.target.value)}
                    >
                        <option value="0" >Chọn thuộc tính</option>
                        {p.values.map((v, i) => (
                            <option value={v} key={i}>{v}</option>
                        ))}
                    </select>
                </div>
            ))}
            <label>Photos</label>
            <div className="mb-2 flex flex-wrap gap-1">
                <ReactSortable
                    list={images}
                    setList={updateImagesOrder}
                    className='flex flex-wrap gap-1 '
                >
                    {!!images?.length && images.map(link => (
                        <div key={link}
                             className='relative h-24 group hover:opacity-100 transition-opacity duration-200'>
                            <img className='rounded-lg' src={link} alt=""/>
                            <button
                                className='absolute top-0 right-0 text-black opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-red-600'
                                onClick={() => deleteImage(link)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                     strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round"
                                          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </button>
                        </div>
                    ))}
                </ReactSortable>
                {isUploading && (
                    <div className='h-24 flex items-center'>
                        <Spinner/>
                    </div>
                )}
                <label
                    className="w-24 h-24 flex text-center items-center justify-center flex-col text-sm gap-1 text-gray-500 rounded-lg bg-gray-200 cursor-pointer hover:text-black font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5"
                         stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                    </svg>
                    <div>Upload</div>
                    <input type="file" className='hidden' onChange={uploadImages}/>
                </label>
            </div>
            <label>Mô tả</label>
            <textarea
                placeholder="Mô tả sản phẩm"
                value={description}
                onChange={ev => setDescription(ev.target.value)}
            ></textarea>
            <label>Giá</label>
            <input
                type="number"
                placeholder="Đơn giá sản phẩm"
                value={price}
                onChange={ev => setPrice(ev.target.value)}
                required
            />
            <button type='submit' className="btn-primary">Lưu</button>
        </form>
    );
}