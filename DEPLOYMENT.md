
# 🚀 PROTOCOLO DE IMPLANTAÇÃO: AEGIS SYSTEM

**NÍVEL DE CLASSIFICAÇÃO: CONFIDENCIAL**
**AUTOR:** Architectus Aegis

Este documento descreve os procedimentos padrão para implantar o sistema de Monitoramento Tático em infraestrutura hostil ou controlada.

## 1. Requisitos de Infraestrutura (Hardware Tático)

*   **CPU:** 2 vCPU (Mínimo) - Recomendado 4 vCPU para processamento de vídeo/socket.
*   **RAM:** 4GB (Mínimo) - Node.js é ávido por memória sob carga.
*   **Armazenamento:** 20GB SSD (Logs, Banco de Dados SQLite e Mídia Capturada).
*   **SO:** Ubuntu 22.04 LTS ou Debian 11 (Hardened).

## 2. Configuração Inicial (Servidor Alvo)

Acesse o servidor via SSH seguro:

```bash
ssh user@tactical-server-ip
```

Instale Docker e Docker Compose (se já não estiverem instalados):

```bash
# Instalar Docker
curl -fsSL https://get.docker.sh -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ${USER}
# Re-login para aplicar as permissões do grupo docker

# Instalar Docker Compose (v2)
sudo apt-get update
sudo apt-get install docker-compose-plugin
```

## 3. Implantação Manual (Cold Start)

1.  Clone o repositório seguro:
    ```bash
    git clone https://github.com/your-org/tactical-surveillance.git /opt/tactical-surveillance
    cd /opt/tactical-surveillance
    ```

2.  Configure as variáveis de ambiente essenciais para produção:
    ```bash
    cp .env.example .env
    nano .env
    # ALERTA: Altere JWT_SECRET para uma string forte e única imediatamente.
    # Defina FRONTEND_URL para o domínio público onde seu dashboard será acessível (e.g., https://your-domain.com).
    ```

3.  Inicie a sequência de boot em modo de produção:
    ```bash
    docker-compose -f docker-compose.prod.yml up -d --build
    ```
    *Isso construirá as imagens do Docker (backend e frontend com Nginx) e as iniciará em background.*

4.  Verifique a integridade dos sistemas:
    ```bash
    docker-compose -f docker-compose.prod.yml ps
    docker-compose -f docker-compose.prod.yml logs -f
    ```
    *Monitore os logs para garantir que ambos os serviços (backend e frontend) foram iniciados sem erros e que o backend está acessível na porta 3000 (internamente) e o frontend na porta 80 (publicamente).*

## 4. Segurança de Borda (Firewall & SSL)

**NUNCA** exponha a porta 3000 (Backend API) diretamente à internet pública. O Nginx no container do `frontend` já atua como proxy reverso para `backend:3000`.

### Configuração UFW (Uncomplicated Firewall)
```bash
sudo ufw allow 22/tcp       # Para acesso SSH
sudo ufw allow 80/tcp       # Para o Nginx (HTTP)
sudo ufw allow 443/tcp      # Para o Nginx (HTTPS, se configurado)
sudo ufw enable
sudo ufw status
```

### SSL com Certbot (Recomendado)
Para HTTPS, é altamente recomendado usar Certbot. Você pode:
1.  **Configurar Certbot no host:** Instale o Certbot no host e configure-o para emitir certificados para o domínio do seu Nginx (que está no container). O Certbot pode ajustar automaticamente a configuração do Nginx no host para usar SSL.
2.  **Configurar Certbot no Nginx Container:** Mais complexo, mas possível. Requer montagem de volumes para os certificados e scripts de renovação.

**Exemplo básico de obtenção de certificado (se Nginx estiver no host):**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```
*Se você usar o Nginx no container, precisará configurar o proxy reverso para 443 também e mapear os volumes de certificados para o container.*

## 5. Procedimentos de Recuperação (Disaster Recovery)

O banco de dados SQLite e a mídia de upload são persistidos em volumes Docker.

**Backup Tático dos Dados:**
```bash
# Parar o serviço de backend temporariamente para garantir consistência do DB
docker-compose -f docker-compose.prod.yml stop backend

# Criar um container temporário para copiar os dados
docker run --rm --volumes-from tactical_db_data -v $(pwd)/backup:/backup alpine sh -c "cp -R /app/prisma/db /backup/prisma_db_$(date +%F)"
docker run --rm --volumes-from tactical_uploads -v $(pwd)/backup:/backup alpine sh -c "cp -R /app/uploads /backup/uploads_$(date +%F)"

# Reiniciar o serviço de backend
docker-compose -f docker-compose.prod.yml start backend

# Os backups estarão em ./backup/prisma_db_YYYY-MM-DD e ./backup/uploads_YYYY-MM-DD no seu host.
```
*Substitua `$(pwd)/backup` pelo caminho desejado no seu host para armazenar os backups.*
