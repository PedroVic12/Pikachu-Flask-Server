#if defined(ARDUINO) && __has_include(<Arduino.h>)
#define ROBOT_HAS_ARDUINO 1
#include <Arduino.h>
#else
#define ROBOT_HAS_ARDUINO 0
#include <iostream>
#include <unordered_map>
#endif

// Logica compartilhada: as funcoes recebem valores e retornam novos resultados.
enum class Strategy { None, Aggressive, Clockwise, Counterclockwise };
enum class Recovery { Normal, Reversing, Turning };
enum class Action { Stop, Forward, Reverse, TurnLeft, TurnRight, ScanClockwise, ScanCounterclockwise };
enum class Event { None, EnemyFront, EnemyLeft, EnemyRight, Clear, Edge, Tick, Select7, Select8, Select9 };

struct Sensors {
    bool enemyFront;
    bool enemyLeft;
    bool enemyRight;
    bool whiteEdge;

    Sensors(bool front = false, bool left = false, bool right = false, bool edge = false)
        : enemyFront(front), enemyLeft(left), enemyRight(right), whiteEdge(edge) {}
};

struct State {
    Sensors sensors;
    Strategy strategy;
    Recovery recovery;

    State() : sensors(), strategy(Strategy::None), recovery(Recovery::Normal) {}
};

struct LedState {
    bool front;
    bool left;
    bool right;
    bool back;

    LedState(bool f = false, bool l = false, bool r = false, bool b = false)
        : front(f), left(l), right(r), back(b) {}
};

struct ActionInfo {
    const char* description;
    LedState leds;

    ActionInfo(const char* text = "", LedState state = LedState())
        : description(text), leds(state) {}
};

// Atualiza os sensores sem alterar o estado recebido.
State updateSensors(const State& current, const Sensors& sensors) {
    State next = current;
    next.sensors = sensors;
    return next;
}

State transition(const State& current, Event event) {
    State next = current;
    switch (event) {
        case Event::EnemyFront:
            next.sensors = {true, false, false, false};
            break;
        case Event::EnemyLeft:
            next.sensors = {false, true, false, false};
            break;
        case Event::EnemyRight:
            next.sensors = {false, false, true, false};
            break;
        case Event::Clear:
            next.sensors = {};
            break;
        case Event::Edge:
            next.sensors.whiteEdge = true;
            next.recovery = Recovery::Reversing;
            break;
        case Event::Tick:
            if (next.recovery == Recovery::Reversing) next.recovery = Recovery::Turning;
            else if (next.recovery == Recovery::Turning) {
                next.recovery = Recovery::Normal;
                next.sensors.whiteEdge = false;
            }
            break;
        case Event::Select7: next.strategy = Strategy::Aggressive; break;
        case Event::Select8: next.strategy = Strategy::Clockwise; break;
        case Event::Select9: next.strategy = Strategy::Counterclockwise; break;
        case Event::None: break;
    }
    return next;
}

Action decide(const State& state) {
    if (state.recovery == Recovery::Reversing) return Action::Reverse;
    if (state.recovery == Recovery::Turning) return Action::TurnRight;

    const Sensors& sensors = state.sensors;
    if (sensors.whiteEdge) return Action::Reverse;
    if (sensors.enemyFront || (sensors.enemyLeft && sensors.enemyRight)) return Action::Forward;
    if (sensors.enemyLeft) return Action::TurnLeft;
    if (sensors.enemyRight) return Action::TurnRight;

    switch (state.strategy) {
        case Strategy::Aggressive: return Action::Forward;
        case Strategy::Clockwise: return Action::ScanClockwise;
        case Strategy::Counterclockwise: return Action::ScanCounterclockwise;
        case Strategy::None: return Action::Stop;
    }
    return Action::Stop;
}

const char* strategyName(Strategy strategy) {
    switch (strategy) {
        case Strategy::Aggressive: return "7 - avanco agressivo";
        case Strategy::Clockwise: return "8 - busca horaria";
        case Strategy::Counterclockwise: return "9 - busca anti-horaria";
        case Strategy::None: return "nenhuma";
    }
    return "desconhecida";
}

#if ROBOT_HAS_ARDUINO

// Ajuste os pinos para a montagem. Sensores configurados como ativos em LOW.
const uint8_t PIN_SENSOR_FRONT = 2;
const uint8_t PIN_SENSOR_LEFT  = 3;
const uint8_t PIN_SENSOR_RIGHT = 4;
const uint8_t PIN_SENSOR_EDGE  = 5;
const uint8_t PIN_LED_FRONT = 8;
const uint8_t PIN_LED_LEFT  = 9;
const uint8_t PIN_LED_RIGHT = 10;
const uint8_t PIN_LED_BACK  = 11;
const uint8_t SENSOR_ACTIVE_LEVEL = LOW; // Troque para HIGH se seu modulo ativar em HIGH.

const unsigned long REVERSE_TIME_MS = 450;
const unsigned long TURN_TIME_MS = 350;

State state;
bool previousEdge = false;
unsigned long recoveryStartedAt = 0;
Action previousAction = Action::Stop;
bool hasPrintedAction = false;

ActionInfo actionInfo(Action action) {
    switch (action) {
        case Action::Forward: return {"FRENTE / ATAQUE", {true, false, false, false}};
        case Action::Reverse: return {"RE / BORDA", {false, false, false, true}};
        case Action::TurnLeft: return {"GIRO ESQUERDA", {false, true, false, false}};
        case Action::TurnRight: return {"GIRO DIREITA", {false, false, true, false}};
        case Action::ScanClockwise: return {"BUSCA HORARIA", {false, false, true, false}};
        case Action::ScanCounterclockwise: return {"BUSCA ANTI-HORARIA", {false, true, false, false}};
        case Action::Stop: return {"PARADO", {false, false, false, false}};
    }
    return {"PARADO", {false, false, false, false}};
}

void writeLeds(const LedState& leds) {
    digitalWrite(PIN_LED_FRONT, leds.front ? HIGH : LOW);
    digitalWrite(PIN_LED_LEFT,  leds.left  ? HIGH : LOW);
    digitalWrite(PIN_LED_RIGHT, leds.right ? HIGH : LOW);
    digitalWrite(PIN_LED_BACK,  leds.back  ? HIGH : LOW);
}

void setup() {
    pinMode(PIN_SENSOR_FRONT, INPUT_PULLUP);
    pinMode(PIN_SENSOR_LEFT, INPUT_PULLUP);
    pinMode(PIN_SENSOR_RIGHT, INPUT_PULLUP);
    pinMode(PIN_SENSOR_EDGE, INPUT_PULLUP);
    pinMode(PIN_LED_FRONT, OUTPUT);
    pinMode(PIN_LED_LEFT, OUTPUT);
    pinMode(PIN_LED_RIGHT, OUTPUT);
    pinMode(PIN_LED_BACK, OUTPUT);

    writeLeds({false, false, false, false});
    Serial.begin(9600);
    Serial.println(F("Simulador pronto. Envie 7, 8 ou 9 para escolher a estrategia."));
}

void loop() {
    while (Serial.available() > 0) {
        const char input = static_cast<char>(Serial.read());
        if (input == '7') state = transition(state, Event::Select7);
        else if (input == '8') state = transition(state, Event::Select8);
        else if (input == '9') state = transition(state, Event::Select9);
    }

    Sensors sensed;
    sensed.enemyFront = digitalRead(PIN_SENSOR_FRONT) == SENSOR_ACTIVE_LEVEL;
    sensed.enemyLeft = digitalRead(PIN_SENSOR_LEFT) == SENSOR_ACTIVE_LEVEL;
    sensed.enemyRight = digitalRead(PIN_SENSOR_RIGHT) == SENSOR_ACTIVE_LEVEL;
    sensed.whiteEdge = digitalRead(PIN_SENSOR_EDGE) == SENSOR_ACTIVE_LEVEL;
    state = updateSensors(state, sensed);

    const unsigned long now = millis();
    if (sensed.whiteEdge && !previousEdge) {
        state = transition(state, Event::Edge);
        recoveryStartedAt = now;
    }
    previousEdge = sensed.whiteEdge;

    if (state.recovery == Recovery::Reversing && now - recoveryStartedAt >= REVERSE_TIME_MS) {
        state = transition(state, Event::Tick);
        recoveryStartedAt = now;
    } else if (state.recovery == Recovery::Turning && now - recoveryStartedAt >= TURN_TIME_MS) {
        state = transition(state, Event::Tick);
    }

    const Action action = decide(state);
    const ActionInfo info = actionInfo(action);
    writeLeds(info.leds);

    if (!hasPrintedAction || action != previousAction) {
        Serial.print(F("Estrategia: "));
        Serial.print(strategyName(state.strategy));
        Serial.print(F(" | Acao: "));
        Serial.println(info.description);
        previousAction = action;
        hasPrintedAction = true;
    }
}

#else

// Simulador colorido de terminal para testar a mesma logica sem Arduino.
const std::unordered_map<Action, ActionInfo> ACTIONS = {
    {Action::Stop, {"PARADO", {false, false, false, false}}},
    {Action::Forward, {"FRENTE / ATAQUE", {true, false, false, false}}},
    {Action::Reverse, {"RE / RECUPERACAO DA BORDA", {false, false, false, true}}},
    {Action::TurnLeft, {"GIRO A ESQUERDA", {false, true, false, false}}},
    {Action::TurnRight, {"GIRO A DIREITA", {false, false, true, false}}},
    {Action::ScanClockwise, {"BUSCA / GIRO A DIREITA", {false, false, true, false}}},
    {Action::ScanCounterclockwise, {"BUSCA / GIRO A ESQUERDA", {false, true, false, false}}}
};

const std::unordered_map<char, Event> INPUTS = {
    {'w', Event::EnemyFront}, {'W', Event::EnemyFront},
    {'a', Event::EnemyLeft}, {'A', Event::EnemyLeft},
    {'d', Event::EnemyRight}, {'D', Event::EnemyRight},
    {'s', Event::Clear}, {'S', Event::Clear},
    {'b', Event::Edge}, {'B', Event::Edge},
    {'.', Event::Tick},
    {'7', Event::Select7}, {'8', Event::Select8}, {'9', Event::Select9}
};

const char* signalStatus(bool active) {
    return active ? "\033[1;32mDETECTADO\033[0m" : "\033[90mLIVRE\033[0m";
}

void printLed(const char* label, bool on, const char* color) {
    std::cout << "  " << label << "  "
              << (on ? color : "\033[90m")
              << (on ? "[  ON  ]" : "[ OFF  ]")
              << "\033[0m\n";
}

void printOutput(const State& current) {
    const ActionInfo& info = ACTIONS.at(decide(current));
    const char* actionColor = decide(current) == Action::Stop
        ? "\033[90m" : "\033[1;36m";

    std::cout << "\033[2J\033[H"
              << "\033[1;36m+--------------------------------------------------+\033[0m\n"
              << "\033[1;36m|          ROBO SUMO - PAINEL DE SIMULACAO         |\033[0m\n"
              << "\033[1;36m+--------------------------------------------------+\033[0m\n\n"
              << "ESTRATEGIA: \033[1;33m" << strategyName(current.strategy)
              << "\033[0m\n"
              << "ACAO AUTONOMA: " << actionColor << info.description << "\033[0m\n\n"
              << "SENSORES DO OPONENTE\n"
              << "  Frente:   " << signalStatus(current.sensors.enemyFront) << "\n"
              << "  Esquerda: " << signalStatus(current.sensors.enemyLeft) << "\n"
              << "  Direita:  " << signalStatus(current.sensors.enemyRight) << "\n"
              << "  Borda:    " << signalStatus(current.sensors.whiteEdge) << "\n\n"
              << "LEDS VIRTUAIS\n";

    printLed("FRENTE", info.leds.front, "\033[1;32m");
    printLed("ESQUERDA", info.leds.left, "\033[1;34m");
    printLed("DIREITA", info.leds.right, "\033[1;35m");
    printLed("ATRAS", info.leds.back, "\033[1;33m");

    std::cout << "\n\033[90mCONTROLES\033[0m\n"
              << "  w: oponente na frente | a: esquerda | d: direita\n"
              << "  s: limpar sensores | b: detectar borda | .: avancar recuperacao\n"
              << "  7: agressivo | 8: busca horaria | 9: busca anti-horaria | q: sair\n"
              << "Digite sequencias de teclas pela entrada do programa.\n";
}

int main() {
    State state;
    printOutput(state);

    char input;
    while (std::cin >> input && input != 'q' && input != 'Q') {
        const auto found = INPUTS.find(input);
        if (found == INPUTS.end()) {
            std::cout << "Comando desconhecido.\n";
            continue;
        }
        state = transition(state, found->second);
        printOutput(state);
    }
    return 0;
}

#endif
