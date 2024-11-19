import React from "react";

function ClientForm({
  name,
  setName,
  petName,
  setPetName,
  selectedDoctor,
  setSelectedDoctor,
  doctors,
}) {
  return (
    <div className="space-y-4">
      <input
        name="clientName"
        type="text"
        placeholder="Seu nome"
        className="w-full p-2 border rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        name="petName"
        type="text"
        placeholder="Nome do pet"
        className="w-full p-2 border rounded"
        value={petName}
        onChange={(e) => setPetName(e.target.value)}
        required
      />
      <select
        name="doctor"
        className="w-full p-2 border rounded"
        value={selectedDoctor}
        onChange={(e) => setSelectedDoctor(e.target.value)}
        required
      >
        <option value="">Selecione o médico</option>
        {doctors.map((doctor) => (
          <option key={doctor} value={doctor}>
            {doctor}
          </option>
        ))}
      </select>
    </div>
  );
}

function DatePicker({ selectedDate, setSelectedDate, getDates, formatDate }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {getDates().map((date, index) => {
        const formattedDate = formatDate(date);
        return (
          <button
            key={index}
            onClick={() => setSelectedDate(date.toISOString().split("T")[0])}
            className={`flex flex-col items-center min-w-[60px] p-2 rounded ${
              selectedDate === date.toISOString().split("T")[0]
                ? "bg-blue-500 text-white"
                : "bg-[#2a2a2a] text-gray-300"
            }`}
          >
            <span className="text-sm">{formattedDate.weekday}</span>
            <span className="text-lg">{formattedDate.day}</span>
          </button>
        );
      })}
    </div>
  );
}

function TimePicker({ selectedTime, setSelectedTime, times }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-2">
      {times.map((time) => (
        <button
          key={time}
          onClick={() => setSelectedTime(time)}
          className={`p-2 rounded ${
            selectedTime === time
              ? "bg-blue-500 text-white"
              : "bg-[#2a2a2a] text-gray-300"
          }`}
        >
          {time}
        </button>
      ))}
    </div>
  );
}

function ConfirmationModal({
  name,
  petName,
  selectedDoctor,
  selectedDate,
  selectedTime,
  generatePDF,
  onClose,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Confirmar Agendamento</h2>
        <p>Cliente: {name}</p>
        <p>Pet: {petName}</p>
        <p>Médico: {selectedDoctor}</p>
        <p>Data: {selectedDate}</p>
        <p>Horário: {selectedTime}</p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={generatePDF}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Gerar PDF
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

function MainComponent() {
  const [name, setName] = useState("");
  const [petName, setPetName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const doctors = ["Dr. Maria Silva", "Dr. João Santos", "Dr. Ana Oliveira"];
  const times = [
    "2:00 PM",
    "2:30 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
    "6:00 PM",
    "6:30 PM",
    "7:00 PM",
    "7:30 PM",
  ];
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };
  const generatePDF = () => {
    const content = `
      Agendamento Veterinário
      
      Cliente: ${name}
      Pet: ${petName}
      Médico: ${selectedDoctor}
      Data: ${selectedDate}
      Horário: ${selectedTime}
      Descrição: ${description}
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `agendamento-${petName}.pdf`;
    link.click();
  };

  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };
  const formatDate = (date) => {
    const days = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."];
    return {
      day: date.getDate(),
      weekday: days[date.getDay()],
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Agendamento Veterinário
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <ClientForm
            name={name}
            setName={setName}
            petName={petName}
            setPetName={setPetName}
            selectedDoctor={selectedDoctor}
            setSelectedDoctor={setSelectedDoctor}
            doctors={doctors}
          />

          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <h2 className="text-white mb-4">Escolha um horário</h2>
            <DatePicker
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              getDates={getDates}
              formatDate={formatDate}
            />
            <TimePicker
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              times={times}
            />
            <div className="mt-4 flex items-center gap-2 text-gray-400">
              <i className="fas fa-clock"></i>
              <span>30 min de duração</span>
            </div>
          </div>

          <textarea
            name="description"
            placeholder="Descreva os sintomas do pet"
            className="w-full p-2 border rounded h-32"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Agendar Consulta
          </button>
        </form>

        {showConfirmation && (
          <ConfirmationModal
            name={name}
            petName={petName}
            selectedDoctor={selectedDoctor}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            generatePDF={generatePDF}
            onClose={() => setShowConfirmation(false)}
          />
        )}
      </div>
    </div>
  );
}

export default MainComponent;