package com.kallavaninc.backend.Entities.Users;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

@Entity // Necessary for JPA to recognize this as a table
@Table(name = "administrators") //  Maps to the customers table
@Getter
@Setter
@EqualsAndHashCode(callSuper = true)
public class Administrator extends User{

}
