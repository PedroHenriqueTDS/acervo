package com.biblioteca.acervo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AcervoApplication {

    public static void main(String[] args) {
        SpringApplication.run(AcervoApplication.class, args);
    }
}
