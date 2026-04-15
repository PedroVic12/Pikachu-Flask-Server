export const FilesScreen = () => {
    const [markdownContent, setMarkdownContent] = useState(
        `Faça edições no [arquivo.MD ][var4] do repositório para atualizar o dashboard da BatCaverna PV 

[var4]: https://github.com/PedroVic12/Pikachu-Flask-Server/blob/main/batcaverna/batcaverna_pv.md

Aqui está o [link][var1] do Shiatsu como váriavel no .MD

[var1]: https://revigorar.reservio.com/`,
    );
    // State for legacy files (pdf, image, excel) from localStorage
    const [uploadedFiles, setUploadedFiles] = useState([]);
    // State for decks from IndexedDB
    const [decks, setDecks] = useState([]);

    const [deckFile, setDeckFile] = useState(null);
    const [deckDescription, setDeckDescription] = useState("");

    // Load files from both localStorage and IndexedDB on initial render
    useEffect(() => {
        // Load legacy files and filter out any stray decks
        const legacyFiles = (FileUploaderController.loadFiles() || [])
            .filter // Defensive check        (f) => f.type !== "deck",
            ();
        setUploadedFiles(legacyFiles);

        // Load decks from IndexedDB
        const loadDecks = async () => {
            const storedDecks = await DeckStorageController.getAllDecks();
            setDecks(storedDecks);
        };
        loadDecks();
    }, []);

    const handleFileUpload = (event, type) => {
        const files = event.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            const reader = new FileReader();
            reader.onerror = (error) => {
                console.error("FileReader error:", error);
                alert("Ocorreu um erro ao ler o arquivo.");
            };
            reader.onload = (e) => {
                const newFile = {
                    name: file.name,
                    type: type,
                    url: e.target.result,
                };
                setUploadedFiles((prevFiles) => {
                    const newFiles = [...prevFiles, newFile];
                    const success = FileUploaderController.saveFiles(newFiles);
                    if (success) {
                        alert(`Arquivo ${file.name} carregado e salvo com sucesso!`);
                    } else {
                        alert(`Falha ao salvar o arquivo ${file.name}.`);
                    }
                    return newFiles;
                });
            };
            reader.readAsDataURL(file); // Read as data URL for preview
        });
    };

    const handleDownload = (file) => {
        if (!file.url) return;
        const link = document.createElement("a");
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAddDeck = async () => {
        if (!deckFile) {
            alert("Por favor, selecione um arquivo.");
            return;
        }

        const reader = new FileReader();

        reader.onerror = (error) => {
            console.error("FileReader error:", error);
            alert("Ocorreu um erro ao ler o arquivo.");
        };

        reader.onload = async (e) => {
            // We don't include 'id' because IndexedDB will generate it.
            const newDeckData = {
                name: deckFile.name,
                type: "deck",
                url: e.target.result,
                description: deckDescription || "Sem descrição",
            };

            const savedDeck = await DeckStorageController.saveDeck(newDeckData);

            if (savedDeck) {
                setDecks((prevDecks) => [...prevDecks, savedDeck]);
                alert(`Deck ${deckFile.name} adicionado com sucesso ao IndexedDB!`);
            } else {
                alert(
                    `Falha ao salvar o deck ${deckFile.name}. Verifique o console.`,
                );
            }

            // Reset fields after operation
            setDeckFile(null);
            setDeckDescription("");
            if (document.getElementById("deck-upload-input")) {
                document.getElementById("deck-upload-input").value = "";
            }
        };
        reader.readAsDataURL(deckFile);
    };

    const handleDeleteFile = async (file, legacyIndex) => {
        if (
            !window.confirm(
                `Tem certeza que deseja excluir o arquivo "${file.name}"?`,
            )
        ) {
            return;
        }

        if (file.type === "deck") {
            // Handle deletion from IndexedDB
            const success = await DeckStorageController.deleteDeck(file.id);
            if (success) {
                setDecks((prevDecks) => prevDecks.filter((d) => d.id !== file.id));
                alert("Deck excluído com sucesso.");
            } else {
                alert("Falha ao excluir o deck. Verifique o console.");
            }
        } else {
            // Handle deletion from localStorage
            setUploadedFiles((prevFiles) => {
                const newFiles = prevFiles.filter(
                    (_, index) => index !== legacyIndex,
                );
                const success = FileUploaderController.saveFiles(newFiles);
                if (!success) {
                    alert("Falha ao salvar as alterações após excluir o arquivo.");
                    return prevFiles; // Revert state on failure
                }
                alert("Arquivo excluído com sucesso.");
                return newFiles;
            });
        }
    };

    const uploadSections = [
        {
            type: "pdf",
            label: "Upload PDF",
            icon: FilePdf,
            color: "red",
            accept: ".pdf",
        },
        {
            type: "image",
            label: "Upload Imagem",
            icon: FileImage,
            color: "blue",
            accept: "image/*",
        },
        {
            type: "excel",
            label: "Upload Excel",
            icon: FileSpreadsheet,
            color: "green",
            accept: ".xlsx,.xls",
        },
    ];

    // Combine all files for rendering, adding a flag to distinguish them
    const allFiles = [
        ...uploadedFiles.map((file, index) => ({ ...file, legacyIndex: index })),
        ...decks,
    ];

    const carouselSections = {
        image: "Imagens",
        pdf: "Documentos PDF",
        excel: "Planilhas Excel",
        deck: "Decks AnaRede",
    };

    return (
        <div className="p-4 lg:p-6 bg-white dark:bg-gray-900">
            <div className="mb-6">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {" "}
                    Gerenciador de Arquivos V3{" "}
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                    {" "}
                    Upload e gerenciamento de PDFs, imagens, planilhas e decks do
                    AnaRede.{" "}
                </p>
            </div>

            {/* Upload Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {uploadSections.map(({ type, label, icon: Icon, color, accept }) => (
                    <div
                        key={type}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center"
                    >
                        <div
                            className={`p-4 ${colorClasses[color].bg} rounded-lg inline-block mb-4`}
                        >
                            <Icon className={`h-8 w-8 ${colorClasses[color].text}`} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {" "}
                            {label}{" "}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Faça upload de{" "}
                            {type === "pdf"
                                ? "documentos PDF"
                                : type === "image"
                                    ? "imagens"
                                    : "planilhas Excel"}
                        </p>
                        <input
                            type="file"
                            accept={accept}
                            onChange={(e) => handleFileUpload(e, type)}
                            className="hidden"
                            id={`${type}-upload-carousel`}
                            multiple
                        />
                        <label
                            htmlFor={`${type}-upload-carousel`}
                            className={`inline-flex items-center px-4 py-2 ${colorClasses[color].button} text-white rounded-lg cursor-pointer transition-colors`}
                        >
                            <Upload size={16} className="mr-2" />
                            Selecionar Arquivo(s)
                        </label>
                    </div>
                ))}
                {/* New Card for AnaRede Decks */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                    <div
                        className={`p-4 ${colorClasses.purple.bg} rounded-lg inline-block mb-4`}
                    >
                        <FileText className={`h-8 w-8 ${colorClasses[color].text}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Decks AnaRede
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Upload de arquivos .dat, .pwf, .spt com descrição.
                    </p>
                    <div className="space-y-4">
                        <input
                            type="file"
                            accept=".dat,.pwf,.spt,.DAT,.PWF,.SPT"
                            onChange={(e) => setDeckFile(e.target.files[0])}
                            className="block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:dark:bg-purple-900 file:dark:text-purple-200 hover:file:dark:bg-purple-800"
                            id="deck-upload-input"
                        />
                        <input
                            type="text"
                            placeholder="Descrição do deck..."
                            value={deckDescription}
                            onChange={(e) => setDeckDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <button
                            onClick={handleAddDeck}
                            className={`w-full inline-flex items-center justify-center px-4 py-2 ${colorClasses.purple.button} text-white rounded-lg cursor-pointer transition-colors`}
                        >
                            <Plus size={16} className="mr-2" />
                            Adicionar Deck
                        </button>
                    </div>
                </div>
            </div>

            {/* Separated Carousels for Uploaded Files */}
            {Object.entries(carouselSections).map(([type, title]) => {
                const filesOfType = allFiles.filter((file) => file.type === type);
                if (filesOfType.length === 0) return null;

                return (
                    <div
                        key={type}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-8"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            {title} Carregados
                        </h3>
                        <Carousel
                            opts={{
                                align: "start",
                                loop: filesOfType.length > 1,
                            }}
                            className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-4xl mx-auto"
                        >
                            <CarouselContent>
                                {filesOfType.map((file, i) => (
                                    <CarouselItem
                                        key={file.id || file.legacyIndex}
                                        className="md:basis-1/2 lg:basis-1/3"
                                    >
                                        <div className="p-1">
                                            <Card className="relative group bg-white dark:bg-gray-700">
                                                <button
                                                    onClick={() =>
                                                        handleDeleteFile(file, file.legacyIndex)
                                                    }
                                                    className="absolute top-2 right-2 z-10 p-1 bg-white bg-opacity-75 rounded-full text-gray-600 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-red-700"
                                                    title="Excluir arquivo"
                                                >
                                                    <X size={14} />
                                                </button>
                                                <CardContent className="flex aspect-square items-center justify-center p-4 flex-col gap-2">
                                                    {file.type === "image" && file.url ? (
                                                        <img
                                                            src={file.url}
                                                            alt={file.name}
                                                            className="max-w-full max-h-24 object-contain rounded-md"
                                                        />
                                                    ) : file.type === "pdf" ? (
                                                        <FilePdf className="w-16 h-16 text-red-500 dark:text-red-400" />
                                                    ) : file.type === "excel" ? (
                                                        <FileSpreadsheet className="w-16 h-16 text-green-500 dark:text-green-400" />
                                                    ) : (
                                                        // for 'deck' type
                                                        <FileText className="w-16 h-16 text-purple-500 dark:text-purple-400" />
                                                    )}
                                                    <p
                                                        className="text-xs text-center text-gray-600 dark:text-gray-300 truncate w-full pt-2"
                                                        title={file.name}
                                                    >
                                                        {file.name}
                                                    </p>
                                                    {file.description && (
                                                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                                                            {file.description}
                                                        </p>
                                                    )}
                                                    <button
                                                        onClick={() => handleDownload(file)}
                                                        className="mt-2 inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                                                    >
                                                        <Download size={14} className="mr-1.5" />
                                                        Baixar
                                                    </button>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                );
            })}

            {/* Markdown Editor for Links */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    {" "}
                    Editor de Links e Referências{" "}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Editor Markdown
                        </label>
                        <textarea
                            placeholder="Cole aqui seus links e referências em formato Markdown..."
                            className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            value={markdownContent}
                            onChange={(e) => setMarkdownContent(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Preview
                        </label>
                        <div className="h-64 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 overflow-y-auto">
                            <div className="prose prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {markdownContent}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
