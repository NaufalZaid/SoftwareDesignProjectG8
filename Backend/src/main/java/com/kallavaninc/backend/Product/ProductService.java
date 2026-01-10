package com.kallavaninc.backend.Product;


import com.kallavaninc.backend.Authentication.AuthenticationRepository;
import com.kallavaninc.backend.Entities.Product.Product;
import com.kallavaninc.backend.Entities.Product.ProductImage;
import com.kallavaninc.backend.Entities.Users.Seller;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final AuthenticationRepository authenticationRepository;

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

    public Product addProduct(UUID sellerId, Product product, List<MultipartFile> files) throws IOException {
        // 1. Find the Seller
        Seller seller = (Seller) authenticationRepository.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));

        // 2. Link Seller to Product
        product.setSeller(seller);

        // 3. Process Images if they exist
        if (files != null && !files.isEmpty()) {
            List<ProductImage> productImages = new ArrayList<>();
            for (MultipartFile file : files) {
                ProductImage img = new ProductImage();
                img.setFileName(file.getOriginalFilename());
                img.setImageData(file.getBytes());
                img.setProduct(product); // Link image back to product
                productImages.add(img);
            }
            product.setImages(productImages);
        }

        return productRepository.save(product);
    }

    @Transactional
    public Product updateProduct(UUID sellerId, UUID productId, Product updatedData, List<MultipartFile> newFiles) throws IOException {
        // 1. Ensure the product exists and belongs to this seller
        Product existingProduct = productRepository.findByIdAndSellerUserID(productId, sellerId)
                .orElseThrow(() -> new RuntimeException("Product not found or unauthorized access"));

        // 2. Update text fields
        existingProduct.setName(updatedData.getName());
        existingProduct.setBrand(updatedData.getBrand());
        existingProduct.setDescription(updatedData.getDescription());
        existingProduct.setPrice(updatedData.getPrice());
        existingProduct.setStatus(updatedData.getStatus());
        existingProduct.setSku(updatedData.getSku());

        // 3. Handle Images (Optional: Overwrite or Add)
        if (newFiles != null && !newFiles.isEmpty()) {
            // Option: Clear old images and add new ones
            existingProduct.getImages().clear();
            for (MultipartFile file : newFiles) {
                ProductImage img = new ProductImage();
                img.setFileName(file.getOriginalFilename());
                img.setImageData(file.getBytes());
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

