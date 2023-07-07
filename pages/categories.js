import React, {useEffect, useState} from 'react'
import Layout from "@/components/Layout";
import axios from "axios";
import {withSwal} from "react-sweetalert2";

function Categories({swal}) {
    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [parentCategory, setParentCategory] = useState('');
    const [editedCategory, setEditedCategory] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [properties, setProperties] = useState([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    function fetchCategories() {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
        });
    }

    async function saveCategory(ev) {
        ev.preventDefault();

        // Exclude the category currently being edited from the check
        if (editedCategory) {
            const isExisting = categories.some(
                (category) => category._id !== editedCategory._id && category.name === name
            );
        } else {
            // Check if name already exists for creation
            const isExisting = categories.some(
                (category) => category.name === name
            );
        }

        const data = {
            name,
            parentCategory: parentCategory || undefined,
            properties: properties.map(p => ({
                name: p.name,
                values: p.values.split(','),
            })),
        };

        if (name === '') {
            return;
        }
        try {
            if (editedCategory) {
                data._id = editedCategory._id;
                await axios.put('/api/categories', data);
            } else {
                await axios.post('/api/categories', data);
            }
            setErrorMessage('');
            setName('');
            setParentCategory('');
            setEditedCategory(null); // This will reset the form to the "create" state
            setProperties([]);
            fetchCategories();
        } catch (err) {
            // Handle error response from server
            if (err.response && err.response.data && err.response.data.error) {
                setErrorMessage(err.response.data.error);
            } else {
                setErrorMessage('An error occurred while saving the category');
            }
        }
    }

    function editCategory(category) {
        setEditedCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id);
        setProperties(
            category.properties.map(({name, values}) => ({
                name,
                values: values.join(',')
            }))
        );
    }

    function deleteCategory(category) {
        swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${category.name}?`,
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Yes, delete!',
            confirmButtonColor: '#d55'
        }).then(async result => {
            if (result.isConfirmed) {
                const {_id} = category;
                await axios.delete('/api/categories?_id=' + _id);
                fetchCategories();
            }
        });
    }

    function addProperty() {
        setProperties(prev => {
            return [
                ...prev,
                {name: '', values: ''}
            ]
        })
    }

    function handlePropertyNameChange(i, property, newName) {
        setProperties(prev => {
            const properties = [...prev];
            properties[i].name = newName;
            return properties;
        });
    }

    function handlePropertyValuesChange(i, property, newValues) {
        setProperties(prev => {
            const properties = [...prev];
            properties[i].values = newValues;
            return properties;
        });
    }

    function removeProperty(indexToRemove) {
        setProperties(prev => {
            return [...prev].filter((p, pI) => {
                return pI !== indexToRemove;
            });
        })
    }

    function clearError() {
        setErrorMessage('');
    }

    return (
        <Layout>
            <h1>Categories</h1>
            <label>
                {editedCategory
                    ? `Edit category ${editedCategory.name}`
                    : 'Create new category'}
            </label>
            <form onSubmit={saveCategory}>
                <div className="flex gap-1">
                    <input
                        type="text"
                        placeholder='Tên danh mục'
                        value={name}
                        onChange={ev => setName(ev.target.value)}
                    />
                    <select
                        value={parentCategory}
                        onChange={ev => setParentCategory(ev.target.value)}
                    >
                        <option value=''>Không danh mục chứa</option>
                        {categories.length > 0 && categories.map(category => {
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
                    <label className='block mb-2'>Properties</label>
                    <button
                        type='button'
                        className="btn-default text-sm mb-2"
                        onClick={addProperty}
                    >
                        Thêm thuộc tính
                    </button>
                    {properties.length > 0 && properties.map((property, i) => (
                        <div className="flex gap-1 mb-2" key={i}>
                            <input
                                type="text"
                                placeholder="Property name"
                                className='mb-0'
                                value={property.name}
                                onChange={ev => handlePropertyNameChange(i, property, ev.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Value, comma separated"
                                className='mb-0'
                                value={property.values}
                                onChange={ev => handlePropertyValuesChange(i, property, ev.target.value)}
                            />
                            <button
                                type='button'
                                className="btn-default"
                                onClick={() => {
                                    removeProperty(i);
                                    clearError()
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
                            type='button'
                            className='btn-default'
                            onClick={() => {
                                setEditedCategory(null);
                                setName('');
                                setParentCategory('');
                                setProperties([]);
                                clearError()
                            }}
                        >
                            Huỷ
                        </button>
                    )}
                    <button
                        type='submit'
                        className='btn-primary py-1'
                    >
                        Lưu
                    </button>
                </div>
            </form>
            {errorMessage && <p style={{color: 'red'}}>{errorMessage}</p>}
            {!editedCategory && (
                <table className='basic mt-4'>
                    <thead>
                    <tr>
                        <td>Tên danh mục</td>
                        <td>Danh mục chứa</td>
                        <td></td>
                    </tr>
                    </thead>
                    <tbody>
                    {categories.length > 0 && categories.map(category => (
                        <tr className="" key={category.name}>
                            <td>{category.name}</td>
                            <td>{category?.parent?.name}</td>
                            <td>
                                <button
                                    onClick={() => {
                                        editCategory(category);
                                        clearError()
                                    }}
                                    className="btn-primary mr-1"
                                >
                                    Sửa
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={() => {
                                        deleteCategory(category);
                                        clearError()
                                    }}
                                >
                                    Xoá
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </Layout>
    );
}

export default withSwal(({swal}, ref) => (
    <Categories swal={swal}/>
));
