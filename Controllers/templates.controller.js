import templatesModel from "../Models/templates.model.js"




const getAllTemplates = async (req, res) => {
    try {
        const templates = await templatesModel.find();
        return res.status(200).json({ message: 'success', templates })
    } catch (error) {
        return res.status(500).json({ message: 'error' })
    }
}


export { getAllTemplates }