package com.biblioteca.acervo.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarConfirmacaoEmprestimo(String destinatario, String nomeUsuario, String tituloLivro, LocalDateTime dataPrevista) {
        String assunto = "Acervo — Confirmação de Empréstimo";
        String corpo = String.format(
                "Olá, %s!\n\n" +
                "Confirmamos o empréstimo do livro \"%s\" em sua ficha de leitor.\n" +
                "A data prevista para devolução é: %s.\n\n" +
                "Evite multas devolvendo o livro no prazo. Boa leitura!\n\n" +
                "Biblioteca Acervo",
                nomeUsuario, tituloLivro, dataPrevista.format(FORMATTER)
        );
        enviarEmailSilencioso(destinatario, assunto, corpo);
    }

    public void enviarNotificacaoReservaPronta(String destinatario, String nomeUsuario, String tituloLivro) {
        String assunto = "Acervo — Seu livro reservado está disponível!";
        String corpo = String.format(
                "Olá, %s!\n\n" +
                "Temos boas notícias! O livro \"%s\" já está disponível para retirada.\n" +
                "Você tem 48 horas para confirmar o empréstimo através do seu painel no sistema.\n" +
                "Caso não confirme dentro desse prazo, a cópia será destinada ao próximo da fila.\n\n" +
                "Biblioteca Acervo",
                nomeUsuario, tituloLivro
        );
        enviarEmailSilencioso(destinatario, assunto, corpo);
    }

    public void enviarAlertaVencimentoProximo(String destinatario, String nomeUsuario, String tituloLivro, LocalDateTime dataPrevista) {
        String assunto = "Acervo — Aviso de vencimento próximo";
        String corpo = String.format(
                "Olá, %s!\n\n" +
                "Lembramos que o prazo de empréstimo do livro \"%s\" está próximo do fim.\n" +
                "A data limite para devolução sem multas é: %s.\n\n" +
                "Regularize suas pendências no balcão da biblioteca ou via sistema.\n\n" +
                "Biblioteca Acervo",
                nomeUsuario, tituloLivro, dataPrevista.format(FORMATTER)
        );
        enviarEmailSilencioso(destinatario, assunto, corpo);
    }

    private void enviarEmailSilencioso(String para, String assunto, String texto) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("biblioteca@acervo.com");
            message.setTo(para);
            message.setSubject(assunto);
            message.setText(texto);
            mailSender.send(message);
            System.out.println("E-mail enviado com sucesso para: " + para + " - Assunto: " + assunto);
        } catch (Exception e) {
            // Captura erros silenciosamente para que falhas de conexão SMTP não quebrem a transação de negócio principal
            System.err.println("Erro ao enviar e-mail para: " + para + " (Serviço SMTP offline). Detalhes: " + e.getMessage());
        }
    }
}
