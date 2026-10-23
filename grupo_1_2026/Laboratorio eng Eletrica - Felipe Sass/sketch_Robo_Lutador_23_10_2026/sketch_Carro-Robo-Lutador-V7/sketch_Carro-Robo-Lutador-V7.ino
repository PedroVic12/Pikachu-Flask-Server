#include <Arduino.h>
#include <IRremote.hpp>
#include <Wire.h>

#define MODO_SIMULACAO_TECLADO 1

#if !MODO_SIMULACAO_TECLADO
#include <VL53L0X.h>
VL53L0X Sensor1;
VL53L0X Sensor2;
#endif

constexpr uint8_t IR_RECEIVE_PIN = 11;
constexpr uint8_t SENSOR_LINHA = A0;
constexpr uint8_t TRIG = A2;
constexpr uint8_t ECHO = A3;

constexpr uint8_t IN1_ESQ = 10;
constexpr uint8_t IN2_ESQ = 9;
constexpr uint8_t IN3_DIR = 6;
constexpr uint8_t IN4_DIR = 5;

constexpr unsigned long READY_CODE = 0x80;
constexpr unsigned long START_CODE = 0x81;
constexpr unsigned long STOP_CODE = 0x82;
constexpr unsigned long STRATEGY_7_CODE = 0x86;
constexpr unsigned long STRATEGY_8_CODE = 0x88;
constexpr unsigned long STRATEGY_9_CODE = 0x87;

constexpr int PWM_MAX = 255;
constexpr int PWM_RE = 220;
constexpr int PWM_GIRO = 180;
constexpr int PWM_BUSCA = 140;
constexpr int PWM_AVANCO_AGRESSIVO = 255;

constexpr unsigned long TEMPO_RE = 400;
constexpr unsigned long TEMPO_GIRO = 900;
constexpr unsigned long INTERVALO_BUSCA_8 = 2000;
constexpr unsigned long INTERVALO_BUSCA_9 = 2000;

constexpr long DISTANCIA_ATAQUE_CM = 40;
constexpr int DISTANCIA_LASER_CM = 25;

enum class Estrategia : uint8_t { Nenhuma, AvancoAgressivo, VarreduraHorario, VarreduraAntiHorario };
enum class FaseBorda : uint8_t { Normal, Recuando, Girando };

Estrategia estrategia = Estrategia::Nenhuma;
FaseBorda faseBorda = FaseBorda::Normal;
unsigned long inicioFaseBorda = 0;
unsigned long ultimaMudancaBusca = 0;
unsigned long ultimoLog = 0;
bool pausado = false;
int sentidoBusca = 1;

// Variáveis falsas (Mock) controladas pelo teclado no Monitor Serial
long mockUltrassonicoCm = 999;
int mockLaser1Cm = 999;
int mockLaser2Cm = 999;
bool mockBordaBranca = false;

// Estado atual dos motores para exibir no Log
int pwmAtualEsq = 0;
int pwmAtualDir = 0;
const char* acaoAtual = "PARADO";

unsigned long lerControleESimulacao()
{
    if (Serial.available() > 0)
    {
        char c = Serial.read();
        switch (c)
        {
        // Controles da partida
        case '1': return READY_CODE;
        case '2': return START_CODE;
        case '3': return STOP_CODE;
        case '7': return STRATEGY_7_CODE;
        case '8': return STRATEGY_8_CODE;
        case '9': return STRATEGY_9_CODE;

        // Injeção de Sensores Falsos para testar a lógica
        case 'w':
        case 'W':
            mockUltrassonicoCm = 15; // Inimigo na frente!
            mockLaser1Cm = 999;
            mockLaser2Cm = 999;
            Serial.println(F("\n>>> [EVENTO SIMULADO] Inimigo detectado NA FRENTE (15 cm)!"));
            break;
        case 'a':
        case 'A':
            mockUltrassonicoCm = 999;
            mockLaser1Cm = 12; // Inimigo na esquerda!
            mockLaser2Cm = 999;
            Serial.println(F("\n>>> [EVENTO SIMULADO] Inimigo detectado no LASER 1 - ESQUERDA (12 cm)!"));
            break;
        case 'd':
        case 'D':
            mockUltrassonicoCm = 999;
            mockLaser1Cm = 999;
            mockLaser2Cm = 12; // Inimigo na direita!
            Serial.println(F("\n>>> [EVENTO SIMULADO] Inimigo detectado no LASER 2 - DIREITA (12 cm)!"));
            break;
        case 's':
        case 'S':
            mockUltrassonicoCm = 999;
            mockLaser1Cm = 999;
            mockLaser2Cm = 999;
            Serial.println(F("\n>>> [EVENTO SIMULADO] Arena limpa! Voltando para modo de busca."));
            break;
        case 'b':
        case 'B':
            mockBordaBranca = true;
            Serial.println(F("\n>>> [EVENTO SIMULADO] ROBO PISOU NA BORDA BRANCA!"));
            break;
        }
    }

    if (IrReceiver.decode())
    {
        unsigned long codigo = IrReceiver.decodedIRData.decodedRawData;
        IrReceiver.resume();
        return codigo;
    }
    return 0;
}

void configurarMotor(uint8_t pinoFrente, uint8_t pinoRe, int potencia)
{
    potencia = constrain(potencia, -PWM_MAX, PWM_MAX);
    if (potencia > 0) { analogWrite(pinoRe, 0); analogWrite(pinoFrente, potencia); }
    else if (potencia < 0) { analogWrite(pinoFrente, 0); analogWrite(pinoRe, -potencia); }
    else { analogWrite(pinoFrente, 0); analogWrite(pinoRe, 0); }
}

void definirMotores(int potenciaEsquerda, int potenciaDireita, const char* descricaoAcao)
{
    pwmAtualEsq = potenciaEsquerda;
    pwmAtualDir = potenciaDireita;
    acaoAtual = descricaoAcao;
    configurarMotor(IN1_ESQ, IN2_ESQ, potenciaEsquerda);
    configurarMotor(IN4_DIR, IN3_DIR, potenciaDireita);
}

void parar() { definirMotores(0, 0, "PARADO"); }
void andarFrente(int p, const char* msg = "AVANCANDO FRENTE") { definirMotores(p, p, msg); }
void andarTras(int p) { definirMotores(-p, -p, "RECUANDO (BORDA)"); }
void girarHorario(int p, const char* msg = "GIRANDO HORARIO (DIR)") { definirMotores(p, -p, msg); }
void girarAntiHorario(int p, const char* msg = "GIRANDO ANTI-HORARIO (ESQ)") { definirMotores(-p, p, msg); }

bool bordaBrancaDetectada()
{
    if (mockBordaBranca)
    {
        mockBordaBranca = false; // Consome o pulso de borda simulada
        return true;
    }
    return false;
}

void selecionarEstrategia(unsigned long codigo)
{
    switch (codigo)
    {
    case STRATEGY_7_CODE:
        estrategia = Estrategia::AvancoAgressivo;
        sentidoBusca = 1;
        Serial.println(F("-> Estrategia 7 selecionada: Avanco Agressivo."));
        break;
    case STRATEGY_8_CODE:
        estrategia = Estrategia::VarreduraHorario;
        sentidoBusca = 1;
        Serial.println(F("-> Estrategia 8 selecionada: Varredura Horario primeiro."));
        break;
    case STRATEGY_9_CODE:
        estrategia = Estrategia::VarreduraAntiHorario;
        sentidoBusca = -1;
        Serial.println(F("-> Estrategia 9 selecionada: Varredura Anti-Horario primeiro."));
        break;
    }
    ultimaMudancaBusca = millis();
}

void aguardarInicio()
{
    Serial.println(F("\n================ SIMULADOR DE COMBATE NO UNO ================"));
    Serial.println(F("1) Envie '7', '8' ou '9' para escolher a estrategia."));
    Serial.println(F("2) Envie '2' para iniciar a luta."));
    Serial.println(F("Durante a luta, envie: [w]=Frente [a]=Esq [d]=Dir [s]=Limpo [b]=Borda [1]=Pausa"));
    Serial.println(F("============================================================="));

    while (true)
    {
        unsigned long codigo = lerControleESimulacao();
        if (codigo == STRATEGY_7_CODE || codigo == STRATEGY_8_CODE || codigo == STRATEGY_9_CODE)
        {
            selecionarEstrategia(codigo);
        }
        else if (codigo == START_CODE)
        {
            if (estrategia == Estrategia::Nenhuma)
                Serial.println(F("[!] Escolha primeiro a estrategia 7, 8 ou 9!"));
            else
            {
                Serial.println(F("\n>>> COMBATE INICIADO! <<<"));
                return;
            }
        }
    }
}

bool processarControles()
{
    unsigned long codigo = lerControleESimulacao();
    if (codigo == READY_CODE)
    {
        pausado = true;
        faseBorda = FaseBorda::Normal;
        parar();
        Serial.println(F("|| PAUSADO. Envie '2' para retomar."));
    }
    else if (codigo == START_CODE && pausado)
    {
        pausado = false;
        ultimaMudancaBusca = millis();
        Serial.println(F("|> RETOMANDO COMBATE!"));
    }
    if (pausado) parar();
    return pausado;
}

bool processarRecuperacaoBorda()
{
    unsigned long agora = millis();
    if (faseBorda == FaseBorda::Recuando)
    {
        if (agora - inicioFaseBorda >= TEMPO_RE)
        {
            girarHorario(PWM_GIRO, "GIRO POS-BORDA");
            faseBorda = FaseBorda::Girando;
            inicioFaseBorda = agora;
        }
        return true;
    }
    if (faseBorda == FaseBorda::Girando)
    {
        if (agora - inicioFaseBorda >= TEMPO_GIRO)
        {
            faseBorda = FaseBorda::Normal;
            parar();
        }
        return true;
    }
    if (bordaBrancaDetectada())
    {
        andarTras(PWM_RE);
        faseBorda = FaseBorda::Recuando;
        inicioFaseBorda = agora;
        return true;
    }
    return false;
}

void executarBusca()
{
    if (estrategia == Estrategia::AvancoAgressivo)
    {
        andarFrente(PWM_AVANCO_AGRESSIVO, "BUSCA: AVANCO AGRESSIVO");
        return;
    }
    unsigned long intervalo = (estrategia == Estrategia::VarreduraHorario) ? INTERVALO_BUSCA_8 : INTERVALO_BUSCA_9;
    if (millis() - ultimaMudancaBusca >= intervalo)
    {
        sentidoBusca = -sentidoBusca;
        ultimaMudancaBusca = millis();
    }
    if (sentidoBusca > 0) girarHorario(PWM_BUSCA, "BUSCA: VARREDURA DIR");
    else girarAntiHorario(PWM_BUSCA, "BUSCA: VARREDURA ESQ");
}

void imprimirTelemetria()
{
    if (millis() - ultimoLog >= 300) // Imprime a cada 300ms para não travar a tela
    {
        ultimoLog = millis();
        Serial.print(F("[LOG] Acao: "));
        Serial.print(acaoAtual);
        Serial.print(F(" | Motores(Esq/Dir): "));
        Serial.print(pwmAtualEsq);
        Serial.print(F(" / "));
        Serial.print(pwmAtualDir);
        Serial.print(F(" | Sensores(F/E/D): "));
        Serial.print(mockUltrassonicoCm);
        Serial.print(F("cm / "));
        Serial.print(mockLaser1Cm);
        Serial.print(F("cm / "));
        Serial.print(mockLaser2Cm);
        Serial.println(F("cm"));
    }
}

void setup()
{
    Serial.begin(9600);
    IrReceiver.begin(IR_RECEIVE_PIN);
    pinMode(IN1_ESQ, OUTPUT);
    pinMode(IN2_ESQ, OUTPUT);
    pinMode(IN3_DIR, OUTPUT);
    pinMode(IN4_DIR, OUTPUT);
    parar();
    aguardarInicio();
}

void loop()
{
    if (processarControles()) return;

    if (!processarRecuperacaoBorda())
    {
        bool alvoSensor1 = mockLaser1Cm > 0 && mockLaser1Cm < DISTANCIA_LASER_CM;
        bool alvoSensor2 = mockLaser2Cm > 0 && mockLaser2Cm < DISTANCIA_LASER_CM;

        if ((mockUltrassonicoCm > 0 && mockUltrassonicoCm < DISTANCIA_ATAQUE_CM) || (alvoSensor1 && alvoSensor2))
        {
            andarFrente(PWM_MAX, "ATAQUE TOTAL (PWM 255)!");
        }
        else if (alvoSensor1)
        {
            girarAntiHorario(PWM_GIRO, "VIROU P/ ALVO ESQUERDA");
        }
        else if (alvoSensor2)
        {
            girarHorario(PWM_GIRO, "VIROU P/ ALVO DIREITA");
        }
        else
        {
            executarBusca();
        }
    }

    imprimirTelemetria();
}