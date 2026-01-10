package com.kallavaninc.backend.Administrator;

import com.kallavaninc.backend.Entities.Users.Administrator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface AdministratorRepository extends JpaRepository<Administrator, UUID> {
    // JpaRepository provides save(), findById(), and delete()
}
