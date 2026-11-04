#include <Arduino.h>
#include <IRremote.hpp>
#include <Wire.h>
#include <VL53L0X.h>

constexpr uint8_t IR_RECEIVE_PIN = 11;
constexpr uint8_t SENSOR_LINHA = A0;
constexpr uint8_t TRIG = A2;
constexpr uint8_t ECHO = A3;

constexpr uint8_t XSHUT_SENSOR1 = 7;
constexpr uint8_t XSHUT_SENSOR2 = 8;
constexpr uint8_t SENSOR1_ENDERECO = 42;
constexpr uint8_t SENSOR2_ENDERECO = 43;

constexpr unsigned long READY_CODE = 0x80; // Botao 1: pausa
constexpr unsigned long START_CODE = 0x81; // Botao 2: iniciar/retomar
constexpr unsigned long STOP_CODE = 0x82;  // Botao 3: parada definitiva

constexpr unsigned long STRATEGY_7_CODE = 0x86; // pwm agressivo
constexpr unsigned long STRATEGY_8_CODE = 0x88; // busca sentido esquerda
constexpr unsigned long STRATEGY_9_CODE = 0x87; // busca sentido direita

constexpr uint8_t IN1_ESQ = 10;
constexpr uint8_t IN2_ESQ = 9;
constexpr uint8_t IN3_DIR = 6;
constexpr uint8_t IN4_DIR = 5;

constexpr int PWM_MAX = 255;
constexpr int PWM_RE = 220;
constexpr int PWM_GIRO = 180;
constexpr int PWM_BUSCA = 140;
constexpr int PWM_AVANCO_AGRESSIVO = 255;

constexpr unsigned long TEMPO_RE = 400;
constexpr unsigned long TEMPO_GIRO = 900;
constexpr unsigned long INTERVALO_BUSCA_8 = 2000;
constexpr unsigned long INTERVALO_BUSCA_9 = 2000;

constexpr int LIMIAR_LINHA = 700;
constexpr bool BRANCO_E_MAIOR = false;

constexpr long DISTANCIA_ATAQUE_CM = 40;
constexpr int DISTANCIA_LASER_CM = 25;

VL53L0X Sensor1;
VL53L0X Sensor2;

enum class Estrategia : uint8_t
{
    Nenhuma,
    AvancoAgressivo,
    VarreduraHorario,
    VarreduraAntiHorario
};

enum class FaseBorda : uint8_t
{
    Normal,
    Recuando,
    Girando
};

Estrategia estrategia = Estrategia::Nenhuma;
FaseBorda faseBorda = FaseBorda::Normal;
unsigned long inicioFaseBorda = 0;
unsigned long ultimaMudancaBusca = 0;
bool pausado = false;
int sentidoBusca = 1;
