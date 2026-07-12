package com.biblioteca.acervo.config;

import com.biblioteca.acervo.model.Papel;
import com.biblioteca.acervo.model.Usuario;
import com.biblioteca.acervo.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@SuppressWarnings("null")
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!usuarioRepository.existsByPapel(Papel.BIBLIOTECARIO)) {
            logger.info("Nenhum bibliotecário encontrado no sistema. Criando usuário admin padrão...");

            Usuario admin = Usuario.builder()
                    .nome("Administrador do Sistema")
                    .email("admin@biblioteca.com")
                    .senha(passwordEncoder.encode("admin123"))
                    .papel(Papel.BIBLIOTECARIO)
                    .build();

            usuarioRepository.save(admin);
            logger.info("Usuário admin padrão criado com sucesso: admin@biblioteca.com / admin123");
        } else {
            logger.info("Bibliotecário já existe no sistema. Pulando criação de admin padrão.");
        }
    }
}
