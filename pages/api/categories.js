import {mongooseConnect} from "@/lib/mongoose";
import {Category} from "@/models/Category";
import {getServerSession} from "next-auth";
import {authOption, isAdminRequest} from "@/pages/api/auth/[...nextauth]";


export default async function handle(req, res) {
    const {method} = req;
    await mongooseConnect();
    await isAdminRequest(req, res)

    if (method === 'GET') {
        res.json(await Category.find().populate('parent'));
    }

    if (method === 'POST') {
        const {name, parentCategory, properties} = req.body;

        // Check if a category with the given name already exists
        const existingCategory = await Category.findOne({ name: name });

        if (existingCategory) {
            // If it does, return an error response
            res.status(400).json({ error: 'A category with this name already exists' });
        } else {
            // If it doesn't, create the new category
            const categoryDoc = await Category.create({
                name,
                parent: parentCategory || null,
                properties,
            });
            res.json(categoryDoc);
        }
    }


    if(method === 'PUT') {
        const { _id, name, parentCategory, properties} = req.body;

        // Find the category that is about to be set as a parent
        const parentCategoryDoc = await Category.findOne({_id: parentCategory});
        // If its parent is the current category, return an error
        if (parentCategoryDoc && String(parentCategoryDoc.parent) === String(_id)) {
            res.status(400).json({ error: 'A circular reference was detected' });
        } else {
            // If it's not, proceed with updating the current category
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
