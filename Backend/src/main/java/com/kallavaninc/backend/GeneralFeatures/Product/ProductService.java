package com.kallavaninc.backend.GeneralFeatures.Product;


import com.kallavaninc.backend.UserFeatures.Authentication.AuthenticationRepository;
import com.kallavaninc.backend.Entities.Inventory.Inventory;
import com.kallavaninc.backend.Entities.Product.Product;
import com.kallavaninc.backend.Entities.Product.ProductImage;
import com.kallavaninc.backend.Entities.Users.Seller;
import com.kallavaninc.backend.GeneralFeatures.Inventory.InventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final AuthenticationRepository authenticationRepository;
    private final InventoryRepository inventoryRepository;
    private final String uploadPath = "/app/Images/";

    public ProductService(ProductRepository productRepository, AuthenticationRepository authenticationRepository, InventoryRepository inventoryRepository) {
        this.productRepository = productRepository;
        this.authenticationRepository = authenticationRepository;
        this.inventoryRepository = inventoryRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public List<Product> getProductsBySeller(UUID sellerId) {
        return productRepository.findBySellerUserID(sellerId);
    }

    @Transactional
    public Product addProduct(UUID sellerId, Product product, List<MultipartFile> files, Integer initialStock) throws IOException {
        // 1. Find the Seller
        Seller seller = (Seller) authenticationRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        // 2. Link Seller to Product
        product.setSeller(seller);

        // 3. Defensive Null-Check: Ensure the list is initialized before adding items
        if (product.getImages() == null) {
            product.setImages(new ArrayList<>());
        }

        // 4. Handle Image Uploads
        if (files != null && !files.isEmpty()) {
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            for (MultipartFile file : files) {
                String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path destinationPath = Paths.get(uploadPath).resolve(uniqueFileName);
                Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);

                ProductImage productImage = new ProductImage();
                productImage.setFileName(uniqueFileName);
                productImage.setProduct(product);
                product.getImages().add(productImage);
            }
        }

        Product savedProduct = productRepository.save(product);

        Inventory inventory = new Inventory();
        inventory.setProduct(product);
        inventory.setQuantity(initialStock != null ? initialStock : 0);
        inventory.setSeller(seller);

        inventoryRepository.save(inventory);

        return savedProduct;
    }
    @Transactional
    public Product updateProduct(UUID sellerId, UUID productId, Product updatedData, Integer newQuantity, List<MultipartFile> newFiles) throws IOException {
        // 1. Ensure the product exists and belongs to this seller
        Product existingProduct = productRepository.findByIdAndSellerUserID(productId, sellerId)
                .orElseThrow(() -> new RuntimeException("Product not found or unauthorized access"));

        // 2. Update basic fields
        existingProduct.setName(updatedData.getName());
        existingProduct.setBrand(updatedData.getBrand());
        existingProduct.setDescription(updatedData.getDescription());
        existingProduct.setPrice(updatedData.getPrice());
        existingProduct.setCategory(updatedData.getCategory());
        existingProduct.setStatus(updatedData.getStatus());
        existingProduct.setSku(updatedData.getSku());

        // 3. Update Inventory (Independent of Product Entity)
        if (newQuantity != null) {
            Inventory inventory = inventoryRepository.findByProductId(productId)
                    .orElseThrow(() -> new RuntimeException("Inventory not found for this product"));
            inventory.setQuantity(newQuantity);
            inventoryRepository.save(inventory); // Manually save since it's no longer cascaded
        }

        // 4. Handle Images (Replacing old with new)
        if (newFiles != null && !newFiles.isEmpty()) {
            // Delete physical files from Docker volume /app/Images
            for (ProductImage oldImg : existingProduct.getImages()) {
                Path oldPath = Paths.get(uploadPath).resolve(oldImg.getFileName());
                Files.deleteIfExists(oldPath);
            }

            // Clear old database records
            existingProduct.getImages().clear();

            for (MultipartFile file : newFiles) {
                String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path destinationPath = Paths.get(uploadPath).resolve(uniqueFileName);
                Files.copy(file.getInputStream(), destinationPath, StandardCopyOption.REPLACE_EXISTING);

                ProductImage img = new ProductImage();
                img.setFileName(uniqueFileName);
                img.setProduct(existingProduct);
                existingProduct.getImages().add(img);
            }
        }

        return productRepository.save(existingProduct);
    }

    // --- DELETE PRODUCT ---
    @Transactional
    public void deleteProduct(UUID sellerId, UUID productId) throws IOException {
        Product product = productRepository.findByIdAndSellerUserID(productId, sellerId)
                .orElseThrow(() -> new RuntimeException("Product not found or unauthorized access"));

        // Delete physical files associated with the product
        for (ProductImage img : product.getImages()) {
            Path path = Paths.get(uploadPath).resolve(img.getFileName());
            Files.deleteIfExists(path);
        }

        productRepository.delete(product);
    }

    public List<Product> getProductsByCategory(String category) {
        if (category == null || category.isEmpty()) {
            return productRepository.findAll(); // Fallback: return everything if no category is provided
        }
        return productRepository.findByCategory(category);
    }

    @Transactional
    public Product updateProductStatus(UUID sellerId, UUID productId, Product.ProductStatus newStatus) {
        // 1. Authorization check
        Product product = productRepository.findByIdAndSellerUserID(productId, sellerId)
                .orElseThrow(() -> new RuntimeException("Product not found or unauthorized access"));

        // 2. Update the status enum
        product.setStatus(newStatus);

        // 3. Save and return
        return productRepository.save(product);
    }
}

