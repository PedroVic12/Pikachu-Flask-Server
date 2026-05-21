import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import InvoiceStats from "../components/InvoiceStats";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Loader2 } from "lucide-react";

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#818cf8", "#a5b4fc"];

export default function Home() {
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        const data = await base44.entities.NotaFiscal.list("-created_date", 200);
        setNotas(data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Aggregate by category
    const byCategory = {};
    notas.forEach((n) => {
        const cat = n.categoria || "Outros";
        byCategory[cat] = (byCategory[cat] || 0) + (n.valor || 0);
    });
    const chartData = Object.entries(byCategory).map(([name, valor]) => ({ name, valor }));

    // Recent invoices
    const recentes = notas.slice(0, 5);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Painel</h1>
                <p className="text-sm text-muted-foreground mt-1">Resumo das suas notas fiscais</p>
            </div>

            <InvoiceStats notas={notas} />

            <div className="grid lg:grid-cols-2 gap-4">
                {/* Chart */}
                <div className="bg-card rounded-xl border border-border p-5">
                    <h2 className="text-sm font-semibold mb-4">Gastos por Categoria</h2>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                                <XAxis type="number" tickFormatter={(v) => `R$${v}`} tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                                <Tooltip
                                    formatter={(v) => [`R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, "Valor"]}
                                />
                                <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={20}>
                                    {chartData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center py-10">Sem dados ainda</p>
                    )}
                </div>

                {/* Recent */}
                <div className="bg-card rounded-xl border border-border p-5">
                    <h2 className="text-sm font-semibold mb-4">Notas Recentes</h2>
                    {recentes.length > 0 ? (
                        <div className="space-y-3">
                            {recentes.map((nf) => (
                                <div key={nf.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">{nf.fornecedor}</p>
                                        <p className="text-xs text-muted-foreground">NF {nf.numero} · {nf.categoria}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold tabular-nums">
                                            R$ {(nf.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </p>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${nf.status === "Paga" ? "bg-emerald-100 text-emerald-700" :
                                            nf.status === "Vencida" ? "bg-red-100 text-red-700" :
                                                nf.status === "Pendente" ? "bg-amber-100 text-amber-700" :
                                                    "bg-gray-100 text-gray-500"
                                            }`}>
                                            {nf.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground text-center py-10">Nenhuma nota cadastrada</p>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, Search, Filter, Loader2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import InvoiceTable from "../components/InvoiceTable";
import InvoiceFormDialog from "../components/InvoiceFormDialog";
import BulkUploadDialog from "../components/BulkUploadDialog";

export default function Notas() {
    const [notas, setNotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingNota, setEditingNota] = useState(null);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterCategoria, setFilterCategoria] = useState("all");

    const load = async () => {
        const data = await base44.entities.NotaFiscal.list("-created_date", 500);
        setNotas(data);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const filtered = notas.filter((nf) => {
        const matchSearch =
            !search ||
            nf.fornecedor?.toLowerCase().includes(search.toLowerCase()) ||
            nf.numero?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === "all" || nf.status === filterStatus;
        const matchCategoria = filterCategoria === "all" || nf.categoria === filterCategoria;
        return matchSearch && matchStatus && matchCategoria;
    });

    const handleEdit = (nf) => {
        setEditingNota(nf);
        setDialogOpen(true);
    };

    const handleNew = () => {
        setEditingNota(null);
        setDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Notas Fiscais</h1>
                    <p className="text-sm text-muted-foreground mt-1">{notas.length} nota{notas.length !== 1 ? "s" : ""} cadastrada{notas.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setBulkOpen(true)} className="gap-2">
                        <FolderOpen className="h-4 w-4" />
                        <span className="hidden sm:inline">Upload em Lote</span>
                    </Button>
                    <Button onClick={handleNew} className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Nova Nota</span>
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por fornecedor ou número..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-36">
                        <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos Status</SelectItem>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Paga">Paga</SelectItem>
                        <SelectItem value="Vencida">Vencida</SelectItem>
                        <SelectItem value="Cancelada">Cancelada</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={filterCategoria} onValueChange={setFilterCategoria}>
                    <SelectTrigger className="w-full sm:w-44">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas Categorias</SelectItem>
                        <SelectItem value="Material de Escritório">Material de Escritório</SelectItem>
                        <SelectItem value="Alimentação">Alimentação</SelectItem>
                        <SelectItem value="Transporte">Transporte</SelectItem>
                        <SelectItem value="Serviços">Serviços</SelectItem>
                        <SelectItem value="Manutenção">Manutenção</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border p-4">
                <InvoiceTable notas={filtered} onRefresh={load} onEdit={handleEdit} />
            </div>

            <BulkUploadDialog open={bulkOpen} onOpenChange={setBulkOpen} onSaved={load} />
            <InvoiceFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSaved={load}
                editingNota={editingNota}
            />
        </div>
    );
}

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState(undefined)

    React.useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
        const onChange = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
        }
        mql.addEventListener("change", onChange)
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
        return () => mql.removeEventListener("change", onChange);
    }, [])

    return !!isMobile
}

import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { createAxiosClient } from '@base44/sdk/dist/utils/axios-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
    const [authError, setAuthError] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [appPublicSettings, setAppPublicSettings] = useState(null); // Contains only { id, public_settings }

    useEffect(() => {
        checkAppState();
    }, []);

    const checkAppState = async () => {
        try {
            setIsLoadingPublicSettings(true);
            setAuthError(null);

            // First, check app public settings (with token if available)
            // This will tell us if auth is required, user not registered, etc.
            const appClient = createAxiosClient({
                baseURL: `/api/apps/public`,
                headers: {
                    'X-App-Id': appParams.appId
                },
                token: appParams.token, // Include token if available
                interceptResponses: true
            });

            try {
                const publicSettings = await appClient.get(`/prod/public-settings/by-id/${appParams.appId}`);
                setAppPublicSettings(publicSettings);

                // If we got the app public settings successfully, check if user is authenticated
                if (appParams.token) {
                    await checkUserAuth();
                } else {
                    setIsLoadingAuth(false);
                    setIsAuthenticated(false);
                    setAuthChecked(true);
                }
                setIsLoadingPublicSettings(false);
            } catch (appError) {
                console.error('App state check failed:', appError);

                // Handle app-level errors
                if (appError.status === 403 && appError.data?.extra_data?.reason) {
                    const reason = appError.data.extra_data.reason;
                    if (reason === 'auth_required') {
                        setAuthError({
                            type: 'auth_required',
                            message: 'Authentication required'
                        });
                    } else if (reason === 'user_not_registered') {
                        setAuthError({
                            type: 'user_not_registered',
                            message: 'User not registered for this app'
                        });
                    } else {
                        setAuthError({
                            type: reason,
                            message: appError.message
                        });
                    }
                } else {
                    setAuthError({
                        type: 'unknown',
                        message: appError.message || 'Failed to load app'
                    });
                }
                setIsLoadingPublicSettings(false);
                setIsLoadingAuth(false);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            setAuthError({
                type: 'unknown',
                message: error.message || 'An unexpected error occurred'
            });
            setIsLoadingPublicSettings(false);
            setIsLoadingAuth(false);
        }
    };

    const checkUserAuth = async () => {
        try {
            // Now check if the user is authenticated
            setIsLoadingAuth(true);
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            setIsAuthenticated(true);
            setIsLoadingAuth(false);
            setAuthChecked(true);
        } catch (error) {
            console.error('User auth check failed:', error);
            setIsLoadingAuth(false);
            setIsAuthenticated(false);
            setAuthChecked(true);

            // If user auth fails, it might be an expired token
            if (error.status === 401 || error.status === 403) {
                setAuthError({
                    type: 'auth_required',
                    message: 'Authentication required'
                });
            }
        }
    };

    const logout = (shouldRedirect = true) => {
        setUser(null);
        setIsAuthenticated(false);

        if (shouldRedirect) {
            // Use the SDK's logout method which handles token cleanup and redirect
            base44.auth.logout(window.location.href);
        } else {
            // Just remove the token without redirect
            base44.auth.logout();
        }
    };

    const navigateToLogin = () => {
        // Use the SDK's redirectToLogin method
        base44.auth.redirectToLogin(window.location.href);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoadingAuth,
            isLoadingPublicSettings,
            authError,
            appPublicSettings,
            authChecked,
            logout,
            navigateToLogin,
            checkUserAuth,
            checkAppState
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

import { Outlet, Link, useLocation } from "react-router-dom";
import { ReceiptText, LayoutDashboard, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Layout() {
    const location = useLocation();

    const navItems = [
        { path: "/", label: "Painel", icon: LayoutDashboard },
        { path: "/notas", label: "Notas Fiscais", icon: ReceiptText },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Top nav */}
            <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <ReceiptText className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-foreground tracking-tight">NF Control</span>
                    </div>

                    <nav className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${active
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{item.label}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => base44.auth.logout()}
                            className="ml-2 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            title="Sair"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </nav>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}


import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, FolderOpen } from "lucide-react";

const categorias = ["Material de Escritório", "Alimentação", "Transporte", "Serviços", "Manutenção", "Outros"];

export default function BulkUploadDialog({ open, onOpenChange, onSaved }) {
    const [files, setFiles] = useState([]);
    const [processing, setProcessing] = useState(false);
    const fileInputRef = useRef(null);

    const handleFiles = (e) => {
        const selected = Array.from(e.target.files || []).filter((f) => f.type === "application/pdf");
        setFiles(selected.map((f) => ({ file: f, status: "pending", name: f.name, data: null })));
    };

    const processAll = async () => {
        if (files.length === 0) return;
        setProcessing(true);

        for (let i = 0; i < files.length; i++) {
            setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "processing" } : f));

            const { file_url } = await base44.integrations.Core.UploadFile({ file: files[i].file });
            const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
                file_url,
                json_schema: {
                    type: "object",
                    properties: {
                        numero: { type: "string", description: "Número da nota fiscal" },
                        fornecedor: { type: "string", description: "Nome do fornecedor ou emitente" },
                        valor: { type: "number", description: "Valor total da nota fiscal em reais" },
                        data_emissao: { type: "string", description: "Data de emissão no formato YYYY-MM-DD" },
                        data_vencimento: { type: "string", description: "Data de vencimento no formato YYYY-MM-DD, se houver" },
                        categoria: { type: "string", description: "Categoria mais adequada entre: Material de Escritório, Alimentação, Transporte, Serviços, Manutenção, Outros" },
                        descricao: { type: "string", description: "Breve descrição do produto ou serviço" }
                    }
                }
            });

            if (result.status === "success" && result.output) {
                const d = Array.isArray(result.output) ? result.output[0] : result.output;
                await base44.entities.NotaFiscal.create({
                    numero: d.numero || `NF-${Date.now()}`,
                    fornecedor: d.fornecedor || "Não identificado",
                    valor: parseFloat(d.valor) || 0,
                    data_emissao: d.data_emissao || new Date().toISOString().split("T")[0],
                    data_vencimento: d.data_vencimento || "",
                    categoria: categorias.includes(d.categoria) ? d.categoria : "Outros",
                    descricao: d.descricao || "",
                    status: "Pendente",
                });
                setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "done" } : f));
            } else {
                setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: "error" } : f));
            }
        }

        setProcessing(false);
        onSaved();
    };

    const handleClose = () => {
        if (!processing) {
            setFiles([]);
            onOpenChange(false);
        }
    };

    const done = files.filter((f) => f.status === "done").length;
    const errors = files.filter((f) => f.status === "error").length;
    const allFinished = files.length > 0 && files.every((f) => f.status === "done" || f.status === "error");

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Upload em Lote</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                    {files.length === 0 ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 rounded-xl p-8 text-center cursor-pointer transition-colors"
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,application/pdf"
                                multiple
                                className="hidden"
                                onChange={handleFiles}
                            />
                            <FolderOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                            <p className="font-medium text-sm">Selecionar PDFs</p>
                            <p className="text-xs text-muted-foreground mt-1">Clique para selecionar vários arquivos de uma vez</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40 border border-border">
                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <span className="text-sm flex-1 truncate">{f.name}</span>
                                    {f.status === "pending" && <span className="text-xs text-muted-foreground">Aguardando</span>}
                                    {f.status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />}
                                    {f.status === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                                    {f.status === "error" && <AlertCircle className="h-4 w-4 text-destructive shrink-0" />}
                                </div>
                            ))}
                        </div>
                    )}

                    {allFinished && (
                        <div className={`text-sm rounded-lg p-3 ${errors > 0 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                            {done} nota{done !== 1 ? "s" : ""} importada{done !== 1 ? "s" : ""} com sucesso
                            {errors > 0 && ` · ${errors} com erro`}
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-1">
                        <p className="text-xs text-muted-foreground">
                            {files.length > 0 && `${files.length} arquivo${files.length !== 1 ? "s" : ""} selecionado${files.length !== 1 ? "s" : ""}`}
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleClose} disabled={processing}>
                                {allFinished ? "Fechar" : "Cancelar"}
                            </Button>
                            {files.length > 0 && !allFinished && (
                                <Button onClick={processAll} disabled={processing} className="gap-2">
                                    {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    {processing ? "Processando..." : "Importar Tudo"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

import React from "react";

export default function GoogleIcon({ className = "w-5 h-5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}


import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Loader2, Sparkles } from "lucide-react";

const categorias = ["Material de Escritório", "Alimentação", "Transporte", "Serviços", "Manutenção", "Outros"];
const statuses = ["Pendente", "Paga", "Vencida", "Cancelada"];

const emptyForm = {
    numero: "",
    fornecedor: "",
    valor: "",
    data_emissao: "",
    data_vencimento: "",
    categoria: "",
    status: "Pendente",
    descricao: "",
};

export default function InvoiceFormDialog({ open, onOpenChange, onSaved, editingNota }) {
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [extracting, setExtracting] = useState(false);
    const [pdfFileName, setPdfFileName] = useState("");
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (editingNota) {
            setForm({
                numero: editingNota.numero || "",
                fornecedor: editingNota.fornecedor || "",
                valor: editingNota.valor || "",
                data_emissao: editingNota.data_emissao || "",
                data_vencimento: editingNota.data_vencimento || "",
                categoria: editingNota.categoria || "",
                status: editingNota.status || "Pendente",
                descricao: editingNota.descricao || "",
            });
        } else {
            setForm(emptyForm);
        }
    }, [editingNota, open]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const data = { ...form, valor: parseFloat(form.valor) || 0 };
        if (editingNota) {
            await base44.entities.NotaFiscal.update(editingNota.id, data);
        } else {
            await base44.entities.NotaFiscal.create(data);
        }
        setSaving(false);
        onOpenChange(false);
        onSaved();
    };

    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    const handlePdfUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setExtracting(true);
        setPdfFileName(file.name);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
            file_url,
            json_schema: {
                type: "object",
                properties: {
                    numero: { type: "string", description: "Número da nota fiscal" },
                    fornecedor: { type: "string", description: "Nome do fornecedor ou emitente" },
                    valor: { type: "number", description: "Valor total da nota fiscal em reais" },
                    data_emissao: { type: "string", description: "Data de emissão no formato YYYY-MM-DD" },
                    data_vencimento: { type: "string", description: "Data de vencimento no formato YYYY-MM-DD, se houver" },
                    categoria: {
                        type: "string",
                        description: "Categoria mais adequada entre: Material de Escritório, Alimentação, Transporte, Serviços, Manutenção, Outros"
                    },
                    descricao: { type: "string", description: "Breve descrição do produto ou serviço" }
                }
            }
        });
        if (result.status === "success" && result.output) {
            const d = Array.isArray(result.output) ? result.output[0] : result.output;
            setForm(prev => ({
                ...prev,
                numero: d.numero || prev.numero,
                fornecedor: d.fornecedor || prev.fornecedor,
                valor: d.valor || prev.valor,
                data_emissao: d.data_emissao || prev.data_emissao,
                data_vencimento: d.data_vencimento || prev.data_vencimento,
                categoria: categorias.includes(d.categoria) ? d.categoria : prev.categoria,
                descricao: d.descricao || prev.descricao,
            }));
        }
        setExtracting(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{editingNota ? "Editar Nota Fiscal" : "Nova Nota Fiscal"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    {/* PDF Upload */}
                    {!editingNota && (
                        <div
                            onClick={() => !extracting && fileInputRef.current?.click()}
                            className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${extracting ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
                                }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={handlePdfUpload}
                            />
                            {extracting ? (
                                <div className="flex flex-col items-center gap-2 py-1">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    <p className="text-sm font-medium text-primary">Lendo nota fiscal...</p>
                                    <p className="text-xs text-muted-foreground">Extraindo dados do PDF</p>
                                </div>
                            ) : pdfFileName ? (
                                <div className="flex flex-col items-center gap-1 py-1">
                                    <FileText className="h-6 w-6 text-emerald-500" />
                                    <p className="text-sm font-medium text-emerald-600">Dados extraídos!</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-xs">{pdfFileName}</p>
                                    <p className="text-xs text-primary mt-0.5">Clique para trocar o arquivo</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-1 py-1">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        <span className="text-sm font-medium">Subir PDF da nota fiscal</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">O app preenche os campos automaticamente</p>
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-primary">
                                        <Upload className="h-3.5 w-3.5" />
                                        Clique para selecionar o PDF
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Número da NF *</Label>
                            <Input value={form.numero} onChange={(e) => set("numero", e.target.value)} required placeholder="001234" />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Valor (R$) *</Label>
                            <Input type="number" step="0.01" min="0" value={form.valor} onChange={(e) => set("valor", e.target.value)} required placeholder="0,00" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Fornecedor *</Label>
                        <Input value={form.fornecedor} onChange={(e) => set("fornecedor", e.target.value)} required placeholder="Nome do fornecedor" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Categoria *</Label>
                            <Select value={form.categoria} onValueChange={(v) => set("categoria", v)} required>
                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                <SelectContent>
                                    {categorias.map((c) => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label>Status</Label>
                            <Select value={form.status} onValueChange={(v) => set("status", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {statuses.map((s) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label>Data Emissão *</Label>
                            <Input type="date" value={form.data_emissao} onChange={(e) => set("data_emissao", e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                            <Label>Data Vencimento</Label>
                            <Input type="date" value={form.data_vencimento} onChange={(e) => set("data_vencimento", e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label>Descrição</Label>
                        <Input value={form.descricao} onChange={(e) => set("descricao", e.target.value)} placeholder="Observações (opcional)" />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? "Salvando..." : editingNota ? "Salvar" : "Adicionar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

import { DollarSign, FileText, AlertTriangle, CheckCircle } from "lucide-react";

export default function InvoiceStats({ notas }) {
    const total = notas.reduce((sum, n) => sum + (n.valor || 0), 0);
    const pendentes = notas.filter((n) => n.status === "Pendente").length;
    const pagas = notas.filter((n) => n.status === "Paga").length;
    const vencidas = notas.filter((n) => n.status === "Vencida").length;

    const stats = [
        {
            label: "Total em NFs",
            value: `R$ ${total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: "bg-emerald-50 text-emerald-600",
        },
        {
            label: "Total de Notas",
            value: notas.length,
            icon: FileText,
            color: "bg-blue-50 text-blue-600",
        },
        {
            label: "Pendentes",
            value: pendentes,
            icon: AlertTriangle,
            color: "bg-amber-50 text-amber-600",
        },
        {
            label: "Pagas",
            value: pagas,
            icon: CheckCircle,
            color: "bg-emerald-50 text-emerald-600",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map((s) => {
                const Icon = s.icon;
                return (
                    <div
                        key={s.label}
                        className="bg-card rounded-xl border border-border p-4 flex items-start gap-3"
                    >
                        <div className={`p-2 rounded-lg ${s.color}`}>
                            <Icon className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">{s.label}</p>
                            <p className="text-lg font-semibold text-foreground mt-0.5">{s.value}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

import { useState } from "react";
import { Trash2, Edit2, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import moment from "moment";

const statusColors = {
    Pendente: "bg-amber-100 text-amber-700",
    Paga: "bg-emerald-100 text-emerald-700",
    Vencida: "bg-red-100 text-red-700",
    Cancelada: "bg-gray-100 text-gray-500",
};

export default function InvoiceTable({ notas, onRefresh, onEdit }) {
    const [deleting, setDeleting] = useState(null);

    const handleDelete = async (id) => {
        setDeleting(id);
        await base44.entities.NotaFiscal.delete(id);
        onRefresh();
        setDeleting(null);
    };

    const handleStatusChange = async (id, newStatus) => {
        await base44.entities.NotaFiscal.update(id, { status: newStatus });
        onRefresh();
    };

    if (notas.length === 0) {
        return (
            <div className="text-center py-16 text-muted-foreground">
                <p className="text-sm">Nenhuma nota fiscal encontrada.</p>
                <p className="text-xs mt-1">Adicione sua primeira nota para começar.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border text-left">
                        <th className="pb-3 font-medium text-muted-foreground">Nº</th>
                        <th className="pb-3 font-medium text-muted-foreground">Fornecedor</th>
                        <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">Categoria</th>
                        <th className="pb-3 font-medium text-muted-foreground">Valor</th>
                        <th className="pb-3 font-medium text-muted-foreground hidden md:table-cell">Emissão</th>
                        <th className="pb-3 font-medium text-muted-foreground">Status</th>
                        <th className="pb-3 font-medium text-muted-foreground text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {notas.map((nf) => (
                        <tr key={nf.id} className="group hover:bg-muted/40 transition-colors">
                            <td className="py-3 font-mono text-xs">{nf.numero}</td>
                            <td className="py-3 font-medium">{nf.fornecedor}</td>
                            <td className="py-3 hidden sm:table-cell text-muted-foreground">{nf.categoria}</td>
                            <td className="py-3 font-semibold tabular-nums">
                                R$ {(nf.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 hidden md:table-cell text-muted-foreground">
                                {nf.data_emissao ? moment(nf.data_emissao).format("DD/MM/YYYY") : "—"}
                            </td>
                            <td className="py-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[nf.status] || "bg-gray-100 text-gray-600"}`}>
                                            {nf.status}
                                            <ChevronDown className="h-3 w-3" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        {["Pendente", "Paga", "Vencida", "Cancelada"].map((s) => (
                                            <DropdownMenuItem key={s} onClick={() => handleStatusChange(nf.id, s)}>
                                                {s}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </td>
                            <td className="py-3 text-right">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(nf)}>
                                        <Edit2 className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => handleDelete(nf.id)}
                                        disabled={deleting === nf.id}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const DefaultFallback = () => (
    <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
    </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback />, unauthenticatedElement }) {
    const { isAuthenticated, isLoadingAuth, authChecked, authError, checkUserAuth } = useAuth();

    useEffect(() => {
        if (!authChecked && !isLoadingAuth) {
            checkUserAuth();
        }
    }, [authChecked, isLoadingAuth, checkUserAuth]);

    if (isLoadingAuth || !authChecked) {
        return fallback;
    }

    if (authError) {
        if (authError.type === 'user_not_registered') {
            return <UserNotRegisteredError />;
        }
        return unauthenticatedElement;
    }

    if (!isAuthenticated) {
        return unauthenticatedElement;
    }

    return <Outlet />;
}


import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

const AlertDialog = AlertDialogPrimitive.Root

const AlertDialogTrigger = AlertDialogPrimitive.Trigger

const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Overlay
        className={cn(
            "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
        ref={ref} />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef(({ className, ...props }, ref) => (
    <AlertDialogPortal>
        <AlertDialogOverlay />
        <AlertDialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
                className
            )}
            {...props} />
    </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
    className,
    ...props
}) => (
    <div
        className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
        {...props} />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
    className,
    ...props
}) => (
    <div
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
        {...props} />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props} />
))
AlertDialogDescription.displayName =
    AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef(({ className, ...props }, ref) => (
    <AlertDialogPrimitive.Cancel
        ref={ref}
        className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
        {...props} />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

export {
    AlertDialog,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
}


import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}) {
    return (
        (<DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell:
                    "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md",
                    props.mode === "range"
                        ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                        : "[&:has([aria-selected])]:rounded-md"
                ),
                day: cn(
                    buttonVariants({ variant: "ghost" }),
                    "h-8 w-8 p-0 font-normal aria-selected:opacity-100"
                ),
                day_range_start: "day-range-start",
                day_range_end: "day-range-end",
                day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                day_today: "bg-accent text-accent-foreground",
                day_outside:
                    "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                day_disabled: "text-muted-foreground opacity-50",
                day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                day_hidden: "invisible",
                ...classNames,
            }}
            components={{
                IconLeft: ({ className, ...props }) => (
                    <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
                ),
                IconRight: ({ className, ...props }) => (
                    <ChevronRight className={cn("h-4 w-4", className)} {...props} />
                ),
            }}
            {...props} />)
    );
}
Calendar.displayName = "Calendar"

export { Calendar }


import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
            className
        )}
        {...props}>
        <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
            <Check className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }

// Inspired by react-hot-toast library
import { useState, useEffect } from "react";

const TOAST_LIMIT = 20;
const TOAST_REMOVE_DELAY = 1000000;

const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST",
};

let count = 0;

function genId() {
    count = (count + 1) % Number.MAX_VALUE;
    return count.toString();
}

const toastTimeouts = new Map();

const addToRemoveQueue = (toastId) => {
    if (toastTimeouts.has(toastId)) {
        return;
    }

    const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId);
        dispatch({
            type: actionTypes.REMOVE_TOAST,
            toastId,
        });
    }, TOAST_REMOVE_DELAY);

    toastTimeouts.set(toastId, timeout);
};

const _clearFromRemoveQueue = (toastId) => {
    const timeout = toastTimeouts.get(toastId);
    if (timeout) {
        clearTimeout(timeout);
        toastTimeouts.delete(toastId);
    }
};

export const reducer = (state, action) => {
    switch (action.type) {
        case actionTypes.ADD_TOAST:
            return {
                ...state,
                toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
            };

        case actionTypes.UPDATE_TOAST:
            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === action.toast.id ? { ...t, ...action.toast } : t
                ),
            };

        case actionTypes.DISMISS_TOAST: {
            const { toastId } = action;

            // ! Side effects ! - This could be extracted into a dismissToast() action,
            // but I'll keep it here for simplicity
            if (toastId) {
                addToRemoveQueue(toastId);
            } else {
                state.toasts.forEach((toast) => {
                    addToRemoveQueue(toast.id);
                });
            }

            return {
                ...state,
                toasts: state.toasts.map((t) =>
                    t.id === toastId || toastId === undefined
                        ? {
                            ...t,
                            open: false,
                        }
                        : t
                ),
            };
        }
        case actionTypes.REMOVE_TOAST:
            if (action.toastId === undefined) {
                return {
                    ...state,
                    toasts: [],
                };
            }
            return {
                ...state,
                toasts: state.toasts.filter((t) => t.id !== action.toastId),
            };
    }
};

const listeners = [];

let memoryState = { toasts: [] };

function dispatch(action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener) => {
        listener(memoryState);
    });
}

function toast({ ...props }) {
    const id = genId();

    const update = (props) =>
        dispatch({
            type: actionTypes.UPDATE_TOAST,
            toast: { ...props, id },
        });

    const dismiss = () =>
        dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id });

    dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open) => {
                if (!open) dismiss();
            },
        },
    });

    return {
        id,
        dismiss,
        update,
    };
}

function useToast() {
    const [state, setState] = useState(memoryState);

    useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, [state]);

    return {
        ...state,
        toast,
        dismiss: (toastId) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
    };
}

export { useToast, toast };


import { useToast } from "@/components/ui/use-toast";
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
    const { toasts } = useToast();

    return (
        <ToastProvider>
            {toasts.map(function ({ id, title, description, action, ...props }) {
                return (
                    <Toast key={id} {...props}>
                        <div className="grid gap-1">
                            {title && <ToastTitle>{title}</ToastTitle>}
                            {description && (
                                <ToastDescription>{description}</ToastDescription>
                            )}
                        </div>
                        {action}
                        <ToastClose />
                    </Toast>
                );
            })}
            <ToastViewport />
        </ToastProvider>
    );
}

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
            className
        )}
        {...props} />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
            className
        )}
        {...props} />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
        )}
        {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }


import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
    return (
        (<textarea
            className={cn(
                "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                className
            )}
            ref={ref}
            {...props} />)
    );
})
Textarea.displayName = "Textarea"

export { Textarea }


import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button";

const Pagination = ({
    className,
    ...props
}) => (
    <nav
        role="navigation"
        aria-label="pagination"
        className={cn("mx-auto flex w-full justify-center", className)}
        {...props} />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        className={cn("flex flex-row items-center gap-1", className)}
        {...props} />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

const PaginationLink = ({
    className,
    isActive,
    size = "icon",
    ...props
}) => (
    <a
        aria-current={isActive ? "page" : undefined}
        className={cn(buttonVariants({
            variant: isActive ? "outline" : "ghost",
            size,
        }), className)}
        {...props} />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
    className,
    ...props
}) => (
    <PaginationLink
        aria-label="Go to previous page"
        size="default"
        className={cn("gap-1 pl-2.5", className)}
        {...props}>
        <ChevronLeft className="h-4 w-4" />
        <span>Previous</span>
    </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
    className,
    ...props
}) => (
    <PaginationLink
        aria-label="Go to next page"
        size="default"
        className={cn("gap-1 pr-2.5", className)}
        {...props}>
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
    </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
    className,
    ...props
}) => (
    <span
        aria-hidden
        className={cn("flex h-9 w-9 items-center justify-center", className)}
        {...props}>
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">More pages</span>
    </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

export {
    Pagination,
    PaginationContent,
    PaginationLink,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
    PaginationEllipsis,
}

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
    <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
            ref={ref}
            align={align}
            sideOffset={sideOffset}
            className={cn(
                "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                className
            )}
            {...props} />
    </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }

"use client"

import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

function MenubarMenu({
    ...props
}) {
    return <MenubarPrimitive.Menu {...props} />;
}

function MenubarGroup({
    ...props
}) {
    return <MenubarPrimitive.Group {...props} />;
}

function MenubarPortal({
    ...props
}) {
    return <MenubarPrimitive.Portal {...props} />;
}

function MenubarRadioGroup({
    ...props
}) {
    return <MenubarPrimitive.RadioGroup {...props} />;
}

function MenubarSub({
    ...props
}) {
    return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

const Menubar = React.forwardRef(({ className, ...props }, ref) => (
    <MenubarPrimitive.Root
        ref={ref}
        className={cn(
            "flex h-9 items-center space-x-1 rounded-md border bg-background p-1 shadow-sm",
            className
        )}
        {...props} />
))
Menubar.displayName = MenubarPrimitive.Root.displayName

const MenubarTrigger = React.forwardRef(({ className, ...props }, ref) => (
    <MenubarPrimitive.Trigger
        ref={ref}
        className={cn(
            "flex cursor-default select-none items-center rounded-sm px-3 py-1 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
            className
        )}
        {...props} />
))
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName

const MenubarSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => (
    <MenubarPrimitive.SubTrigger
        ref={ref}
        className={cn(
            "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
            inset && "pl-8",
            className
        )}
        {...props}>
        {children}
        <ChevronRight className="ml-auto h-4 w-4" />
    </MenubarPrimitive.SubTrigger>
))
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName

const MenubarSubContent = React.forwardRef(({ className, ...props }, ref) => (
    <MenubarPrimitive.SubContent
        ref={ref}
        className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
        )}
        {...props} />
))
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName

const MenubarContent = React.forwardRef((
    { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
    ref
) => (
    <MenubarPrimitive.Portal>
        <MenubarPrimitive.Content
            ref={ref}
            align={align}
            alignOffset={alignOffset}
            sideOffset={sideOffset}
            className={cn(
                "z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                className
            )}
            {...props} />
    </MenubarPrimitive.Portal>
))
MenubarContent.displayName = MenubarPrimitive.Content.displayName

const MenubarItem = React.forwardRef(({ className, inset, ...props }, ref) => (
    <MenubarPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            inset && "pl-8",
            className
        )}
        {...props} />
))
MenubarItem.displayName = MenubarPrimitive.Item.displayName

const MenubarCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => (
    <MenubarPrimitive.CheckboxItem
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className
        )}
        checked={checked}
        {...props}>
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <MenubarPrimitive.ItemIndicator>
                <Check className="h-4 w-4" />
            </MenubarPrimitive.ItemIndicator>
        </span>
        {children}
    </MenubarPrimitive.CheckboxItem>
))
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName

const MenubarRadioItem = React.forwardRef(({ className, children, ...props }, ref) => (
    <MenubarPrimitive.RadioItem
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className
        )}
        {...props}>
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <MenubarPrimitive.ItemIndicator>
                <Circle className="h-4 w-4 fill-current" />
            </MenubarPrimitive.ItemIndicator>
        </span>
        {children}
    </MenubarPrimitive.RadioItem>
))
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName

const MenubarLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
    <MenubarPrimitive.Label
        ref={ref}
        className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
        {...props} />
))
MenubarLabel.displayName = MenubarPrimitive.Label.displayName

const MenubarSeparator = React.forwardRef(({ className, ...props }, ref) => (
    <MenubarPrimitive.Separator
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-muted", className)}
        {...props} />
))
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName

const MenubarShortcut = ({
    className,
    ...props
}) => {
    return (
        (<span
            className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
            {...props} />)
    );
}
MenubarShortcut.displayname = "MenubarShortcut"
import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => (
    <DropdownMenuPrimitive.SubTrigger
        ref={ref}
        className={cn(
            "flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
            inset && "pl-8",
            className
        )}
        {...props}>
        {children}
        <ChevronRight className="ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
    DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.SubContent
        ref={ref}
        className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
        )}
        {...props} />
))
DropdownMenuSubContent.displayName =
    DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
            ref={ref}
            sideOffset={sideOffset}
            className={cn(
                "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                className
            )}
            {...props} />
    </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
            inset && "pl-8",
            className
        )}
        {...props} />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => (
    <DropdownMenuPrimitive.CheckboxItem
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className
        )}
        checked={checked}
        {...props}>
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <DropdownMenuPrimitive.ItemIndicator>
                <Check className="h-4 w-4" />
            </DropdownMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
    DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => (
    <DropdownMenuPrimitive.RadioItem
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className
        )}
        {...props}>
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <DropdownMenuPrimitive.ItemIndicator>
                <Circle className="h-2 w-2 fill-current" />
            </DropdownMenuPrimitive.ItemIndicator>
        </span>
        {children}
    </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Label
        ref={ref}
        className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
        {...props} />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-muted", className)}
        {...props} />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
    className,
    ...props
}) => {
    return (
        (<span
            className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
            {...props} />)
    );
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuRadioGroup,
}
"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props} />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
                className
            )}
            {...props}>
            {children}
            <DialogPrimitive.Close
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
    className,
    ...props
}) => (
    <div
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
        {...props} />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
    className,
    ...props
}) => (
    <div
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
        {...props} />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props} />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props} />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogTrigger,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}

"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

const Drawer = ({
    shouldScaleBackground = true,
    ...props
}) => (
    <DrawerPrimitive.Root shouldScaleBackground={shouldScaleBackground} {...props} />
)
Drawer.displayName = "Drawer"

const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerClose = DrawerPrimitive.Close

const DrawerOverlay = React.forwardRef(({ className, ...props }, ref) => (
    <DrawerPrimitive.Overlay
        ref={ref}
        className={cn("fixed inset-0 z-50 bg-black/80", className)}
        {...props} />
))
DrawerOverlay.displayName = DrawerPrimitive.Overlay.displayName

const DrawerContent = React.forwardRef(({ className, children, ...props }, ref) => (
    <DrawerPortal>
        <DrawerOverlay />
        <DrawerPrimitive.Content
            ref={ref}
            className={cn(
                "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
                className
            )}
            {...props}>
            <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
            {children}
        </DrawerPrimitive.Content>
    </DrawerPortal>
))
DrawerContent.displayName = "DrawerContent"

const DrawerHeader = ({
    className,
    ...props
}) => (
    <div
        className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
        {...props} />
)
DrawerHeader.displayName = "DrawerHeader"

const DrawerFooter = ({
    className,
    ...props
}) => (
    <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
)
DrawerFooter.displayName = "DrawerFooter"

const DrawerTitle = React.forwardRef(({ className, ...props }, ref) => (
    <DrawerPrimitive.Title
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props} />
))
DrawerTitle.displayName = DrawerPrimitive.Title.displayName

const DrawerDescription = React.forwardRef(({ className, ...props }, ref) => (
    <DrawerPrimitive.Description
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props} />
))
DrawerDescription.displayName = DrawerPrimitive.Description.displayName

export {
    Drawer,
    DrawerPortal,
    DrawerOverlay,
    DrawerTrigger,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
}

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                outline:
                    "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                icon: "h-9 w-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
        (<Comp
            className={cn(buttonVariants({ variant, size, className }))}
            ref={ref}
            {...props} />)
    );
})
Button.displayName = "Button"

export { Button, buttonVariants }
