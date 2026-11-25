-- main.lua (Simulador Robô Sumô LÖVE 2D + Serial Arduino)

-- ============================================================================
-- CLASSE ROBÔ ORIENTADA A OBJETOS EM LUA
-- ============================================================================
local Robo = {}
Robo.__index = Robo

function Robo:novo(x, y)
    local obj = {
        x = x,
        y = y,
        angulo = -math.pi / 2, -- Apontando para cima
        largura = 50,
        comprimento = 56,
        pwm_esq = 0,
        pwm_dir = 0,
        acao = "AGUARDANDO PARTIDA",
        dist_frente = 999,
        dist_esq = 999,
        dist_dir = 999,
        na_borda = 0
    }
    setmetatable(obj, Robo)
    return obj
end

function Robo:atualizarFisica(dt)
    -- Converte PWM (-255..255) do Arduino para velocidade em pixels/s
    local v_esq = (self.pwm_esq / 255.0) * 140.0
    local v_dir = (self.pwm_dir / 255.0) * 140.0

    local v_linear = (v_esq + v_dir) / 2.0
    local v_angular = (v_esq - v_dir) / 42.0

    self.angulo = self.angulo + v_angular * dt
    self.x = self.x + math.cos(self.angulo) * v_linear * dt
    self.y = self.y + math.sin(self.angulo) * v_linear * dt
end

-- ============================================================================
-- VARIÁVEIS GLOBAIS DA ARENA E PORTA SERIAL
-- ============================================================================
local meuRobo
local inimigo = { x = 500, y = 200, raio = 28 }
local arena = { x = 500, y = 360, raio_total = 260, raio_borda = 242 }

local serial_in = nil
local serial_out = nil
local porta_path = "/dev/ttyACM0" -- Ou /dev/ttyUSB0 para Nano chinês CH340
local timer_envio = 0

local function conectarSerial(caminho)
    -- Configura baudrate 9600 em modo raw sem bloqueio no Linux
    os.execute(string.format("stty -F %s 9600 raw -echo -echoe -echok time 0 min 0 2>/dev/null", caminho))
    serial_in = io.open(caminho, "r")
    serial_out = io.open(caminho, "w")
    if serial_in and serial_out then
        serial_out:setvbuf("no")
        porta_path = caminho
        return true
    end
    return false
end

local function enviarSerial(cmd)
    if serial_out then
        serial_out:write(cmd .. "\n")
        serial_out:flush()
    end
end

-- Raycast 2D de feixe contra o círculo do inimigo
local function medirFeixeCm(ox, oy, angulo, max_cm)
    local escala_px_por_cm = 3.2
    local max_px = max_cm * escala_px_por_cm
    local dx = math.cos(angulo)
    local dy = math.sin(angulo)

    local fx = inimigo.x - ox
    local fy = inimigo.y - oy
    local proj = fx * dx + fy * dy

    if proj > 0 and proj <= (max_px + inimigo.raio) then
        local dist_perp_sq = (fx * fx + fy * fy) - (proj * proj)
        if dist_perp_sq <= (inimigo.raio * inimigo.raio) then
            local dist_px = math.max(3, proj - inimigo.raio)
            return math.floor(dist_px / escala_px_por_cm)
        end
    end
    return 999
end

function love.load()
    love.window.setTitle("Simulador 2D Sumô (LÖVE + Lua OOP + Arduino Uno)")
    love.window.setMode(960, 720, { msaa = 4 })
    meuRobo = Robo:novo(arena.x, arena.y + 80)

    -- Tenta conectar automaticamente em ttyACM0 (Uno) ou ttyUSB0 (Nano)
    if not conectarSerial("/dev/ttyACM0") then
        conectarSerial("/dev/ttyUSB0")
    end
end

function love.update(dt)
    -- 1. Lê telemetria não-bloqueante vinda do Arduino Uno
    if serial_in then
        local linha = serial_in:read("*l")
        while linha do
            local pe, pd, acao = linha:match("TELEM:([%-?%d]+),([%-?%d]+),[%d]+,[%d]+,[%d]+,(.+)")
            if pe and pd then
                meuRobo.pwm_esq = tonumber(pe) or 0
                meuRobo.pwm_dir = tonumber(pd) or 0
                meuRobo.acao = acao or "OPERANDO"
            end
            linha = serial_in:read("*l")
        end
    end

    -- 2. Move o inimigo clicando/arrastando com o botão esquerdo do mouse
    if love.mouse.isDown(1) then
        local mx, my = love.mouse.getPosition()
        if mx > 240 then
            inimigo.x, inimigo.y = mx, my
        end
    end

    -- 3. Atualiza a física do robô com base no PWM recebido do Arduino
    meuRobo:atualizarFisica(dt)

    -- 4. Calcula sensores (Frontal 40cm, Lasers Laterais 25cm a ±35 graus)
    local frente_x = meuRobo.x + math.cos(meuRobo.angulo) * 28
    local frente_y = meuRobo.y + math.sin(meuRobo.angulo) * 28

    meuRobo.dist_frente = medirFeixeCm(frente_x, frente_y, meuRobo.angulo, 40)
    meuRobo.dist_esq    = medirFeixeCm(frente_x, frente_y, meuRobo.angulo - 0.6, 25)
    meuRobo.dist_dir    = medirFeixeCm(frente_x, frente_y, meuRobo.angulo + 0.6, 25)

    -- Verifica se tocou na borda branca do Dohyo
    local dist_centro = math.sqrt((meuRobo.x - arena.x)^2 + (meuRobo.y - arena.y)^2)
    meuRobo.na_borda = (dist_centro >= arena.raio_borda - 22) and 1 or 0

    -- 5. Envia pacote de sensores para o Arduino a cada 80ms
    timer_envio = timer_envio + dt
    if timer_envio >= 0.08 then
        timer_envio = 0
        enviarSerial(string.format("S,%d,%d,%d,%d",
            meuRobo.dist_frente, meuRobo.dist_esq, meuRobo.dist_dir, meuRobo.na_borda))
    end
end

function love.keypressed(key)
    if key == "7" or key == "8" or key == "9" or key == "1" or key == "2" or key == "3" then
        enviarSerial(key)
    elseif key == "r" then
        meuRobo.x, meuRobo.y = arena.x, arena.y + 80
        meuRobo.angulo = -math.pi / 2
    elseif key == "c" then
        if not conectarSerial("/dev/ttyACM0") then conectarSerial("/dev/ttyUSB0") end
    end
end

function love.draw()
    love.graphics.clear(0.06, 0.09, 0.16)

    -- Desenha Dohyo (Borda Branca + Interior Cinza Escuro)
    love.graphics.setColor(0.95, 0.95, 0.95)
    love.graphics.circle("fill", arena.x, arena.y, arena.raio_total)
    love.graphics.setColor(0.12, 0.16, 0.23)
    love.graphics.circle("fill", arena.x, arena.y, arena.raio_borda)

    -- Desenha Feixes dos Sensores
    local fx = meuRobo.x + math.cos(meuRobo.angulo) * 28
    local fy = meuRobo.y + math.sin(meuRobo.angulo) * 28

    -- Feixe Frontal (40cm = 128px)
    love.graphics.setColor(0.13, 0.77, 0.36, 0.8)
    love.graphics.setLineWidth(3)
    love.graphics.line(fx, fy, fx + math.cos(meuRobo.angulo) * 128, fy + math.sin(meuRobo.angulo) * 128)

    -- Feixes Laser Laterais (25cm = 80px)
    love.graphics.setColor(0.22, 0.74, 0.97, 0.8)
    love.graphics.line(fx, fy, fx + math.cos(meuRobo.angulo - 0.6) * 80, fy + math.sin(meuRobo.angulo - 0.6) * 80)
    love.graphics.line(fx, fy, fx + math.cos(meuRobo.angulo + 0.6) * 80, fy + math.sin(meuRobo.angulo + 0.6) * 80)

    -- Desenha Robô do Usuário
    love.graphics.push()
    love.graphics.translate(meuRobo.x, meuRobo.y)
    love.graphics.rotate(meuRobo.angulo)
    love.graphics.setColor(0.01, 0.52, 0.78)
    love.graphics.rectangle("fill", -28, -25, 56, 50, 6, 6)
    love.graphics.setColor(0.98, 0.8, 0.08) -- Lâmina frontal amarela
    love.graphics.rectangle("fill", 22, -25, 8, 50)
    love.graphics.pop()

    -- Desenha Inimigo (Vermelho)
    love.graphics.setColor(0.93, 0.26, 0.26)
    love.graphics.circle("fill", inimigo.x, inimigo.y, inimigo.raio)
    love.graphics.setColor(1, 1, 1)
    love.graphics.print("INIMIGO", inimigo.x - 24, inimigo.y - 6)

    -- Painel Lateral de Telemetria
    love.graphics.setColor(0.1, 0.14, 0.22, 0.95)
    love.graphics.rectangle("fill", 12, 12, 235, 310, 8, 8)
    love.graphics.setColor(0.22, 0.74, 0.97)
    love.graphics.print("SIMULADOR LÖVE 2D + UNO", 24, 24)

    love.graphics.setColor(0.9, 0.9, 0.9)
    local status_serial = serial_in and ("Conectado (" .. porta_path .. ")") or "Desconectado (Aperte 'C')"
    love.graphics.print("Serial: " .. status_serial, 24, 52)
    love.graphics.print("Acao: " .. meuRobo.acao, 24, 76)
    love.graphics.print(string.format("PWM Esq/Dir: %d / %d", meuRobo.pwm_esq, meuRobo.pwm_dir), 24, 100)
    love.graphics.print(string.format("Ultrassonico: %d cm", meuRobo.dist_frente), 24, 124)
    love.graphics.print(string.format("Laser Esq/Dir: %d / %d cm", meuRobo.dist_esq, meuRobo.dist_dir), 24, 148)

    love.graphics.setColor(0.98, 0.8, 0.08)
    love.graphics.print("ATALHOS DO TECLADO:", 24, 185)
    love.graphics.setColor(0.75, 0.82, 0.9)
    love.graphics.print("[7, 8, 9] Escolher Estrategia", 24, 205)
    love.graphics.print("[2] Iniciar / Retomar Luta", 24, 225)
    love.graphics.print("[1] Pausar Robô", 24, 245)
    love.graphics.print("[R] Reposicionar no Centro", 24, 265)
    love.graphics.print("[Mouse Esq] Mover Inimigo", 24, 285)
end


