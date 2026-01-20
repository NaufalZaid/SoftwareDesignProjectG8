package com.kallavaninc.backend.Product;


import com.kallavaninc.backend.Authentication.AuthenticationRepository;
import com.kallavaninc.backend.Entities.Product.Product;
import com.kallavaninc.backend.Entities.Product.ProductImage;
import com.kallavaninc.backend.Entities.Users.Seller;
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
    private final String uploadPath = "/app/Images/";

    public ProductService(ProductRepository productRepository, AuthenticationRepository authenticationRepository) {
        this.productRepository = productRepository;
        this.authenticationRepository = authenticationRepository;
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
    public Product addProduct(UUID sellerId, Product product, List<MultipartFile> files) throws IOException {
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

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(UUID sellerId, UUID productId, Product updatedData, List<MultipartFile> newFiles) throws IOException {
        // 1. Ensure the product exists and belongs to this seller
        Product existingProduct = productRepository.findByIdAndSellerUserID(productId, sellerId)
                .orElseThrow(() -> new RuntimeException("Product not found or unauthorized access"));

        // 2. Defensive Null-Check: Ensure existing collection is ready for operations
        if (existingProduct.getImages() == null) {
            existingProduct.setImages(new ArrayList<>());
        }

        // 3. Update basic fields
        existingProduct.setName(updatedData.getName());
        existingProduct.setBrand(updatedData.getBrand());
        existingProduct.setDescription(updatedData.getDescription());
        existingProduct.setPrice(updatedData.getPrice());
        existingProduct.setStatus(updatedData.getStatus());
        existingProduct.setSku(updatedData.getSku());

        // 4. Handle Images (Replacing old with new)
        if (newFiles != null && !newFiles.isEmpty()) {
            // Delete physical files from /app/Images folder
            for (ProductImage oldImg : existingProduct.getImages()) {
                Path oldPath = Paths.get(uploadPath).resolve(oldImg.getFileName());
                Files.deleteIfExists(oldPath);
            }

            // Clear database records
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
    public void deleteProduct(UUID sellerId, UUID productId) {
        // Verify ownership before deleting
        Product product = productRepository.findByIdAndSellerUserID(productId, sellerId)
                .orElseThrow(() -> new RuntimeException("Product not found or unauthorized access"));

        productRepository.delete(product);
    }
}

