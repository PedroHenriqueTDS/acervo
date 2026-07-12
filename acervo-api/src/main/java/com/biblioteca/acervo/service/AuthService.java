package com.biblioteca.acervo.service;

import com.biblioteca.acervo.config.JwtTokenProvider;
import com.biblioteca.acervo.dto.CadastroRequest;
import com.biblioteca.acervo.dto.LoginRequest;
import com.biblioteca.acervo.dto.LoginResponse;
import com.biblioteca.acervo.dto.UsuarioResponse;
import com.biblioteca.acervo.exception.RegraNegocioException;
import com.biblioteca.acervo.model.Papel;
import com.biblioteca.acervo.model.Usuario;
import com.biblioteca.acervo.repository.UsuarioRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@SuppressWarnings("null")
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            AuthenticationManager authenticationManager) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public UsuarioResponse cadastrar(CadastroRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RegraNegocioException("E-mail já cadastrado no sistema");
        }
        Papel papel = Papel.USUARIO; // Força usuário padrão, ignorando a requisição

        Usuario usuario = Usuario.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .senha(passwordEncoder.encode(request.getSenha()))
                .papel(papel)
                .build();

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        return mapearParaResponse(usuarioSalvo);
    }

    public LoginResponse logar(LoginRequest request) {
        // Realiza a autenticação via Spring Security (valida credenciais, lança BadCredentialsException se falhar)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
        );

        // Busca o usuário para gerar as informações de resposta
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        String token = jwtTokenProvider.gerarToken(usuario.getEmail(), usuario.getPapel());

        return LoginResponse.builder()
                .token(token)
                .usuario(mapearParaResponse(usuario))
                .build();
    }

    private UsuarioResponse mapearParaResponse(Usuario usuario) {
        return UsuarioResponse.builder()
                .id(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .papel(usuario.getPapel())
                .dataCadastro(usuario.getDataCadastro())
                .build();
    }
}
