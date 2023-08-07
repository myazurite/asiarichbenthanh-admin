import React, { useEffect, useState, useRef } from "react";
import Layout from "@/components/Layout";
import axios from "axios";
import { withSwal } from "react-sweetalert2";
import { ReactSortable } from "react-sortablejs";
import Spinner_alt from "@/components/Spinner_alt";

function Categories({ swal }) {
    const [name, setName] = useState("");
    const [categories, setCategories] = useState([]);
    const [parentCategory, setParentCategory] = useState("");
    const [editedCategory, setEditedCategory] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const [properties, setProperties] = useState([]);
    const sortableRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    function fetchCategories() {
        setIsLoading(true);
        axios.get('/api/categories').then((result) => {
            const sortedCategories = result.data.sort((a, b) => a.order - b.order);
            setCategories(sortedCategories);
            setIsLoading(false);
        });
    }

    async function saveCategory(ev) {
        ev.preventDefault();

        if (editedCategory) {
            const isExisting = categories.some(
                (category) =>
                    category._id !== editedCategory._id && category.name === name
            );
        } else {
            const isExisting = categories.some((category) => category.name === name);
        }

        const data = {
            name,
            parentCategory: parentCategory || undefined,
            properties: properties.map((p) => ({
                name: p.name,
                values: p.values.split(","),
            })),
        };

        if (name === "") {
            return;
        }
        try {
            if (editedCategory) {
                data._id = editedCategory._id;
                await axios.put("/api/categories", data);
            } else {
                await axios.post("/api/categories", data);
            }
            setErrorMessage("");
            setName("");
            setParentCategory("");
            setEditedCategory(null); // This will reset the form to the "create" state
            setProperties([]);
            fetchCategories();
        } catch (err) {
            // Handle error response from server
            if (err.response && err.response.data && err.response.data.error) {
                setErrorMessage(err.response.data.error);
            } else {
                setErrorMessage("An error occurred while saving the category");
            }
        }
    }

    function editCategory(category) {
        setEditedCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id);
        setProperties(
            category.properties.map(({ name, values }) => ({
                name,
                values: values.join(","),
            }))
        );
    }

    function deleteCategory(category) {
        swal
            .fire({
                title: "Xác nhận",
                text: `Xoá ${category.name}?`,
                showCancelButton: true,
                cancelButtonText: "Không",
                confirmButtonText: "Có",
                confirmButtonColor: "#d55",
            })
            .then(async (result) => {
                if (result.isConfirmed) {
                    const { _id } = category;
                    await axios.delete("/api/categories?_id=" + _id);
                    fetchCategories();
                }
            });
    }

    function addProperty() {
        setProperties((prev) => {
            return [...prev, { name: "", values: "" }];
        });
    }

    function handlePropertyNameChange(i, property, newName) {
        setProperties((prev) => {
            const properties = [...prev];
            properties[i].name = newName;
            return properties;
        });
    }

    function handlePropertyValuesChange(i, property, newValues) {
        setProperties((prev) => {
            const properties = [...prev];
            properties[i].values = newValues;
            return properties;
        });
    }

    function removeProperty(indexToRemove) {
        setProperties((prev) => {
            return [...prev].filter((p, pI) => {
                return pI !== indexToRemove;
            });
        });
    }

    function clearError() {
        setErrorMessage("");
    }

    async function handleSortEnd(order) {
        if (sortableRef.current) {
            const reorderedCategories = order.map((item) => item.value);
            setCategories(reorderedCategories);

            try {
                await axios.put("/api/categories", { categories: order });
            } catch (err) {
                // Handle error response from server
                if (err.response && err.response.data && err.response.data.error) {
                    setErrorMessage(err.response.data.error);
                } else {
                    setErrorMessage("An error occurred while saving the category order");
                }
            }
        }
    }

    return (
        <Layout>
            <h1>Categories</h1>
            <label>
                {editedCategory ? `Chỉnh sửa ${editedCategory.name}` : "Thêm danh mục mới"}
            </label>
            <form onSubmit={saveCategory}>
                <div className="flex gap-1">
                    <input
                        type="text"
                        placeholder="Tên danh mục"
                        value={name}
                        onChange={(ev) => setName(ev.target.value)}
                    />
                    <select
                        value={parentCategory}
                        onChange={(ev) => setParentCategory(ev.target.value)}
                    >
                        <option value="">Không danh mục chứa</option>
                        {categories.length > 0 &&
                            categories.map((category) => {
                                if (editedCategory && category._id === editedCategory._id) {
                                    return null;
                                }
                                return (
                                    <option value={category._id} key={category._id}>
                                        {category.name}
                                    </option>
                                );
                            })}
                    </select>
                </div>
                <div className="mb-2">
                    <label className="block mb-2">Properties</label>
                    <button
                        type="button"
                        className="btn-default text-sm mb-2"
                        onClick={addProperty}
                    >
                        Thêm thuộc tính
                    </button>
                    {properties.length > 0 &&
                        properties.map((property, i) => (
                            <div className="flex gap-1 mb-2" key={i}>
                                <input
                                    type="text"
                                    placeholder="Property name"
                                    className="mb-0"
                                    value={property.name}
                                    onChange={(ev) =>
                                        handlePropertyNameChange(i, property, ev.target.value)
                                    }
                                />
                                <input
                                    type="text"
                                    placeholder="Value, comma separated"
                                    className="mb-0"
                                    value={property.values}
                                    onChange={(ev) =>
                                        handlePropertyValuesChange(i, property, ev.target.value)
                                    }
                                />
                                <button
                                    type="button"
                                    className="btn-default"
                                    onClick={() => {
                                        removeProperty(i);
                                        clearError();
                                    }}
                                >
                                    Xoá
                                </button>
                            </div>
                        ))}
                </div>
                <div className="flex gap-1">
                    {editedCategory && (
                        <button
                            type="button"
                            className="btn-default"
                            onClick={() => {
                                setEditedCategory(null);
                                setName("");
                                setParentCategory("");
                                setProperties([]);
                                clearError();
                            }}
                        >
                            Huỷ
                        </button>
                    )}
                    <button type="submit" className="btn-primary py-1">
                        Lưu
                    </button>
                </div>
            </form>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            {isLoading && (
                <div className="py-4">
                    <Spinner_alt fullWidth={true}/>
                </div>
            )}
            <ReactSortable
                list={categories.map((category) => ({ id: category._id, value: category }))}
                setList={handleSortEnd}
                ref={sortableRef}
            >
                {categories.map((category) => (
                    <div
                        className="border p-2 flex justify-between"
                        key={category._id}
                    >
                        <div>{category.name}</div>
                        <div>
                            <button
                                className="btn-default mr-1"
                                onClick={() => editCategory(category)}
                            >
                                Sửa
                            </button>
                            <button
                                className="btn-default"
                                onClick={() => deleteCategory(category)}
                            >
                                Xoá
                            </button>
                        </div>
                    </div>
                ))}
            </ReactSortable>
        </Layout>
    );
}

export default withSwal(Categories);
