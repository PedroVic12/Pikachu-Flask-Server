// ===================================================================================
// PROJETO: ROBÔ LUTADOR DE SUMÔ - ARDUINO NANO & PONTE H L298N
// UFF - LABORATÓRIO DE ENG. ELÉTRICA (PROF. FELIPE SASS - GRUPO 1 2026)
// PARADIGMA: PROGRAMAÇÃO ORIENTADA A OBJETOS (CLASSES & STRUCTS C++)
// ===================================================================================

#include <IRremote.hpp>
#include "headers.h"
#include "Logger.h"

Logger logger(true, LOG_INFO);

// ===================================================================================
// 1. CLASSE BASE ABSTRATA PARA SENSORES (Sensor)
// ===================================================================================

class Sensor
{
public:
    virtual void iniciar() = 0;
    virtual void atualizar() = 0;
    virtual ~Sensor() {}
};

// Subclasse: Sensor QRE1113 de Refletância
class SensorRefletancia : public Sensor
{
public:
    int pino;
    int limiar;
    EstadoSensor estado;

    SensorRefletancia(int pinoSensor, int limiarBranco = LIMIAR_BORDA_QRE)
        : pino(pinoSensor), limiar(limiarBranco)
    {
        estado.valorQRE = 0;
        estado.naBordaBranca = false;
    }

    void iniciar() override
    {
        pinMode(pino, INPUT);
    }

    void atualizar() override
    {
        estado.valorQRE = analogRead(pino);
        estado.naBordaBranca = (estado.valorQRE < limiar);
    }

    int getValorAD() const { return estado.valorQRE; }
    bool isBordaBranca() const { return estado.naBordaBranca; }
};

// Subclasse: Sensor HC-SR04 Ultrassônico
class SensorUltrassonico : public Sensor
{
public:
    int pinoTrig;
    int pinoEcho;
    float distanciaCm;

    SensorUltrassonico(int trigPin, int echoPin)
        : pinoTrig(trigPin), pinoEcho(echoPin), distanciaCm(999.0) {}

    void iniciar() override
    {
        pinMode(pinoTrig, OUTPUT);
        pinMode(pinoEcho, INPUT);
        digitalWrite(pinoTrig, LOW);
    }

    void atualizar() override
    {
        digitalWrite(pinoTrig, LOW);
        delayMicroseconds(2);
        digitalWrite(pinoTrig, HIGH);
        delayMicroseconds(10);
        digitalWrite(pinoTrig, LOW);

        long duracao = pulseIn(pinoEcho, HIGH, 25000); // 25ms timeout
        if (duracao == 0)
        {
            distanciaCm = 999.0;
        }
        else
        {
            distanciaCm = (duracao * 0.0343) / 2.0;
        }
    }

    float getDistancia() const { return distanciaCm; }
};

// ===================================================================================
// 2. CLASSE PÚBLICA CARRO
// ===================================================================================

class Carro
{
public:
    PinosMotor pinos;
    ConfigPWM configPwm;
    SensorRefletancia sensorLinha;
    SensorUltrassonico sensorUltrassonico;

    Carro(int pinoLinha, int trigPin, int echoPin, PinosMotor pinosM, ConfigPWM pwm)
        : pinos(pinosM), configPwm(pwm),
          sensorLinha(pinoLinha), sensorUltrassonico(trigPin, echoPin) {}

    virtual void iniciar()
    {
        pinMode(pinos.in1, OUTPUT);
        pinMode(pinos.in2, OUTPUT);
        pinMode(pinos.in3, OUTPUT);
        pinMode(pinos.in4, OUTPUT);

        sensorLinha.iniciar();
        sensorUltrassonico.iniciar();
        parar();
    }

    virtual void atualizarSensores()
    {
        sensorLinha.atualizar();
        sensorUltrassonico.atualizar();
    }

    void moverFrente(int velocidade = -1)
    {
        int vel = (velocidade < 0) ? configPwm.maxPotencia : velocidade;
        analogWrite(pinos.in1, vel);
        digitalWrite(pinos.in2, LOW);
        analogWrite(pinos.in3, vel);
        digitalWrite(pinos.in4, LOW);
    }

    void moverRe(int velocidade = -1)
    {
        int vel = (velocidade < 0) ? configPwm.re : velocidade;
        digitalWrite(pinos.in1, LOW);
        analogWrite(pinos.in2, vel);
        digitalWrite(pinos.in3, LOW);
        analogWrite(pinos.in4, vel);
    }

    void girarEsquerda(int velocidade = -1)
    {
        int vel = (velocidade < 0) ? configPwm.giro : velocidade;
        digitalWrite(pinos.in1, LOW);
        analogWrite(pinos.in2, vel);
        analogWrite(pinos.in3, vel);
        digitalWrite(pinos.in4, LOW);
    }

    void girarDireita(int velocidade = -1)
    {
        int vel = (velocidade < 0) ? configPwm.giro : velocidade;
        analogWrite(pinos.in1, vel);
        digitalWrite(pinos.in2, LOW);
        digitalWrite(pinos.in3, LOW);
        analogWrite(pinos.in4, vel);
    }

    void parar()
    {
        digitalWrite(pinos.in1, LOW);
        digitalWrite(pinos.in2, LOW);
        digitalWrite(pinos.in3, LOW);
        digitalWrite(pinos.in4, LOW);
    }

    bool detectouBorda() const { return sensorLinha.isBordaBranca(); }
    float getDistanciaOponente() const { return sensorUltrassonico.getDistancia(); }
};

// ===================================================================================
// 3. CLASSE FINAL ROBO LUTADOR (UTILIZANDO robotState)
// ===================================================================================

class RoboLutador : public Carro
{
public:
    robotState estadoAtual;

    RoboLutador(int pinoLinha, int trigPin, int echoPin, PinosMotor pinosM, ConfigPWM pwm)
        : Carro(pinoLinha, trigPin, echoPin, pinosM, pwm), estadoAtual(ESTADO_PARADO) {}

    void iniciar() override
    {
        Carro::iniciar();
        IrReceiver.begin(IR_RECEIVE_PIN);
        estadoAtual = ESTADO_PARADO;
        logger.info(F("🤖 RoboLutador Inicializado! Aguardando Controle Sony..."));
    }

    void processarComandoIR()
    {
        if (IrReceiver.decode())
        {
            uint32_t codigo = IrReceiver.decodedIRData.decodedRawData;
            IrReceiver.resume();

            logger.debug(F("Sinal IR Recebido: 0x") + String(codigo, HEX));

            switch (codigo)
            {
            case BUTTON_1_CODE:
                logger.info(F("[BOTÃO 1] PREPARAR"));
                estadoAtual = ESTADO_PREPARAR;
                break;

            case BUTTON_2_CODE:
                logger.info(F("[BOTÃO 2] BUSCAR OPONENTE (START)"));
                estadoAtual = ESTADO_BUSCAR;
                break;

            case BUTTON_3_CODE:
                logger.warn(F("[BOTÃO 3] PARAR DEFINITIVO (FIM)"));
                estadoAtual = ESTADO_PARADO_DEFINITIVO;
                parar();
                break;

            case BUTTON_4_CODE:
                logger.error(F("[BOTÃO 4] PARADA DE EMERGÊNCIA"));
                estadoAtual = ESTADO_PARADO;
                parar();
                break;
            }
        }
    }

    virtual void executar()
    {
        atualizarSensores();
        processarComandoIR();

        // Segurança de Borda
        if (detectouBorda() && estadoAtual != ESTADO_PARADO && estadoAtual != ESTADO_PARADO_DEFINITIVO)
        {
            logger.warn(F("🚨 Borda Branca Detectada! Recuando..."));
            estadoAtual = ESTADO_ESQUIVAR_BORDA;
        }

        // FSM usando robotState
        switch (estadoAtual)
        {
        case ESTADO_PARADO:
            parar();
            break;

        case ESTADO_PREPARAR:
            moverFrente(150);
            break;

        case ESTADO_BUSCAR:
        {
            float D = getDistanciaOponente();
            if (D < DISTANCIA_ATENCAO_CM)
            {
                logger.info(F("🎯 Oponente < 20cm! Engajando ataque..."));
                estadoAtual = ESTADO_ATACAR;
            }
            else
            {
                moverRe(configPwm.re); // Ré de busca conforme o fluxograma
            }
            break;
        }

        case ESTADO_ATACAR:
            if (getDistanciaOponente() < 50.0)
            {
                moverFrente(configPwm.maxPotencia);
            }
            else
            {
                estadoAtual = ESTADO_BUSCAR;
            }
            break;

        case ESTADO_ESQUIVAR_BORDA:
            moverRe(configPwm.re);
            delay(400);
            girarDireita(configPwm.giro);
            delay(650);
            estadoAtual = ESTADO_BUSCAR;
            break;

        case ESTADO_PARADO_DEFINITIVO:
            parar(); // Solução do Fluxograma: Trava no estado FIM sem reiniciar o loop
            break;
        }
    }
};

// ===================================================================================
// 4. INSTANCIAÇÃO DOS OBJETOS E ARDUINO LOOP
// ===================================================================================

PinosMotor pinosMotores = {IN1_MOTOR_ESQUERDO, IN2_MOTOR_ESQUERDO, IN3_MOTOR_DIREITO, IN4_MOTOR_DIREITO};
ConfigPWM configuracaoPwm = {255, 200, 190};

RoboLutador robo(PIN_SENSOR_QRE_LINHA, PIN_ULTRASSONICO_TRIG, PIN_ULTRASSONICO_ECHO, pinosMotores, configuracaoPwm);

void setup()
{
    logger.iniciar(9600);
    robo.iniciar();
}

void loop()
{
    robo.executar();
}