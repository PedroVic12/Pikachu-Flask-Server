"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

/**
 * --- BIBLIOTECAS EXTERNAS ---
 * Carregamos o XLSX para suporte a planilhas
 */
const loadXLSX = () => {
  if (typeof window !== "undefined" && !window.XLSX) {
    const script = document.createElement("script");
    script.src =
      "https://cdn.sheetjs.com/xlsx-0.19.3/package/dist/xlsx.full.min.js";
    document.head.appendChild(script);
  }
};

/**
 * --- UTILS ---
 */
class Utils {
  static dateToLocalISO(d) {
    if (!d) return "";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "";
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().split("T")[0];
  }
  static daysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }
  static getTodayString() {
    return new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
}

/**
 * --- BACKEND CONTROLLER ---
 */
class ProjectHubBackend {
  constructor(storageKey = "project_hub_v7") {
    this.storageKey = storageKey;
  }

  loadData() {
    if (typeof window === "undefined") return this.getInitialState();
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
      }
    }
    return this.getInitialState();
  }

  saveData(data) {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
  }

  getInitialState() {
    return {
      simpleTasks: [
        {
          id: 1,
          title: "Tarefa Exemplo",
          category: "Geral",
          assignee: "Admin",
          done: false,
          date: Utils.dateToLocalISO(new Date()),
          obs: "",
        },
      ],
      planner: {
        backlog: [],
        mon: [],
        tue: [],
        wed: [],
        thu: [],
        fri: [],
        sat: [],
        sun: [],
      },
      eisenhower: {
        urgentImportant: [],
        notUrgentImportant: [],
        urgentNotImportant: [],
        notUrgentNotImportant: [],
      },
      prosCons: { pros: [], cons: [] },
    };
  }

  exportToExcel(tasks) {
    if (!window.XLSX) return;
    const ws = window.XLSX.utils.json_to_sheet(
      tasks.map((t) => ({
        Tarefa: t.title,
        Categoria: t.category,
        Responsável: t.assignee,
        Concluído: t.done ? "Sim" : "Não",
        Data: t.date,
        Obs: t.obs,
      })),
    );
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Tarefas");
    window.XLSX.writeFile(wb, "Projeto_Tarefas.xlsx");
  }
}

/**
 * --- ICONES ---
 */
const Icons = {
  Table: (p) => (
    <svg
      {...p}
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
    </svg>
  ),
  Columns: (p) => (
    <svg
      {...p}
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" />
    </svg>
  ),
  Grid: (p) => (
    <svg
      {...p}
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  ThumbsUp: (p) => (
    <svg
      {...p}
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  ),
  Trash2: (p) => (
    <svg
      {...p}
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Plus: (p) => (
    <svg
      {...p}
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  ChevronLeft: (p) => (
    <svg
      {...p}
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronRight: (p) => (
    <svg
      {...p}
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  CheckCircle: (p) => (
    <svg
      {...p}
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  Clock: (p) => (
    <svg
      {...p}
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Upload: (p) => (
    <svg
      {...p}
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Download: (p) => (
    <svg
      {...p}
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Info: (p) => (
    <svg
      {...p}
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

/**
 * --- COMPONENTES DE INTERFACE ---
 */

const ResizableHeader = ({ children, width, onResize }) => {
  const [resizing, setResizing] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const handleMouseDown = (e) => {
    setResizing(true);
    startX.current = e.clientX;
    startWidth.current = width;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  const handleMouseMove = (e) => {
    const newWidth = startWidth.current + (e.clientX - startX.current);
    onResize(Math.max(50, newWidth));
  };
  const handleMouseUp = () => {
    setResizing(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };
  return (
    <th
      className="p-3 border-b text-left relative group select-none bg-slate-50"
      style={{ width }}
    >
      {children}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 ${resizing ? "bg-blue-500" : "bg-transparent"}`}
      />
    </th>
  );
};

// --- EISENHOWER VIEW ---
const EisenhowerView = ({ eisenData, setEisenData }) => {
  const addItem = (list, text) => {
    if (text.trim()) {
      setEisenData((prev) => ({
        ...prev,
        [list]: [...prev[list], { id: Date.now(), text }],
      }));
    }
  };

  const removeItem = (list, id) => {
    setEisenData((prev) => ({
      ...prev,
      [list]: prev[list].filter((i) => i.id !== id),
    }));
  };

  const Quadrant = ({ title, listKey, bg, border, color, iconColor }) => {
    const [input, setInput] = useState("");
    return (
      <div
        className={`p-6 rounded-3xl border-2 flex flex-col ${bg} ${border} h-full shadow-lg transition-all hover:shadow-xl`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`font-black uppercase text-xs tracking-widest ${color}`}
          >
            {title}
          </h3>
          <div className={`w-2 h-2 rounded-full ${iconColor}`}></div>
        </div>
        <div
          className="flex-grow space-y-3 overflow-y-auto custom-scrollbar pr-2"
          style={{ minHeight: "150px" }}
        >
          {eisenData[listKey]?.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-2xl shadow-sm text-sm text-slate-700 flex justify-between items-center group animate-in slide-in-from-bottom duration-300 border border-slate-50"
            >
              <span className="font-semibold leading-tight">{item.text}</span>
              <button
                onClick={() => removeItem(listKey, item.id)}
                className="text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
              >
                <Icons.Trash2 width="14" />
              </button>
            </div>
          ))}
          {(!eisenData[listKey] || eisenData[listKey].length === 0) && (
            <div className="flex flex-col items-center justify-center h-full opacity-20 py-10">
              <Icons.Plus width="20" />
            </div>
          )}
        </div>
        <div className="relative mt-4">
          <input
            className="w-full text-xs font-bold p-4 pr-12 rounded-2xl border-0 shadow-inner bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none text-slate-800 transition-all placeholder:text-slate-400"
            placeholder="Adicionar tarefa..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addItem(listKey, input);
                setInput("");
              }
            }}
          />
          <button
            onClick={() => {
              addItem(listKey, input);
              setInput("");
            }}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-slate-800 text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          >
            <Icons.Plus width="14" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500 overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
            <Icons.Grid className="text-blue-600 w-8 h-8" /> Matriz de
            Eisenhower
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">
            Priorização Estratégica de Tempo
          </p>
        </div>
      </div>
      <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto custom-scrollbar pb-4">
        <Quadrant
          title="Urgente & Importante"
          listKey="urgentImportant"
          bg="bg-rose-50/50"
          border="border-rose-100"
          color="text-rose-700"
          iconColor="bg-rose-500"
        />
        <Quadrant
          title="Não Urgente & Importante"
          listKey="notUrgentImportant"
          bg="bg-blue-50/50"
          border="border-blue-100"
          color="text-blue-700"
          iconColor="bg-blue-500"
        />
        <Quadrant
          title="Urgente & Não Importante"
          listKey="urgentNotImportant"
          bg="bg-amber-50/50"
          border="border-amber-100"
          color="text-amber-700"
          iconColor="bg-amber-500"
        />
        <Quadrant
          title="Não Urgente & Não Importante"
          listKey="notUrgentNotImportant"
          bg="bg-slate-100/50"
          border="border-slate-200"
          color="text-slate-600"
          iconColor="bg-slate-400"
        />
      </div>
    </div>
  );
};

// --- PLANNER VIEW ---
const PlannerView = ({ plannerData, setPlannerData, allTasks }) => {
  const [mode, setMode] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfWeek = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }, [currentDate]);

  const weekDates = useMemo(() => {
    let dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [startOfWeek]);

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const [dragItem, setDragItem] = useState(null);
  const onDragStart = (e, item, list) => setDragItem({ item, list });
  const onDrop = (e, targetList) => {
    if (!dragItem) return;
    const { item, list } = dragItem;
    if (list !== targetList) {
      setPlannerData((prev) => {
        const newState = { ...prev };
        newState[list] = newState[list].filter((i) => i.id !== item.id);
        newState[targetList] = [...newState[targetList], item];
        return newState;
      });
    }
    setDragItem(null);
  };
  const addItem = (list, text) => {
    if (text.trim())
      setPlannerData((prev) => ({
        ...prev,
        [list]: [...prev[list], { id: Date.now(), text }],
      }));
  };
  const removeItem = (list, id) => {
    setPlannerData((prev) => ({
      ...prev,
      [list]: prev[list].filter((i) => i.id !== id),
    }));
  };

  const WeekColumn = ({ title, listKey, items = [], date }) => {
    const tasksForDay = useMemo(() => {
      if (!date) return [];
      const dateStr = Utils.dateToLocalISO(date);
      return allTasks.filter((t) => t.date === dateStr);
    }, [allTasks, date]);

    return (
      <div
        className="w-full min-w-[340px] flex-shrink-0 flex flex-col bg-slate-50 rounded-xl border h-full shadow-sm"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => onDrop(e, listKey)}
      >
        <div className="p-4 border-b bg-white rounded-t-xl flex flex-col border-l-4 border-l-blue-500">
          <div className="flex justify-between items-center font-bold text-sm text-slate-700">
            <span className="capitalize">{title}</span>
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px]">
              {items.length + tasksForDay.length}
            </span>
          </div>
          {date && (
            <span className="text-[10px] text-slate-400 font-normal mt-1">
              {date.toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>
        <div className="flex-grow p-3 space-y-3 overflow-y-auto overflow-x-hidden custom-scrollbar min-w-0">
          {tasksForDay.map((task, i) => {
            const isDone = task.done;
            const borderColor = isDone
              ? "border-emerald-500"
              : "border-amber-400";
            const bgColor = isDone ? "bg-emerald-50" : "bg-white";
            const textColor = isDone ? "text-emerald-800" : "text-slate-700";
            const IconStatus = isDone ? Icons.CheckCircle : Icons.Clock;
            return (
              <div
                key={`plc-${i}`}
                className={`p-3 rounded-lg border border-l-4 ${borderColor} ${bgColor} shadow-sm text-xs relative transition-all`}
              >
                <div className="flex items-start gap-2 mb-2 min-w-0">
                  <div
                    className={`mt-0.5 ${isDone ? "text-emerald-600" : "text-amber-500"}`}
                  >
                    <IconStatus />
                  </div>
                  <span
                    className={`font-bold ${textColor} leading-tight whitespace-normal break-words min-w-0`}
                  >
                    {task.title}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded italic">
                    {task.assignee || "S/R"}
                  </span>
                  <span className="uppercase font-bold text-right break-words min-w-0">
                    {task.category}
                  </span>
                </div>
              </div>
            );
          })}
          {items.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => onDragStart(e, item, listKey)}
              className="bg-white p-3 rounded-lg border shadow-sm text-xs relative group cursor-grab hover:border-blue-300 transition"
            >
              <p className="leading-tight text-slate-700 whitespace-normal break-words">
                {item.text}
              </p>
              <button
                onClick={() => removeItem(listKey, item.id)}
                className="absolute top-1 right-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
              >
                <Icons.Trash2 />
              </button>
            </div>
          ))}
        </div>
        <div className="p-3 border-t bg-white rounded-b-xl">
          <input
            className="w-full text-xs p-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none transition"
            placeholder="+ Item rápido"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addItem(listKey, e.target.value);
                e.target.value = "";
              }
            }}
          />
        </div>
      </div>
    );
  };

  const MonthCalendar = () => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const daysInMonth = Utils.daysInMonth(currentMonth, currentYear);
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthName = new Date(currentYear, currentMonth).toLocaleString(
      "pt-BR",
      { month: "long" },
    );

    const getTasksForDay = (day) => {
      const dateStr = Utils.dateToLocalISO(
        new Date(currentYear, currentMonth, day),
      );
      return allTasks.filter((t) => t.date === dateStr);
    };

    return (
      <div className="bg-white rounded-2xl border p-6 h-full flex flex-col shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setCurrentMonth((p) => (p === 0 ? 11 : p - 1))}
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <Icons.ChevronLeft />
          </button>
          <h3 className="font-black capitalize text-xl text-slate-800">
            {monthName} {currentYear}
          </h3>
          <button
            onClick={() => setCurrentMonth((p) => (p === 11 ? 0 : p + 1))}
            className="p-2 hover:bg-slate-100 rounded-full transition"
          >
            <Icons.ChevronRight />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-3 text-center font-bold text-slate-400 text-[10px] uppercase tracking-widest">
          <div>Dom</div>
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div>Sáb</div>
        </div>
        <div className="grid grid-cols-7 gap-3 flex-grow overflow-y-auto custom-scrollbar">
          {blanks.map((_, i) => (
            <div
              key={`b-${i}`}
              className="bg-slate-50/50 rounded-xl min-h-[100px]"
            ></div>
          ))}
          {days.map((d) => {
            const dayTasks = getTasksForDay(d);
            const isToday =
              d === today.getDate() && currentMonth === today.getMonth();
            return (
              <div
                key={d}
                className={`border-2 rounded-xl p-2 flex flex-col min-h-[120px] transition-all ${isToday ? "border-blue-500 bg-blue-50/20" : "border-slate-50 hover:border-slate-200"}`}
              >
                <span
                  className={`text-xs font-black mb-2 ${isToday ? "text-blue-600" : "text-slate-300"}`}
                >
                  {d}
                </span>
                <div className="flex-grow space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
                  {dayTasks.map((t, i) => (
                    <div
                      key={i}
                      className={`text-[9px] px-2 py-1 rounded-md truncate border font-bold shadow-sm ${t.done ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}
                      title={t.title}
                    >
                      {t.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border shadow-sm mb-6">
        <div>
          <h2 className="font-black text-xl flex items-center gap-3 text-slate-800">
            <Icons.Columns className="text-blue-600 w-6 h-6" /> Planner
            Estratégico
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
          {mode === "week" && (
            <div className="flex items-center mr-3 border-r border-slate-200 pr-3">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-1.5 hover:bg-white rounded-lg transition shadow-sm"
              >
                <Icons.ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-black px-3 w-32 text-center text-slate-500 uppercase">
                {startOfWeek.toLocaleDateString("pt-BR")}
              </span>
              <button
                onClick={() => navigateWeek(1)}
                className="p-1.5 hover:bg-white rounded-lg transition shadow-sm"
              >
                <Icons.ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
          <button
            onClick={() => setMode("week")}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${mode === "week" ? "bg-white shadow-md text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            Semanal
          </button>
          <button
            onClick={() => setMode("month")}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${mode === "month" ? "bg-white shadow-md text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            Mensal
          </button>
        </div>
      </div>
      {mode === "week" ? (
        <div className="flex-grow overflow-x-auto pb-4 flex gap-5">
          <WeekColumn
            title="Backlog"
            listKey="backlog"
            items={plannerData.backlog}
          />
          {weekDates.map((d, i) => {
            const listKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
            return (
              <WeekColumn
                key={i}
                title={d.toLocaleDateString("pt-BR", { weekday: "long" })}
                listKey={listKeys[i]}
                items={plannerData[listKeys[i]]}
                date={d}
              />
            );
          })}
        </div>
      ) : (
        <MonthCalendar />
      )}
    </div>
  );
};

// --- PROS AND CONS VIEW ---
const ProsConsView = ({ pcData, setPcData }) => {
  const [proInput, setProInput] = useState("");
  const [conInput, setConInput] = useState("");

  const addItem = (type, text) => {
    if (!text.trim()) return;
    setPcData((prev) => ({
      ...prev,
      [type]: [...prev[type], { id: Date.now(), text }],
    }));
  };

  const removeItem = (type, id) => {
    setPcData((prev) => ({
      ...prev,
      [type]: prev[type].filter((i) => i.id !== id),
    }));
  };

  const Column = ({
    type,
    title,
    items,
    color,
    bg,
    input,
    setInput,
    icon: Icon,
  }) => (
    <div
      className={`flex-1 rounded-3xl p-8 border-2 ${bg} flex flex-col shadow-lg`}
    >
      <h3
        className={`font-black text-2xl mb-8 flex items-center gap-3 ${color}`}
      >
        <Icon className="w-8 h-8" /> {title}
      </h3>
      <div className="flex-grow space-y-4 overflow-y-auto custom-scrollbar mb-6 pr-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group animate-in slide-in-from-left duration-300"
          >
            <span className="text-slate-700 font-semibold">{item.text}</span>
            <button
              onClick={() => removeItem(type, item.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"
            >
              <Icons.Trash2 />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-slate-400 italic text-sm py-10">
            Nenhum item adicionado...
          </p>
        )}
      </div>
      <div className="relative">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addItem(type, input);
              setInput("");
            }
          }}
          placeholder={`Adicionar ${title.toLowerCase()}...`}
          className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-6 pr-16 outline-none focus:border-blue-400 shadow-inner transition-all text-slate-700 font-medium"
        />
        <button
          onClick={() => {
            addItem(type, input);
            setInput("");
          }}
          className="absolute right-2 top-2 bottom-2 aspect-square bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md hover:bg-blue-700 active:scale-95 transition-all"
        >
          <Icons.Plus />
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-full animate-in zoom-in duration-500">
      <Column
        type="pros"
        title="Vantagens"
        items={pcData.pros}
        color="text-emerald-700"
        bg="bg-emerald-50/50 border-emerald-100"
        input={proInput}
        setInput={setProInput}
        icon={Icons.ThumbsUp}
      />
      <Column
        type="cons"
        title="Desvantagens"
        items={pcData.cons}
        color="text-rose-700"
        bg="bg-rose-50/50 border-rose-100"
        input={conInput}
        setInput={setConInput}
        icon={(p) => <Icons.ThumbsUp {...p} className="rotate-180" />}
      />
    </div>
  );
};

/**
 * --- MAIN Page ProjectHubPage ---
 */
export default function ProjectHubPage() {
  const backend = useMemo(() => new ProjectHubBackend(), []);
  const [data, setData] = useState(null);
  const [currentView, setCurrentView] = useState("plc");
  const fileInputRef = useRef(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    loadXLSX();
    setData(backend.loadData());
  }, [backend]);

  useEffect(() => {
    if (data) backend.saveData(data);
  }, [data, backend]);

  if (!data)
    return (
      <div className="h-screen flex items-center justify-center font-black text-slate-300 animate-pulse">
        HUB CARREGANDO...
      </div>
    );

  const handleUpdatePLC = (id, field, value) => {
    setData((prev) => ({
      ...prev,
      simpleTasks: prev.simpleTasks.map((t) =>
        t.id === id ? { ...t, [field]: value } : t,
      ),
    }));
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file || !window.XLSX) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = window.XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const json = window.XLSX.utils.sheet_to_json(ws);
      const importedTasks = json.map((r, i) => ({
        id: Date.now() + i,
        title: r["Tarefa"] || r["Atividade"] || "Sem Título",
        category: r["Categoria"] || "Geral",
        assignee: r["Responsável"] || "",
        done: r["Concluído"] === "Sim",
        date: r["Data"] || "",
        obs: r["Obs"] || "",
      }));
      setData((prev) => ({
        ...prev,
        simpleTasks: [...prev.simpleTasks, ...importedTasks],
      }));
    };
    reader.readAsBinaryString(file);
  };

  const NavButton = ({ id, label, icon: IconComp, compact = false }) => (
    <button
      onClick={() => {
        setCurrentView(id);
        setNavOpen(false);
      }}
      className={`flex items-center gap-2 ${compact ? "px-4 py-2 text-xs" : "px-6 py-2 text-sm"} rounded-xl font-bold transition-all active:scale-95 whitespace-nowrap ${
        currentView === id
          ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
          : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      <IconComp
        className={currentView === id ? "text-white" : "text-slate-400"}
      />
      {label}
    </button>
  );

  const TopBar = () => (
    <header className="shrink-0 bg-white border-b shadow-sm z-30">
      <div className="h-16 sm:h-20 lg:h-24 flex items-center justify-between px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-4 sm:gap-6 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-100 shrink-0">
            <Icons.Columns />
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-lg sm:text-2xl tracking-tighter text-slate-800 leading-none truncate">
              PROJECT<span className="text-blue-600">HUB</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">
              Gestão Integrada v7.1.5
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNavOpen((v) => !v)}
            className="lg:hidden px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
          >
            MENU
          </button>

          <nav className="hidden lg:flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <NavButton id="plc" label="Tarefas PLC" icon={Icons.Table} />
            <NavButton id="planner" label="Planner" icon={Icons.Columns} />
            <NavButton
              id="eisenhower"
              label="Matriz Eisenhower"
              icon={Icons.Grid}
            />
            <NavButton
              id="proscons"
              label="Prós e Contras"
              icon={Icons.ThumbsUp}
            />
          </nav>
        </div>
      </div>

      {navOpen && (
        <div className="lg:hidden px-4 pb-4">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 flex gap-2 overflow-x-auto custom-scrollbar">
            <NavButton compact id="plc" label="PLC" icon={Icons.Table} />
            <NavButton
              compact
              id="planner"
              label="Planner"
              icon={Icons.Columns}
            />
            <NavButton
              compact
              id="eisenhower"
              label="Eisenhower"
              icon={Icons.Grid}
            />
            <NavButton
              compact
              id="proscons"
              label="Prós/Contras"
              icon={Icons.ThumbsUp}
            />
          </div>
        </div>
      )}
    </header>
  );

  const PlcActions = () => (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <input
        type="file"
        ref={fileInputRef}
        hidden
        accept=".xlsx, .xls"
        onChange={handleImportExcel}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-700 border-2 border-emerald-100 rounded-2xl hover:bg-emerald-100 font-bold text-xs transition-all w-full sm:w-auto"
      >
        <Icons.Upload /> IMPORTAR
      </button>
      <button
        onClick={() => backend.exportToExcel(data.simpleTasks)}
        className="flex items-center justify-center gap-2 px-5 py-3 bg-blue-50 text-blue-700 border-2 border-blue-100 rounded-2xl hover:bg-blue-100 font-bold text-xs transition-all w-full sm:w-auto"
      >
        <Icons.Download /> EXPORTAR
      </button>
      <button
        onClick={() =>
          setData((p) => ({
            ...p,
            simpleTasks: [
              ...p.simpleTasks,
              {
                id: Date.now(),
                title: "",
                category: "Geral",
                assignee: "",
                done: false,
                date: "",
                obs: "",
              },
            ],
          }))
        }
        className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 font-bold text-xs transition-all w-full sm:w-auto"
      >
        <Icons.Plus /> NOVA LINHA
      </button>
    </div>
  );

  const PlcCard = ({ task }) => (
    <div
      className={`bg-white border rounded-2xl p-4 shadow-sm ${task.done ? "opacity-70" : ""}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={task.done}
          onChange={(e) => handleUpdatePLC(task.id, "done", e.target.checked)}
          className="w-6 h-6 accent-blue-600 cursor-pointer rounded-lg mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <input
            value={task.title}
            onChange={(e) => handleUpdatePLC(task.id, "title", e.target.value)}
            className={`w-full bg-transparent outline-none font-bold text-slate-800 text-sm ${task.done ? "line-through text-slate-400" : ""}`}
            placeholder="O que precisa ser feito?"
          />
          <div className="mt-3 grid grid-cols-1 gap-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                value={task.category}
                onChange={(e) =>
                  handleUpdatePLC(task.id, "category", e.target.value)
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none font-bold text-blue-600 uppercase text-[10px]"
                placeholder="Categoria"
              />
              <input
                type="date"
                value={task.date}
                onChange={(e) =>
                  handleUpdatePLC(task.id, "date", e.target.value)
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none text-xs font-bold text-slate-600"
              />
            </div>
            <input
              value={task.assignee}
              onChange={(e) =>
                handleUpdatePLC(task.id, "assignee", e.target.value)
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none text-xs font-semibold text-slate-700"
              placeholder="Responsável"
            />
            <input
              value={task.obs}
              onChange={(e) => handleUpdatePLC(task.id, "obs", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none text-xs italic text-slate-500"
              placeholder="Detalhes..."
            />
          </div>
        </div>

        <button
          onClick={() =>
            setData((p) => ({
              ...p,
              simpleTasks: p.simpleTasks.filter((t) => t.id !== task.id),
            }))
          }
          className="text-slate-300 hover:text-red-500 transition-colors"
        >
          <Icons.Trash2 />
        </button>
      </div>
    </div>
  );

  const PlcView = () => (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-top duration-500 min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-3xl font-black text-slate-800 tracking-tight">
          Registro de Atividades
        </h2>
        <PlcActions />
      </div>

      <div className="bg-white border-2 border-slate-50 rounded-3xl shadow-2xl flex-grow overflow-hidden flex flex-col min-w-0">
        <div className="hidden lg:flex items-center gap-4 px-6 py-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Sincronizado
            </p>
            <p className="text-xs font-black text-slate-600">
              {Utils.getTodayString()}
            </p>
          </div>
        </div>

        <div className="sm:hidden p-4 space-y-3 overflow-y-auto custom-scrollbar">
          {data.simpleTasks.map((task) => (
            <PlcCard key={task.id} task={task} />
          ))}
        </div>

        <div className="hidden sm:block overflow-auto custom-scrollbar h-full">
          <table className="text-left border-collapse min-w-full">
            <thead className="sticky top-0 z-10 border-b-2 border-slate-50">
              <tr>
                <th className="p-5 w-16 text-center bg-slate-50">#</th>
                <ResizableHeader width={500} onResize={() => {}}>
                  Tarefa
                </ResizableHeader>
                <ResizableHeader width={150} onResize={() => {}}>
                  Categoria
                </ResizableHeader>
                <ResizableHeader width={150} onResize={() => {}}>
                  Data
                </ResizableHeader>
                <ResizableHeader width={100} onResize={() => {}}>
                  Responsável
                </ResizableHeader>
                <th className="p-3 border-b text-left bg-slate-50">
                  Observações
                </th>
                <th className="p-3 w-16 bg-slate-50"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.simpleTasks.map((task) => (
                <tr
                  key={task.id}
                  className={`group hover:bg-blue-50/20 transition-colors ${task.done ? "bg-slate-50/50" : ""}`}
                >
                  <td className="p-5 text-center">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) =>
                        handleUpdatePLC(task.id, "done", e.target.checked)
                      }
                      className="w-6 h-6 accent-blue-600 cursor-pointer rounded-lg"
                    />
                  </td>
                  <td className="p-5">
                    <input
                      value={task.title}
                      onChange={(e) =>
                        handleUpdatePLC(task.id, "title", e.target.value)
                      }
                      className={`w-full bg-transparent outline-none font-bold text-slate-700 ${task.done ? "line-through text-slate-300" : ""}`}
                      placeholder="O que precisa ser feito?"
                    />
                  </td>
                  <td className="p-5 text-sm">
                    <input
                      value={task.category}
                      onChange={(e) =>
                        handleUpdatePLC(task.id, "category", e.target.value)
                      }
                      className="w-full bg-transparent outline-none font-bold text-blue-500 uppercase text-[10px]"
                    />
                  </td>
                  <td className="p-5">
                    <input
                      type="date"
                      value={task.date}
                      onChange={(e) =>
                        handleUpdatePLC(task.id, "date", e.target.value)
                      }
                      className="w-full bg-transparent outline-none text-xs font-bold text-slate-500"
                    />
                  </td>
                  <td className="p-5">
                    <input
                      value={task.assignee}
                      onChange={(e) =>
                        handleUpdatePLC(task.id, "assignee", e.target.value)
                      }
                      className="w-full bg-transparent outline-none text-sm font-semibold text-slate-600"
                    />
                  </td>
                  <td className="p-5">
                    <input
                      value={task.obs}
                      onChange={(e) =>
                        handleUpdatePLC(task.id, "obs", e.target.value)
                      }
                      className="w-full bg-transparent outline-none text-xs italic text-slate-400"
                      placeholder="Detalhes..."
                    />
                  </td>
                  <td className="p-5 text-center">
                    <button
                      onClick={() =>
                        setData((p) => ({
                          ...p,
                          simpleTasks: p.simpleTasks.filter(
                            (t) => t.id !== task.id,
                          ),
                        }))
                      }
                      className="text-slate-200 hover:text-red-500 transition-colors"
                    >
                      <Icons.Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* TOP NAVIGATION BAR */}
      <TopBar />

      {/* MAIN CONTENT */}
      <main className="flex-grow p-4 sm:p-6 lg:p-10 overflow-hidden relative flex flex-col min-w-0">
        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
          {currentView === "plc" && <PlcView />}

          {currentView === "planner" && (
            <PlannerView
              plannerData={data.planner}
              setPlannerData={(updater) =>
                setData((p) => ({
                  ...p,
                  planner:
                    typeof updater === "function"
                      ? updater(p.planner)
                      : updater,
                }))
              }
              allTasks={data.simpleTasks}
            />
          )}

          {currentView === "proscons" && (
            <ProsConsView
              pcData={data.prosCons}
              setPcData={(updater) =>
                setData((p) => ({
                  ...p,
                  prosCons:
                    typeof updater === "function"
                      ? updater(p.prosCons)
                      : updater,
                }))
              }
            />
          )}

          {currentView === "eisenhower" && (
            <EisenhowerView
              eisenData={data.eisenhower}
              setEisenData={(updater) =>
                setData((p) => ({
                  ...p,
                  eisenhower:
                    typeof updater === "function"
                      ? updater(p.eisenhower)
                      : updater,
                }))
              }
            />
          )}
        </div>
      </main>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; border: 2px solid white; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `,
        }}
      />
    </div>
  );
}
