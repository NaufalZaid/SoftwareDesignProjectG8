// CategoriesTab.jsx - Category management tab component
import { useEffect, useState } from "react";
import {
  getCategoryTree,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/adminApi";

function CategoriesTab() {
  // =========================
  // CATEGORIES STATE
  // =========================
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    icon: "",
    parentId: "",
  });
  const [expandedCategories, setExpandedCategories] = useState({});

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError("");
    try {
      const data = await getCategoryTree();
      setCategories(data || []);
    } catch (e) {
      setCategoriesError(e.message || "Failed to load categories.");
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", description: "", icon: "", parentId: "" });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      alert("Category name is required.");
      return;
    }

    try {
      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || null,
        icon: categoryForm.icon.trim() || null,
        parentId: categoryForm.parentId || null,
      };
      await createCategory(payload);
      alert("Category created successfully!");
      resetCategoryForm();
      fetchCategories();
    } catch (e) {
      alert(e.message || "Failed to create category.");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory || !categoryForm.name.trim()) {
      alert("Category name is required.");
      return;
    }

    try {
      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim() || null,
        icon: categoryForm.icon.trim() || null,
        parentId: categoryForm.parentId || null,
      };
      await updateCategory(editingCategory.id, payload);
      alert("Category updated successfully!");
      resetCategoryForm();
      fetchCategories();
    } catch (e) {
      alert(e.message || "Failed to update category.");
    }
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? Child categories will become root categories.`)) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      alert("Category deleted successfully!");
      fetchCategories();
    } catch (e) {
      alert(e.message || "Failed to delete category.");
    }
  };

  const startEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || "",
      description: category.description || "",
      icon: category.icon || "",
      parentId: category.parentId || "",
    });
    setShowCategoryForm(true);
  };

  const toggleCategoryExpand = (categoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Flatten categories for parent dropdown (exclude self and children when editing)
  const getFlatCategories = (cats, level = 0, result = []) => {
    for (const cat of cats) {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        getFlatCategories(cat.children, level + 1, result);
      }
    }
    return result;
  };

  const flatCategories = getFlatCategories(categories);

  // Render category tree recursively
  const renderCategoryTree = (cats, level = 0) => {
    return cats.map((cat) => {
      const hasChildren = cat.children && cat.children.length > 0;
      const isExpanded = expandedCategories[cat.id];

      return (
        <div key={cat.id} className="categoryItem" style={{ marginLeft: level * 20 }}>
          <div className="categoryRow">
            <div className="categoryInfo">
              {hasChildren && (
                <button
                  className="expandBtn"
                  onClick={() => toggleCategoryExpand(cat.id)}
                >
                  {isExpanded ? "▼" : "▶"}
                </button>
              )}
              {!hasChildren && <span className="expandPlaceholder"></span>}
              {cat.icon && <span className="categoryIcon">{cat.icon}</span>}
              <span className="categoryName">{cat.name}</span>
              {cat.description && (
                <span className="categoryDesc"> - {cat.description}</span>
              )}
            </div>
            <div className="categoryActions">
              <button className="smallBtn" onClick={() => startEditCategory(cat)}>
                Edit
              </button>
              <button
                className="smallBtn danger"
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
              >
                Delete
              </button>
            </div>
          </div>
          {hasChildren && isExpanded && (
            <div className="categoryChildren">
              {renderCategoryTree(cat.children, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="card">
      <div className="categoryHeader">
        <h2 className="sectionTitle">Manage Product Categories</h2>
        <button
          className="primaryBtn"
          onClick={() => {
            resetCategoryForm();
            setShowCategoryForm(true);
          }}
        >
          + Add Category
        </button>
      </div>
      <div className="helpText">
        Create and manage product categories. Categories can be nested (parent/child hierarchy).
      </div>

      {categoriesError && <div className="errorBox">{categoriesError}</div>}

      {/* Add/Edit Category Form */}
      {showCategoryForm && (
        <div className="categoryFormCard">
          <h3>{editingCategory ? "Edit Category" : "Add New Category"}</h3>
          <form onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}>
            <div className="categoryFormGrid">
              <div className="formGroup">
                <label>Name *</label>
                <input
                  type="text"
                  name="name"
                  value={categoryForm.name}
                  onChange={handleCategoryFormChange}
                  placeholder="e.g., Electronics"
                  className="input"
                  required
                />
              </div>
              <div className="formGroup">
                <label>Icon (optional)</label>
                <input
                  type="text"
                  name="icon"
                  value={categoryForm.icon}
                  onChange={handleCategoryFormChange}
                  placeholder="e.g., laptop, shirt, home"
                  className="input"
                />
              </div>
              <div className="formGroup">
                <label>Parent Category (optional)</label>
                <select
                  name="parentId"
                  value={categoryForm.parentId}
                  onChange={handleCategoryFormChange}
                  className="input"
                >
                  <option value="">-- No Parent (Root Category) --</option>
                  {flatCategories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {"─".repeat(c.level)} {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="formGroup full">
                <label>Description (optional)</label>
                <textarea
                  name="description"
                  value={categoryForm.description}
                  onChange={handleCategoryFormChange}
                  placeholder="Brief description of this category"
                  className="textarea categoryTextarea"
                />
              </div>
            </div>
            <div className="categoryFormActions">
              <button type="submit" className="primaryBtn">
                {editingCategory ? "Update Category" : "Create Category"}
              </button>
              <button type="button" className="secondaryBtn" onClick={resetCategoryForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Tree */}
      <div className="categoryTreeHeader">
        <h3>Categories</h3>
        <button
          className="secondaryBtn"
          onClick={fetchCategories}
          disabled={categoriesLoading}
        >
          {categoriesLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {categoriesLoading && <div className="helpText">Loading categories...</div>}

      {!categoriesLoading && categories.length === 0 && (
        <div className="helpText">No categories found. Create your first category above!</div>
      )}

      {!categoriesLoading && categories.length > 0 && (
        <div className="categoryTree">
          {renderCategoryTree(categories)}
        </div>
      )}
    </div>
  );
}

export default CategoriesTab;
