package com.ofos.config;

import com.ofos.models.Restaurant;
import com.ofos.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Override
    public void run(String... args) throws Exception {
        // Only seed if no restaurants exist
        if (restaurantRepository.count() == 0) {
            Restaurant r1 = new Restaurant();
            r1.setName("Pizza Palace");
            r1.setAddress("123 Main Street, Downtown");
            r1.setCuisine("Italian");
            r1.setImage("https://images.unsplash.com/photo-1513104890138-7c749659a591");
            restaurantRepository.save(r1);

            Restaurant r2 = new Restaurant();
            r2.setName("Burger King");
            r2.setAddress("456 Oak Avenue, Midtown");
            r2.setCuisine("American");
            r2.setImage("https://images.unsplash.com/photo-1571091718767-18b5b1457add");
            restaurantRepository.save(r2);

            Restaurant r3 = new Restaurant();
            r3.setName("Sushi House");
            r3.setAddress("789 Pine Road, Uptown");
            r3.setCuisine("Japanese");
            r3.setImage("https://images.unsplash.com/photo-1579584425555-c3ce17fd4351");
            restaurantRepository.save(r3);

            Restaurant r4 = new Restaurant();
            r4.setName("Taco Bell");
            r4.setAddress("321 Elm Street, Westside");
            r4.setCuisine("Mexican");
            r4.setImage("https://images.unsplash.com/photo-1565299585323-38174c0d73d2");
            restaurantRepository.save(r4);

            Restaurant r5 = new Restaurant();
            r5.setName("Curry Express");
            r5.setAddress("654 Maple Drive, Eastside");
            r5.setCuisine("Indian");
            r5.setImage("https://images.unsplash.com/photo-1585937421612-70a008356fbe");
            restaurantRepository.save(r5);

            System.out.println("Sample restaurants seeded successfully!");
        }
    }
}
