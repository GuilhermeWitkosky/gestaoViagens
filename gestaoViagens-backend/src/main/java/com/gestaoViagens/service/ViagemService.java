package com.gestaoViagens.service;

import com.gestaoViagens.DTO.PontoRotaResponse;
import com.gestaoViagens.DTO.UsuarioMotoristaResumoResponse;
import com.gestaoViagens.DTO.ViagemCreateRequest;
import com.gestaoViagens.DTO.ViagemResponse;
import com.gestaoViagens.ENUM.Role;
import com.gestaoViagens.ENUM.StatusPontoRota;
import com.gestaoViagens.ENUM.StatusViagem;
import com.gestaoViagens.entity.Local;
import com.gestaoViagens.entity.PontoRota;
import com.gestaoViagens.entity.Usuario;
import com.gestaoViagens.entity.Viagem;
import com.gestaoViagens.repository.LocalRepository;
import com.gestaoViagens.repository.PontoRotaRepository;
import com.gestaoViagens.repository.UsuarioRepository;
import com.gestaoViagens.repository.ViagemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class ViagemService {

    private final ViagemRepository viagemRepository;
    private final LocalRepository localRepository;
    private final UsuarioRepository usuarioRepository;
    private final PontoRotaRepository pontoRotaRepository;

    public ViagemService(ViagemRepository viagemRepository,
                         LocalRepository localRepository,
                         UsuarioRepository usuarioRepository,
                         PontoRotaRepository pontoRotaRepository) {
        this.viagemRepository = viagemRepository;
        this.localRepository = localRepository;
        this.usuarioRepository = usuarioRepository;
        this.pontoRotaRepository = pontoRotaRepository;
    }

    // ADMIN

    @Transactional(readOnly = true)
    public List<ViagemResponse> listarTodasParaAdmin() {
        return viagemRepository.findAll().stream()
                .sorted(Comparator.comparing(Viagem::getDataCriacao).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ViagemResponse buscarPorIdParaAdmin(Long id) {
        Viagem viagem = viagemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Viagem não encontrada"));
        return toResponse(viagem);
    }

    // MOTORISTA

    @Transactional(readOnly = true)
    public List<ViagemResponse> listarParaMotorista(String emailMotorista) {
        Usuario motorista = usuarioRepository.findByEmailAndAtivoTrue(emailMotorista)
                .orElseThrow(() -> new IllegalArgumentException("Motorista não encontrado ou inativo"));

        return viagemRepository.findAll().stream()
                .filter(v -> v.getMotorista() != null
                        && v.getMotorista().getId() != null
                        && v.getMotorista().getId().equals(motorista.getId()))
                .sorted(Comparator.comparing(Viagem::getDataCriacao).reversed())
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ViagemResponse buscarPorIdParaMotorista(Long id, String emailMotorista) {
        Usuario motorista = usuarioRepository.findByEmailAndAtivoTrue(emailMotorista)
                .orElseThrow(() -> new IllegalArgumentException("Motorista não encontrado ou inativo"));

        Viagem viagem = viagemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Viagem não encontrada"));

        if (viagem.getMotorista() == null
                || viagem.getMotorista().getId() == null
                || !viagem.getMotorista().getId().equals(motorista.getId())) {
            throw new IllegalArgumentException("Viagem não pertence ao motorista");
        }

        return toResponse(viagem);
    }

    @Transactional
    public ViagemResponse criarViagemParaMotorista(ViagemCreateRequest request, String emailMotorista) {
        if (request == null || request.locaisIds() == null || request.locaisIds().size() < 2) {
            throw new IllegalArgumentException("É necessário informar pelo menos dois locais");
        }

        Usuario motorista = usuarioRepository.findByEmailAndAtivoTrue(emailMotorista)
                .orElseThrow(() -> new IllegalArgumentException("Motorista não encontrado ou inativo"));

        Viagem viagem = new Viagem();
        viagem.setNome(request.nome() != null && !request.nome().isBlank()
                ? request.nome()
                : "Viagem " + LocalDateTime.now());
        viagem.setStatus(StatusViagem.PLANEJADA);
        viagem.setDataCriacao(LocalDateTime.now());
        viagem.setMotorista(motorista);

        Viagem salva = viagemRepository.save(viagem);

        int ordem = 1;
        for (Long localId : request.locaisIds()) {
            Local local = localRepository.findById(localId)
                    .orElseThrow(() -> new IllegalArgumentException("Local não encontrado: " + localId));

            PontoRota ponto = new PontoRota();
            ponto.setViagem(salva);
            ponto.setLocal(local);
            ponto.setOrdem(ordem++);
            ponto.setStatus(StatusPontoRota.PENDENTE);

            pontoRotaRepository.save(ponto);
        }

        Viagem completa = viagemRepository.findById(salva.getId())
                .orElseThrow(() -> new IllegalStateException("Erro ao recarregar viagem"));

        return toResponse(completa);
    }

    @Transactional
    public ViagemResponse criarViagemComoAdmin(ViagemCreateRequest request) {
        if (request == null || request.locaisIds() == null || request.locaisIds().size() < 2) {
            throw new IllegalArgumentException("É necessário informar pelo menos dois locais");
        }
        if (request.motoristaId() == null) {
            throw new IllegalArgumentException("É necessário informar o motorista da viagem");
        }

        Usuario motorista = usuarioRepository.findById(request.motoristaId())
                .orElseThrow(() -> new IllegalArgumentException("Motorista não encontrado"));

        // se tiver campo "ativo" e enum Role.MOTORISTA, pode reforçar:
        if (!motorista.isAtivo()) {
            throw new IllegalArgumentException("Motorista inativo");
        }

        // if (motorista.getRole() != Role.MOTORISTA) {
        //     throw new IllegalArgumentException("Usuário informado não é motorista");
        // }

        Viagem viagem = new Viagem();
        viagem.setNome(request.nome() != null && !request.nome().isBlank()
                ? request.nome()
                : "Viagem " + LocalDateTime.now());
        viagem.setStatus(StatusViagem.PLANEJADA);
        viagem.setDataCriacao(LocalDateTime.now());
        viagem.setMotorista(motorista);

        Viagem salva = viagemRepository.save(viagem);

        int ordem = 1;
        for (Long localId : request.locaisIds()) {
            Local local = localRepository.findById(localId)
                    .orElseThrow(() -> new IllegalArgumentException("Local não encontrado: " + localId));

            PontoRota ponto = new PontoRota();
            ponto.setViagem(salva);
            ponto.setLocal(local);
            ponto.setOrdem(ordem++);
            ponto.setStatus(StatusPontoRota.PENDENTE);

            pontoRotaRepository.save(ponto);
        }

        Viagem completa = viagemRepository.findById(salva.getId())
                .orElseThrow(() -> new IllegalStateException("Erro ao recarregar viagem"));

        return toResponse(completa);
    }


    @Transactional
    public ViagemResponse marcarPontoComoVisitado(Long viagemId, Long pontoId, String emailMotorista) {
        Usuario motorista = usuarioRepository.findByEmailAndAtivoTrue(emailMotorista)
                .orElseThrow(() -> new IllegalArgumentException("Motorista não encontrado ou inativo"));

        Viagem viagem = viagemRepository.findById(viagemId)
                .orElseThrow(() -> new IllegalArgumentException("Viagem não encontrada"));

        if (viagem.getMotorista() == null
                || viagem.getMotorista().getId() == null
                || !viagem.getMotorista().getId().equals(motorista.getId())) {
            throw new IllegalArgumentException("Viagem não pertence ao motorista");
        }

        PontoRota ponto = pontoRotaRepository.findById(pontoId)
                .orElseThrow(() -> new IllegalArgumentException("Ponto da rota não encontrado"));

        if (!ponto.getViagem().getId().equals(viagemId)) {
            throw new IllegalArgumentException("Ponto não pertence à viagem informada");
        }

        if (ponto.getStatus() == StatusPontoRota.VISITADO) {
            return toResponse(viagem);
        }

        if (viagem.getStatus() == StatusViagem.PLANEJADA) {
            viagem.setStatus(StatusViagem.EM_ANDAMENTO);
            viagem.setDataInicio(LocalDateTime.now());
        }

        ponto.setStatus(StatusPontoRota.VISITADO);
        pontoRotaRepository.save(ponto);

        boolean todosVisitados = viagem.getPontos().stream()
                .allMatch(p -> p.getStatus() == StatusPontoRota.VISITADO);

        if (todosVisitados) {
            viagem.setStatus(StatusViagem.CONCLUIDA);
            viagem.setDataFim(LocalDateTime.now());
        }

        Viagem salva = viagemRepository.save(viagem);
        return toResponse(salva);
    }

    private ViagemResponse toResponse(Viagem viagem) {
        List<PontoRotaResponse> pontos = viagem.getPontos().stream()
                .sorted(Comparator.comparing(PontoRota::getOrdem))
                .map(this::toPontoResponse)
                .toList();

        return new ViagemResponse(
                viagem.getId(),
                viagem.getNome(),
                viagem.getStatus(),
                viagem.getDataCriacao(),
                viagem.getDataInicio(),
                viagem.getDataFim(),
                viagem.getMotorista() != null ? viagem.getMotorista().getNome() : null,
                pontos
        );
    }

    private PontoRotaResponse toPontoResponse(PontoRota p) {
        Local local = p.getLocal();
        return new PontoRotaResponse(
                p.getId(),
                p.getOrdem(),
                p.getStatus(),
                local != null ? local.getId() : null,
                local != null ? local.getNome() : null,
                local != null ? local.getEndereco() : null,
                local != null ? local.getLatitude() : null,
                local != null ? local.getLongitude() : null
        );
    }

    @Transactional(readOnly = true)
    public List<UsuarioMotoristaResumoResponse> listarMotoristasAtivos() {
        return usuarioRepository.findByRoleAndAtivoTrue(Role.MOTORISTA)
                .stream()
                .map(u -> new UsuarioMotoristaResumoResponse(
                        u.getId(),
                        u.getNome(),
                        u.getEmail()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ViagemResponse> listarTodasComInativos() {
        return viagemRepository.findAll()  // Consulta todas as viagens
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ViagemResponse iniciarViagem(Long viagemId) {
        Viagem viagem = viagemRepository.findById(viagemId)
                .orElseThrow(() -> new IllegalArgumentException("Viagem não encontrada"));

        viagem.setStatus(StatusViagem.EM_ANDAMENTO);
        viagem.setDataInicio(LocalDateTime.now());
        viagemRepository.save(viagem);

        return toResponse(viagem);
    }



}
