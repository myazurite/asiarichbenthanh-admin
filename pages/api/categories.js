import {mongooseConnect} from "@/lib/mongoose";
import {Category} from "@/models/Category";
import {isAdminRequest} from "@/pages/api/auth/[...nextauth]";


export default async function handle(req, res) {
    const {method} = req;
    await mongooseConnect();
    await isAdminRequest(req, res)

    if (method === 'GET') {
        res.json(await Category.find().populate('parent'));
    }

    if (method === 'POST') {
        const {name, parentCategory, properties} = req.body;

        const existingCategory = await Category.findOne({ name: name });

        if (existingCategory) {
            res.status(400).json({ error: 'A category with this name already exists' });
        } else {
            const categoryDoc = await Category.create({
                name,
                parent: parentCategory || null,
                properties,
            });
            res.json(categoryDoc);
        }
    }


    if(method === 'PUT') {
        const { _id, name, parentCategory, properties, categories} = req.body;

        if (categories && Array.isArray(categories)) {
            // Handle category sorting
            for (let i = 0; i < categories.length; i++) {
                const categoryId = categories[i].id;
                await Category.updateOne(
                    { _id: categoryId },
                    { $set: { order: i } }
                );
            }
        }

        const parentCategoryDoc = await Category.findOne({_id: parentCategory});
        if (parentCategoryDoc && String(parentCategoryDoc.parent) === String(_id)) {
            res.status(400).json({ error: 'A circular reference was detected' });
        } else {
            const categoryDoc = await Category.updateOne({ _id }, {
                name,
                parent: parentCategory || null,
                properties,
            });
            res.json(categoryDoc);
        }
    }

    if (method === 'DELETE') {
        const {_id} = req.query;
        await Category.deleteOne({_id});
        res.json('ok');
    }
}
