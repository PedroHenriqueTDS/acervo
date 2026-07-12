package com.biblioteca.acervo.config;

import com.biblioteca.acervo.model.Usuario;
import com.biblioteca.acervo.repository.UsuarioRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado com o e-mail: " + email));

        // Mapeia o papel com o prefixo 'ROLE_' requerido pelo Spring Security
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + usuario.getPapel().name());

        return new User(
                usuario.getEmail(),
                usuario.getSenha(),
                Collections.singletonList(authority)
        );
    }
}
