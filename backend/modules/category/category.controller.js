const Category = require("./category.schema");
const asyncHandler = require("../../utils/asyncHandler");
const response = require("../../utils/response");

const getCategories = asyncHandler(async (req, res) => {
  const filter = req.user?.role === "admin" || req.user?.role === "manager"
    ? {}
    : { isActive: true };

  const categories = await Category.find(filter).sort({ createdAt: -1 });
  return response.success(res, "Categories fetched successfully", { categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, isActive } = req.body;

  if (!name?.en || !name?.ta) {
    return response.error(res, "Category name is required in English and Tamil", 400);
  }

  const category = await Category.create({ name, description, image, isActive });
  return response.success(res, "Category created successfully", { category }, 201);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) return response.error(res, "Category not found", 404);
  return response.success(res, "Category updated successfully", { category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return response.error(res, "Category not found", 404);
  return response.success(res, "Category deleted successfully");
});

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
