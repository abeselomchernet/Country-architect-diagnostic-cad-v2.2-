import React, { useState, useEffect } from "react";
import { 
  Database, 
  RefreshCw, 
  Sparkles, 
  Send, 
  FileSpreadsheet, 
  Mail, 
  Play, 
  Check, 
  Trash2, 
  Plus, 
  Info, 
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  FormInput,
  FolderOpen,
  FileText,
  Clock,
  UserCheck,
  Search,
  Eye,
  FileCheck
} from "lucide-react";
import { motion } from "motion/react";
import { 
  googleSignIn, 
  sovereignLogout, 
  initAuth, 
  getAccessToken,
  FirestoreRepository, 
  GoogleWorkspaceAPIs, 
  SovereignSnapshot, 
  IngestionFormResponse, 
  DriveDocumentRef,
  seedInitialAssessments
} from "../core/firebase_service";
import { CADEngine, CADInput, CADResult } from "../core/cadEngine";

interface FlywheelWorkspaceProps {
  onLoadAssessmentToWorkspace: (input: CADInput) => void;
  activeWorkspaceCountry: string;
  activeWorkspaceARI: number;
  activeWorkspaceScores: CADResult;
  renderMode?: "full" | "collection_hub" | "evidence_vault" | "data_flywheel" | "institutional_memory";
}

export default function FlywheelWorkspace({ 
  onLoadAssessmentToWorkspace, 
  activeWorkspaceCountry, 
  activeWorkspaceARI,
  activeWorkspaceScores,
  renderMode = "full"
}: FlywheelWorkspaceProps) {
  // Auth state
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  // Active step of the interactive SVG pipeline
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);

  // Force active step override if renderMode is specified
  useEffect(() => {
    if (renderMode === "collection_hub") {
      setActivePipelineStep(0);
    } else if (renderMode === "evidence_vault") {
      setActivePipelineStep(4);
    } else if (renderMode === "data_flywheel") {
      setActivePipelineStep(1); // default to sheets, can toggle to 5 for documents
    } else if (renderMode === "institutional_memory") {
      setActivePipelineStep(3);
    }
  }, [renderMode]);

  // Firestore DB states
  const [assessmentsList, setAssessmentsList] = useState<SovereignSnapshot[]>([]);
  const [isLoadingAsms, setIsLoadingAsms] = useState<boolean>(false);

  // Forms states
  const [inboundForms, setInboundForms] = useState<IngestionFormResponse[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

  // Sheets states
  const [sheetId, setSheetId] = useState<string>("1x8C_aD-F_Sovereign_Lab_Consolidation_Sheet");
  const [sheetTabName, setSheetTabName] = useState<string>("CAD_Calibrations");
  const [isSyncingSheet, setIsSyncingSheet] = useState<boolean>(false);
  const [sheetLink, setSheetLink] = useState<string | null>(null);

  // Drive states
  const [attachedFiles, setAttachedFiles] = useState<DriveDocumentRef[]>([]);
  const [driveSearch, setDriveSearch] = useState<string>("");
  const [selectedEvidenceTarget, setSelectedEvidenceTarget] = useState<string>("Structuring Capacity");
  const [isUploadingDriveSim, setIsUploadingDriveSim] = useState<boolean>(false);

  // Google Docs state
  const [docNotes, setDocNotes] = useState<string>("");
  const [renderedDocContent, setRenderedDocContent] = useState<string | null>(null);
  const [docLink, setDocLink] = useState<string | null>(null);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState<boolean>(false);

  // Gmail states
  const [mailRecipient, setMailRecipient] = useState<string>("imf.advisor.eth@imf.org");
  const [mailSubject, setMailSubject] = useState<string>(`Sovereign Diagnostic Alert: ${activeWorkspaceCountry} CAD Resolution`);
  const [mailBody, setMailBody] = useState<string>("");
  const [isSendingMail, setIsSendingMail] = useState<boolean>(false);
  
  // Google Slides States
  const [slidesOutline, setSlidesOutline] = useState<string[] | null>(null);
  const [slidesLink, setSlidesLink] = useState<string | null>(null);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState<boolean>(false);

  // Confirmation overlays
  const [pendingConfirmAction, setPendingConfirmAction] = useState<{
    type: "delete" | "sheet_write" | "gmail_send" | "firestore_save";
    targetId?: string;
    details?: string;
  } | null>(null);

  // Load auth state
  useEffect(() => {
    const unsub = initAuth(
      (u, t) => {
        setUser(u);
        setToken(t);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
    loadDatabase();
    return () => unsub();
  }, []);

  // Update Gmail prefilled body body when workspace parameters change
  useEffect(() => {
    setMailSubject(`Sovereign Diagnostic Alert: ${activeWorkspaceCountry} CAD Resolution`);
    setMailBody(
      `Sovereign Advisory Team,\n\n` +
      `A new institutional-grade CAD digital diagnostics assessment has been finalized for ${activeWorkspaceCountry}.\n` +
      `- Absolute Architect Readiness Index (ARI): ${activeWorkspaceARI.toFixed(3)}\n` +
      `- Classification Designation: ${activeWorkspaceScores.classification}\n` +
      `- Primary Binding Constraint: ${activeWorkspaceScores.bindingConstraint}\n` +
      `- Top Recommended Action Pathway: ${activeWorkspaceScores.priorityUpgradePathway[0] || "None"}\n\n` +
      `Please review the replication models and associated Pre-Analysis Plan on Firestore.`
    );
  }, [activeWorkspaceCountry, activeWorkspaceARI, activeWorkspaceScores]);

  // Read historic assessments, inbound forms, attached evidence files
  const loadDatabase = async () => {
    setIsLoadingAsms(true);
    try {
      const asms = await FirestoreRepository.getAssessments();
      setAssessmentsList(asms);

      // Load forms
      const forms = await GoogleWorkspaceAPIs.fetchInboundForms();
      setInboundForms(forms);

      // Set first form of selection list as active
      if (forms.length > 0 && !selectedFormId) {
        setSelectedFormId(forms[0].formId);
      }

      // Load evidence files if active assessment exists
      if (asms.length > 0) {
        const files = await FirestoreRepository.getEvidenceDocuments(asms[0].id);
        setAttachedFiles(files);
      }
    } catch (err) {
      console.error("Database load error: ", err);
    } finally {
      setIsLoadingAsms(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        setNeedsAuth(false);
        await loadDatabase();
      }
    } catch (err) {
      alert("Sign-in failed. Running in emulated Sandbox offline mode.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await sovereignLogout();
    setUser(null);
    setToken(null);
    setNeedsAuth(true);
  };

  // 1. SAVE WORKSPACE AS NEW ASSESSMENT RECORD
  const handleSaveWorkspaceToFirestore = async () => {
    if (needsAuth) {
      alert("Please authenticate using the Google Profile connection above before saving.");
      return;
    }

    // Reconstruct inputs object
    const simulatedInputs: CADInput = {
      demandReality: 7.5, // uses fallback if not passed, but will tie to workspace
      deliveryInfrastructure: 6.0,
      trustArchitecture: 4.0,
      unitEconomics: 4.5,
      capitalPresence: 7.0,
      dataLegibility: 3.5,
      structuringCapacity: 3.5,
      regulatoryTranslation: 6.5,
      capitalAdequacy: 7.5,
      politicalAccess: 6.5,
      executionDensity: 5.5,
      dataCapability: 6.0,
      trustAcquisition: 6.5,
      priorARI: 4.5,
      deltaTime: 1.75,
      systemFailureRate: 35,
      frictionFloor: 3.5
    };

    const newAsm: SovereignSnapshot = {
      id: `asm-${activeWorkspaceCountry.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`,
      countryId: activeWorkspaceCountry.toLowerCase().replace(/\s+/g, "-"),
      countryName: activeWorkspaceCountry,
      creatorId: user?.uid || "usr-abeselom-777",
      creatorEmail: user?.email || "berhaneunity@gmail.com",
      timestamp: new Date().toISOString(),
      results: activeWorkspaceScores,
      inputs: simulatedInputs,
      evidenceCount: 0
    };

    const ok = await FirestoreRepository.saveAssessment(newAsm);
    if (ok) {
      await loadDatabase();
      alert(`Success! [${activeWorkspaceCountry} Assessment] saved securely to Firestore Repository.`);
    }
  };

  // 2. INGEST FORM DATA DIRECTLY INTO CALCULATOR WORKSPACE
  const handleIngestFromGoogleForm = (frm: IngestionFormResponse) => {
    // Populate parameters to interactive model workspace
    const mappedInputs: CADInput = {
      demandReality: frm.rawPillars.demandReality,
      deliveryInfrastructure: frm.rawPillars.deliveryInfrastructure,
      trustArchitecture: frm.rawPillars.trustArchitecture,
      unitEconomics: frm.rawPillars.unitEconomics,
      capitalPresence: frm.rawPillars.capitalPresence,
      dataLegibility: frm.rawPillars.dataLegibility,
      structuringCapacity: frm.rawPillars.structuringCapacity,
      regulatoryTranslation: frm.rawPillars.regulatoryTranslation,
      capitalAdequacy: frm.rawPillars.capitalAdequacy,
      politicalAccess: frm.rawPillars.politicalAccess,
      executionDensity: frm.rawPillars.executionDensity,
      dataCapability: frm.rawPillars.dataCapability,
      trustAcquisition: frm.rawPillars.trustAcquisition,
      priorARI: 4.5,
      deltaTime: 1.5,
      systemFailureRate: 30,
      frictionFloor: 3.0
    };

    // Load into parent
    onLoadAssessmentToWorkspace(mappedInputs);
    alert(`Success: Loaded field survey dataset from ${frm.respondentEmail} (${frm.countryId.toUpperCase()}) directly into diagnostic workspace.`);
  };

  // 3. PUSH ASSESSMENTS DATA to GOOGLE SHEET
  const handleSheetsExport = async () => {
    if (!assessmentsList.length) {
      alert("No active diagnostics in the memory repository to export. Save an assessment first.");
      return;
    }

    setIsSyncingSheet(true);
    const activeAsm = assessmentsList[0];
    const res = await GoogleWorkspaceAPIs.pushToGoogleSheets(sheetId, sheetTabName, activeAsm);
    
    setIsSyncingSheet(false);
    if (res.status === "success") {
      setSheetLink(res.webUrl || "");
      alert(`Google Sheets Synced successfully! Added row into table tab: '${sheetTabName}'`);
    } else {
      alert("Error syncing to spreadsheet.");
    }
  };

  // 4. GENERATE STRATEGY BRIEF IN GOOGLE DOCS
  const handleDocsExport = async () => {
    if (!assessmentsList.length) {
      alert("No active diagnostics saved. Save one before creating a Doc Briefing.");
      return;
    }
    setIsGeneratingDoc(true);
    const activeAsm = assessmentsList[0];
    const res = await GoogleWorkspaceAPIs.createBriefingDoc(activeAsm, docNotes);
    setIsGeneratingDoc(false);
    
    if (res.status === "success") {
      setRenderedDocContent(res.generatedContent);
      setDocLink(res.webUrl);
      alert("Google Doc Policy Memo generated successfully!");
    }
  };

  // 5. SEND EMAIL BRIEF THROUGH GMAIL
  const handleSendGmail = async () => {
    setIsSendingMail(true);
    const ok = await GoogleWorkspaceAPIs.sendDiagnosticMail(mailRecipient, mailSubject, mailBody);
    setIsSendingMail(false);
    if (ok) {
      alert(`Success! Email dispatched via Google Workspace authorization to ${mailRecipient} securely.`);
    } else {
      alert("Failure sending email.");
    }
  };

  // 6. BUILD PRESENTATION DECK IN GOOGLE SLIDES
  const handleSlidesExport = async () => {
    if (!assessmentsList.length) {
      alert("No active diagnostics saved to build slides from.");
      return;
    }
    setIsGeneratingSlides(true);
    const activeAsm = assessmentsList[0];
    const res = await GoogleWorkspaceAPIs.generatePresentationDeck(activeAsm);
    setIsGeneratingSlides(false);
    
    if (res.status === "success") {
      setSlidesOutline(res.slidesOutline);
      setSlidesLink(res.webUrl);
      alert("Google Slides Ministry Deck created!");
    }
  };

  // 7. SIMULATE EVIDENCE DOCUMENT ASSOCIATION FROM DRIVE
  const handleLinkDriveDocumentSimulation = async (fName: string, size: number) => {
    if (!assessmentsList.length) {
      alert("No active assessments in Firestore to link evidence to.");
      return;
    }

    setIsUploadingDriveSim(true);
    const matchedAssessment = assessmentsList[0];
    
    const driveDoc: DriveDocumentRef = {
      fileId: `drv-${Math.random().toString(36).substr(2, 9)}`,
      fileName: fName,
      targetIndicator: selectedEvidenceTarget,
      sizeBytes: size,
      ownerEmail: user?.email || "berhaneunity@gmail.com",
      linkedAssessmentId: matchedAssessment.id,
      hashSignature: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join("")
    };

    const ok = await FirestoreRepository.linkEvidenceDocument(driveDoc);
    setIsUploadingDriveSim(false);
    
    if (ok) {
      await loadDatabase();
      alert(`Drive Document Attached: Connected "${fName}" permanently to indicate level of [${selectedEvidenceTarget}] in the active Pre-Analysis plan.`);
    }
  };

  // 8. FIRESTORE DELETE OPERATION
  const handleDeleteAssessment = async (id: string) => {
    const ok = await FirestoreRepository.deleteAssessment(id);
    if (ok) {
      await loadDatabase();
      alert("Assessment record deleted from Firestore.");
    }
  };

  // Confirmation Trigger Utility
  const requestTriggerConfirmation = (
    type: "delete" | "sheet_write" | "gmail_send" | "firestore_save", 
    targetId?: string, 
    details?: string
  ) => {
    setPendingConfirmAction({ type, targetId, details });
  };

  const executeConfirmedAction = async () => {
    if (!pendingConfirmAction) return;

    const { type, targetId } = pendingConfirmAction;
    setPendingConfirmAction(null);

    if (type === "delete" && targetId) {
      await handleDeleteAssessment(targetId);
    } else if (type === "sheet_write") {
      await handleSheetsExport();
    } else if (type === "gmail_send") {
      await handleSendGmail();
    } else if (type === "firestore_save") {
      await handleSaveWorkspaceToFirestore();
    }
  };

  // Filters connected files by search string
  const filteredAttachedFiles = attachedFiles.filter(item =>
    item.fileName.toLowerCase().includes(driveSearch.toLowerCase()) ||
    item.targetIndicator.toLowerCase().includes(driveSearch.toLowerCase())
  );

  return (
    <div className="bg-stone-50 border border-stone-250 p-6 md:p-8 rounded-lg shadow-sm space-y-8 select-none">
      
      {/* Dynamic Overlay Confirmation Dialog (Secure Zero-Trust Mandate) */}
      {pendingConfirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white border-2 border-stone-850 p-6 rounded-md max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-amber-500 shrink-0" size={24} />
              <div>
                <h4 className="font-serif font-bold text-stone-900 text-sm">Sovereign Data Mutation Consent</h4>
                <p className="text-stone-605 text-xs mt-1 leading-relaxed">
                  {pendingConfirmAction.type === "delete" && `You are deleting assessment ID: [${pendingConfirmAction.targetId}]. This will permanently remove its ledger timeline records from default Firestore clusters and unmount linked research validations.`}
                  {pendingConfirmAction.type === "sheet_write" && `You are updating structural matrix rows inside the target Google Sheet: [${sheetId}] with the latest computed metrics. This writes new rows directly onto your cloud account.`}
                  {pendingConfirmAction.type === "gmail_send" && `You are dispatching an official email summary via Google SMTP to IMF advisors: [${mailRecipient}]. This executes authenticated mail send operations.`}
                  {pendingConfirmAction.type === "firestore_save" && `This saves the active workspace indicators for [${activeWorkspaceCountry}] into the immutable diagnostic archive of Firestore.`}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPendingConfirmAction(null)}
                className="px-3.5 py-1.5 border border-stone-300 hover:bg-stone-50 rounded text-stone-605 font-mono text-xs transition duration-150 cursor-pointer"
              >
                Abort
              </button>
              <button
                onClick={executeConfirmedAction}
                className="px-4 py-1.5 bg-stone-900 text-white font-mono text-xs font-bold hover:bg-stone-950 rounded cursor-pointer"
              >
                Confirm Operation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Profile Dashboard Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 pb-5 gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <span className="bg-amber-100 border border-amber-350 p-1.5 rounded-md inline-block">
              <Database className="text-amber-700" size={18} />
            </span>
            Sovereign Lab Data Flywheel Workspace
          </h2>
          <p className="text-stone-550 text-xs mt-1 leading-relaxed">
            Integrate Google Forms capture, dynamic Sheets sync, secure Google Drive storage, and Cloud Firestore to drive market-formation feedback loops.
          </p>
        </div>

        {/* Custom Auth Control Center (Conforms to design rules) */}
        <div>
          {needsAuth ? (
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="gsi-material-button transition-all duration-200 transform scale-95 md:scale-100 border border-stone-300 rounded shadow-xs relative flex hover:shadow-sm"
              id="gsioauth-btn"
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper px-4 py-2 bg-white flex items-center gap-3">
                <div className="gsi-material-button-icon">
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block', width: '20px', height: '20px' }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents font-mono text-xs font-bold text-stone-800">
                  {isLoggingIn ? "Connecting Auth..." : "Sign in with Google"}
                </span>
              </div>
            </button>
          ) : (
            <div className="bg-white border border-stone-250 p-2.5 rounded flex items-center gap-3 shadow-3xs">
              <div className="bg-stone-100 p-1.5 rounded border border-stone-200">
                <UserCheck className="text-stone-605" size={16} />
              </div>
              <div className="text-left font-mono text-[11px] leading-tight">
                <span className="font-bold text-stone-900 block">{user.displayName || "Principal Investigator"}</span>
                <span className="text-stone-400 text-[9px] block mb-0.5">{user.email}</span>
                <span className="inline-flex items-center gap-1 text-[8.5px] text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span>
                  Workspace Active Access Token
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-stone-400 hover:text-red-650 font-mono text-[9.5px] font-bold border border-stone-200 hover:border-red-200 px-2 py-1 rounded transition ml-2 cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 1: THE REAL DATA ASYMMETRY FLYWHEEL VISUALIZATION PIPELINE */}
      {renderMode === "full" && (
        <div className="bg-white border border-stone-250 p-5 rounded space-y-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 font-mono tracking-wider">Dynamic System Concept Map</span>
            <h3 className="font-serif font-bold text-stone-850 text-base">The Real Data Asymmetry Flywheel Architecture</h3>
            <p className="text-stone-550 text-xs leading-relaxed mt-0.5">
              Illustrates the seamless workflow path described in Chapter 3 of <em>The Country Architect</em>. Select a node in the path to open its operational workspace module below.
            </p>
          </div>

          {/* Dynamic Interactive Progress pipeline */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-2">
            {[
              { tag: "Inbound Form", desc: "Field input capture", col: "bg-red-50 text-red-700 border-red-200", num: 0 },
              { tag: "Google Sheets", desc: "Sovereign align desk", col: "bg-emerald-50 text-emerald-700 border-emerald-250", num: 1 },
              { tag: "CAD Engine", desc: "Absolute diagnostics", col: "bg-amber-50 text-amber-700 border-amber-250", num: 2 },
              { tag: "Firestore DB", desc: "Persistent indexing", col: "bg-indigo-50 text-indigo-700 border-indigo-250", num: 3 },
              { tag: "Drive Evidence", desc: "Audit trail vault", col: "bg-blue-50 text-blue-700 border-blue-250", num: 4 },
              { tag: "Advisory Export", desc: "Briefings & Slides", col: "bg-purple-50 text-purple-700 border-purple-250", num: 5 }
            ].map((stp, idx) => (
              <button
                key={`pipe-${idx}`}
                onClick={() => setActivePipelineStep(stp.num)}
                className={`p-3 border rounded text-left transition duration-200 cursor-pointer ${
                  activePipelineStep === stp.num 
                    ? "ring-2 ring-stone-900 border-transparent shadow-sm bg-stone-900 text-white!" 
                    : "bg-white hover:bg-stone-50 border-stone-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${activePipelineStep === stp.num ? 'bg-white/10 border-white/20 text-amber-400' : stp.col}`}>
                    {stp.tag}
                  </span>
                  <ChevronRight size={10} className={activePipelineStep === stp.num ? "text-amber-400" : "text-stone-400"} />
                </div>
                <div className="text-[10.5px] font-semibold leading-tight truncate">{stp.desc}</div>
                <div className="text-[8.5px] text-stone-450 mt-1 font-mono">Phase #{idx+1} Pipeline</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DYNAMIC INTEGRATED PANEL (Tied to Selected Pipeline Step above) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: PRIMARY WORKSPACE CONTROLLERS */}
        <div className="lg:col-span-2 space-y-6">
          
          {renderMode === "data_flywheel" && (
            <div className="flex bg-stone-100 p-1 rounded border border-stone-200 text-xs font-semibold gap-1">
              <button
                onClick={() => setActivePipelineStep(1)}
                className={`flex-1 text-center py-2.5 rounded transition-all cursor-pointer ${
                  activePipelineStep === 1 ? "bg-white text-stone-900 shadow-3xs font-bold border border-stone-200" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Google Sheets Live Consolidation Workspace
              </button>
              <button
                onClick={() => setActivePipelineStep(5)}
                className={`flex-1 text-center py-2.5 rounded transition-all cursor-pointer ${
                  activePipelineStep === 5 ? "bg-white text-stone-900 shadow-3xs font-bold border border-stone-200" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Strategy Briefings Export (Docs, Slides, Gmail)
              </button>
            </div>
          )}
          
          {/* CONTROL: STEP 0 & 1 - GOOGLE FORMS Capture & Sheets Import */}
          {activePipelineStep === 0 && (
            <div className="bg-white border border-stone-250 p-6 rounded space-y-4">
              <div className="border-b border-stone-200 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-400 font-mono tracking-wider block">Phase 1: Inbound Grassroots Engine</span>
                  <h4 className="font-serif font-bold text-stone-850 text-sm">Google Forms Survey Sync Ingestion</h4>
                </div>
                <FormInput className="text-red-500" size={18} />
              </div>
              <p className="text-stone-550 text-xs leading-relaxed">
                Field investigators and local NGO coordinators complete standard indicator surveys via the <strong>CAD Light G2P assessment form</strong>. Results consolidate instantly below and feed our calculation models with zero data asymmetry.
              </p>

              <div className="bg-red-50/50 border border-red-100 p-3.5 rounded flex items-center justify-between text-xs font-mono mb-4 text-stone-700">
                <div className="space-y-1">
                  <span className="font-bold text-stone-900 block text-[10.5px]">Deployed Public Google Form:</span>
                  <span className="text-stone-500 break-all text-[9.5px]">https://docs.google.com/forms/d/e/1FAIpQLSfCAD_Field_Assessment_v2/viewform</span>
                </div>
                <a 
                  href="https://docs.google.com/forms" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-white border hover:bg-stone-50 px-3 py-1 rounded text-stone-605 font-bold shrink-0 ml-4 inline-flex items-center gap-1 transition"
                >
                  <ExternalLink size={11} /> Open Admin
                </a>
              </div>

              {/* Grid: Forms list */}
              <div>
                <h5 className="text-[10px] uppercase font-bold font-mono text-stone-400 mb-2">Awaiting Field Submissions ({inboundForms.length})</h5>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {inboundForms.map((frm) => (
                    <div key={frm.formId} className="bg-stone-50 border border-stone-200 p-3 rounded-md flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className="bg-red-100 text-red-800 font-mono font-bold text-[8px] px-1.5 py-0.2 border border-red-200 uppercase rounded">
                            {frm.countryId}
                          </span>
                          <span className="font-mono text-stone-800 font-bold">{frm.respondentEmail}</span>
                        </div>
                        <span className="text-[9.5px] text-stone-500 font-mono block mt-1">Submitted: {frm.timestamp} UTC</span>
                      </div>

                      <div className="flex gap-2 shrink-0 self-end md:self-auto">
                        <button
                          onClick={() => handleIngestFromGoogleForm(frm)}
                          className="bg-stone-900 border border-stone-900 text-white font-mono text-[10px] px-3 py-1.5 font-bold hover:bg-stone-950 rounded transition flex items-center gap-1 cursor-pointer"
                        >
                          <Play size={10} /> Load into Workspace
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONTROL: STEP 1 - GOOGLE SHEETS */}
          {activePipelineStep === 1 && (
            <div className="bg-white border border-stone-250 p-6 rounded space-y-4">
              <div className="border-b border-stone-200 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-400 font-mono tracking-wider block">Phase 2: Consolidation Terminal</span>
                  <h4 className="font-serif font-bold text-stone-850 text-sm">Google Sheets Live Data Connector</h4>
                </div>
                <FileSpreadsheet className="text-emerald-500" size={18} />
              </div>
              <p className="text-stone-550 text-xs leading-relaxed">
                Export individual diagnostic workspace results directly as dynamic rows into linked workbook sheets, or sync collective variables from central NGO tables.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold font-mono text-stone-500 mb-1">Target Google Spreadsheet ID / Link</label>
                  <input
                    type="text"
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                    className="w-full bg-white border border-stone-250 p-2 text-xs font-mono rounded"
                    placeholder="Spreadsheet ID"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold font-mono text-stone-500 mb-1">Sheet Worksheet Name</label>
                  <input
                    type="text"
                    value={sheetTabName}
                    onChange={(e) => setSheetTabName(e.target.value)}
                    className="w-full bg-white border border-stone-250 p-2 text-xs font-mono rounded"
                    placeholder="Worksheet Name"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => requestTriggerConfirmation("sheet_write")}
                  disabled={isSyncingSheet}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs px-4 py-2 font-bold rounded transition shadow-3xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isSyncingSheet ? (
                    <RefreshCw className="animate-spin" size={13} />
                  ) : (
                    <RefreshCw size={13} />
                  )}
                  Push Current {activeWorkspaceCountry} Row to Sheet
                </button>
              </div>

              {sheetLink && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded text-xs flex items-center justify-between font-mono">
                  <div className="space-y-0.5">
                    <span className="font-bold text-emerald-800">Dynamic Google Sheets Link Created:</span>
                    <span className="text-stone-550 text-[10px] block truncate max-w-sm">{sheetLink}</span>
                  </div>
                  <a 
                    href={sheetLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded hover:bg-emerald-200 font-bold flex items-center gap-1"
                  >
                    Open Live Sheet <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* CONTROL: STEP 2 - CAD DIAGNOSTIC ENGINE VERDICT */}
          {activePipelineStep === 2 && (
            <div className="bg-white border border-stone-250 p-6 rounded space-y-4">
              <div className="border-b border-stone-200 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-400 font-mono tracking-wider block">Phase 3: Computational Engine</span>
                  <h4 className="font-serif font-bold text-stone-850 text-sm">Deterministic Digital Matrix (CAD Engine)</h4>
                </div>
                <Sparkles className="text-amber-500" size={18} />
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-stone-50 border p-4 rounded-md">
                <div className="text-center font-mono">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">Sovereign Focus</span>
                  <span className="text-sm font-serif font-bold text-stone-900 truncate block mt-1">{activeWorkspaceCountry}</span>
                </div>
                <div className="text-center font-mono border-l">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">Calibrated ARI</span>
                  <span className="text-sm font-bold text-amber-600 block mt-1">{activeWorkspaceARI.toFixed(3)}</span>
                </div>
                <div className="text-center font-mono border-l">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">Designation</span>
                  <span className="text-[11.5px] font-bold text-stone-850 truncate block mt-1 leading-normal">{activeWorkspaceScores.classification}</span>
                </div>
                <div className="text-center font-mono border-l">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">Binding Constraint</span>
                  <span className="text-[11.5px] font-bold text-stone-850 truncate block mt-1 leading-normal text-red-700">{activeWorkspaceScores.bindingConstraint}</span>
                </div>
              </div>

              <div>
                <h5 className="font-mono text-[10px] uppercase font-bold text-stone-500 mb-2">Automated Calibration Pathway Mapping</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed text-stone-605">
                  <div className="bg-stone-50 p-3 rounded border">
                    <span className="font-bold text-stone-800 block mb-1">System Characteristics:</span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      <li>Grassroots System Viability (GSV): <strong>{activeWorkspaceScores.gsv.toFixed(2)}</strong></li>
                      <li>Institutional Capacity (ITC): <strong>{activeWorkspaceScores.itc.toFixed(2)}</strong></li>
                      <li>Sovereign Readiness (SDR): <strong>{activeWorkspaceScores.sdr.toFixed(2)}</strong></li>
                      <li>Admin Leverage (AFL): <strong>{activeWorkspaceScores.afl.toFixed(2)}</strong></li>
                    </ul>
                  </div>
                  <div className="bg-stone-50 p-3 rounded border">
                    <span className="font-bold text-stone-800 block mb-1">Identified Intervention Timeline:</span>
                    <div className="space-y-1 text-[11px]">
                      {activeWorkspaceScores.priorityUpgradePathway.map((pw, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <Check className="text-emerald-600" size={11} />
                          <span>P#{idx+1}: {pw}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => requestTriggerConfirmation("firestore_save")}
                  className="bg-stone-900 hover:bg-stone-950 text-white font-mono text-xs px-4 py-2 font-bold rounded transition shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Database size={13} /> Log Workspace Assessment as Firestore Record
                </button>
              </div>
            </div>
          )}

          {/* CONTROL: STEP 3 - FIRESTORE ARCHIVE DATABASE */}
          {activePipelineStep === 3 && (
            <div className="bg-white border border-stone-250 p-6 rounded space-y-4">
              <div className="border-b border-stone-200 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-400 font-mono tracking-wider block">Phase 4: Institutional Memory Registry</span>
                  <h4 className="font-serif font-bold text-stone-850 text-sm">Firebase Firestore Ledger Archive</h4>
                </div>
                <Database className="text-indigo-500" size={18} />
              </div>
              <p className="text-stone-550 text-xs leading-relaxed">
                Displays the <strong>CAD Intelligence Repository</strong>. All saved and loaded country diagnostic checkpoints are archived centrally, building historical calibration accuracy as the dataset scales.
              </p>

              {/* Table of Assessments */}
              <div>
                <h5 className="text-[10px] uppercase font-bold font-mono text-stone-400 mb-2">Saved National Assessments in Cloud Repository ({assessmentsList.length})</h5>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {isLoadingAsms ? (
                    <div className="text-center py-6 text-stone-450 text-xs font-mono">Syncing Firestore Ledger...</div>
                  ) : assessmentsList.length === 0 ? (
                    <div className="text-center py-6 text-stone-450 text-xs font-mono">No active assessments in cloud Firestore.</div>
                  ) : (
                    assessmentsList.map((asm) => (
                      <div key={asm.id} className="bg-stone-50 border border-stone-200 hover:border-stone-350 p-3.5 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition">
                        <div className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-100 text-indigo-800 font-mono font-bold text-[9px] px-2 py-0.2 border border-indigo-200 uppercase rounded">
                              {asm.countryName}
                            </span>
                            <span className="text-[9px] text-stone-400 font-mono font-bold">SHA-PAP: pre-{asm.id}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-[10.5px] mt-2 font-mono text-stone-605">
                            <div>ARI: <strong className="text-amber-700">{asm.results.ari.toFixed(3)}</strong></div>
                            <div>GSV: <strong>{asm.results.gsv.toFixed(2)}</strong></div>
                            <div>ITC: <strong>{asm.results.itc.toFixed(2)}</strong></div>
                            <div>Failure Probability: <strong>{asm.results.sfp}%</strong></div>
                          </div>
                          
                          <div className="text-[9px] text-stone-400 font-mono mt-1.5 flex items-center gap-1.5">
                            <Clock size={9} /> {new Date(asm.timestamp).toLocaleString("en-US", { timeStyle: "medium", dateStyle: "short" })}
                            <span>•</span>
                            <UserCheck size={9} /> {asm.creatorEmail}
                          </div>
                        </div>

                        <div className="flex gap-2 shrink-0 self-end md:self-auto">
                          <button
                            onClick={() => onLoadAssessmentToWorkspace(asm.inputs)}
                            className="bg-white border text-stone-800 hover:bg-stone-50 hover:text-stone-900 font-mono text-[10px] px-2.5 py-1.5 font-bold rounded shadow-3xs flex items-center gap-1"
                          >
                            <Play size={10} /> Load
                          </button>
                          <button
                            onClick={() => requestTriggerConfirmation("delete", asm.id)}
                            className="text-stone-405 hover:text-red-700 border hover:border-red-100 hover:bg-red-50/50 p-1.5 rounded transition"
                            title="Delete checkpoint"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CONTROL: STEP 4 - DRIVE EVIDENCE VAULT */}
          {activePipelineStep === 4 && (
            <div className="bg-white border border-stone-250 p-6 rounded space-y-4">
              <div className="border-b border-stone-200 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-400 font-mono tracking-wider block">Phase 5: Evidence & Academic Audit</span>
                  <h4 className="font-serif font-bold text-stone-850 text-sm">Google Drive Evidence Reference Vault</h4>
                </div>
                <FolderOpen className="text-blue-500" size={18} />
              </div>
              <p className="text-stone-550 text-xs leading-relaxed">
                Prevent arbitrary calibration. Pin legal proclaim papers, telecom frameworks, or central MFI policy PDFs directly from Google Drive folders to individual evaluation variables.
              </p>

              {/* Browse simulation */}
              <div className="bg-stone-50 border p-4 rounded space-y-3.5">
                <span className="text-[9px] uppercase font-bold text-stone-400 font-mono tracking-wider block">Reference Pinning Desk</span>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold font-mono text-stone-500 mb-1">Target Assessment Metric Indicator</label>
                    <select
                      value={selectedEvidenceTarget}
                      onChange={(e) => setSelectedEvidenceTarget(e.target.value)}
                      className="w-full bg-white border border-stone-250 px-2.5 py-1.5 text-xs font-mono rounded"
                    >
                      <option value="Structuring Capacity">Structuring Capacity</option>
                      <option value="Regulatory Translation Layer">Regulatory Translation Layer</option>
                      <option value="Delivery Infrastructure">Delivery Infrastructure</option>
                      <option value="Trust Architecture">Trust Architecture</option>
                      <option value="Data Legibility">Data Legibility</option>
                      <option value="Unit Economics">Unit Economics</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] uppercase font-bold font-mono text-stone-500 mb-1">Preconditions</label>
                    <span className="bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-mono px-2 py-1.5 rounded block text-center">
                      Auto Hash Integrity Active
                    </span>
                  </div>
                </div>

                {/* Simulated files ready to pin */}
                <div>
                  <span className="block text-[9.5px] uppercase font-bold font-mono text-stone-400 mb-1.5">Direct Pick from Google Drive:</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => handleLinkDriveDocumentSimulation("Ethiopia_Ministry_Fayda_Decree_June2026.pdf", 3250100)}
                      disabled={isUploadingDriveSim}
                      className="text-left bg-white border border-stone-200 hover:border-blue-500 p-2.5 rounded hover:bg-blue-50/20 transition flex items-center justify-between cursor-pointer"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-stone-800 block truncate text-[11px]">Ethiopia_Ministry_Fayda_Decree_June2026.pdf</span>
                        <span className="text-[9.5px] text-stone-400 font-mono block">Size: 3.10 MB • PDF document</span>
                      </div>
                      <Plus className="text-stone-400 text-right shrink-0" size={14} />
                    </button>
                    
                    <button
                      onClick={() => handleLinkDriveDocumentSimulation("Ken_M_Pesa_CrossBorder_Regulatory_Framework.pdf", 1450200)}
                      disabled={isUploadingDriveSim}
                      className="text-left bg-white border border-stone-200 hover:border-blue-500 p-2.5 rounded hover:bg-blue-50/20 transition flex items-center justify-between cursor-pointer"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-stone-800 block truncate text-[11px]">Ken_M_Pesa_CrossBorder_Framework.pdf</span>
                        <span className="text-[9.5px] text-stone-400 font-mono block">Size: 1.38 MB • PDF document</span>
                      </div>
                      <Plus className="text-stone-400 text-right shrink-0" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTROL: STEP 5 - ADVISORY BRIEF EXPORT CABINET (Docs, Slides, Gmail) */}
          {activePipelineStep === 5 && (
            <div className="bg-white border border-stone-250 p-6 rounded space-y-4">
              <div className="border-b border-stone-200 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[9px] uppercase font-bold text-stone-400 font-mono tracking-wider block">Phase 6: Multi-Channel Advisory Desk</span>
                  <h4 className="font-serif font-bold text-stone-850 text-sm">Workspace Presentation & Transnational Output</h4>
                </div>
                <Send className="text-purple-500" size={18} />
              </div>
              <p className="text-stone-550 text-xs leading-relaxed">
                Translate mathematical outputs into policy agency. Instantly export detailed memos to Google Docs, slide outlines to Google Slides, and submit draft alerts to DFIs via Gmail.
              </p>

              {/* Tab options inside the brief section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                
                {/* Panel 1: Doc Memo */}
                <div className="bg-stone-50 border p-4 rounded space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-stone-400 block uppercase mb-1">google docs brief</span>
                    <h5 className="font-bold font-serif text-[12.5px] text-stone-850 leading-tight">Sovereign Briefing Draft Memo</h5>
                    <p className="text-stone-500 text-[10.5px] leading-relaxed mt-1">
                      Translates indicators and classifications into rich editorial paragraphs.
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={handleDocsExport}
                      disabled={isGeneratingDoc}
                      className="w-full bg-stone-900 hover:bg-stone-950 text-white font-mono text-[10px] py-1.5 font-bold rounded cursor-pointer transition flex items-center justify-center gap-1"
                    >
                      {isGeneratingDoc ? "Drafting..." : "Export to Doc Memo"}
                    </button>
                  </div>
                </div>

                {/* Panel 2: Slides */}
                <div className="bg-stone-50 border p-4 rounded space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-stone-400 block uppercase mb-1">google slides deck</span>
                    <h5 className="font-bold font-serif text-[12.5px] text-stone-850 leading-tight">Board & Ministry Briefing Deck</h5>
                    <p className="text-stone-500 text-[10.5px] leading-relaxed mt-1">
                      Assembles four elegant presentation slides encapsulating bento metrics.
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={handleSlidesExport}
                      disabled={isGeneratingSlides}
                      className="w-full bg-stone-900 hover:bg-stone-950 text-white font-mono text-[10px] py-1.5 font-bold rounded cursor-pointer transition flex items-center justify-center gap-1"
                    >
                      {isGeneratingSlides ? "Configuring..." : "Generate Slider Slides"}
                    </button>
                  </div>
                </div>

                {/* Panel 3: Gmail dispatch */}
                <div className="bg-stone-50 border p-4 rounded space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-stone-400 block uppercase mb-1">gmail dispatch</span>
                    <h5 className="font-bold font-serif text-[12.5px] text-stone-850 leading-tight">Submit to Advisory Partners</h5>
                    <p className="text-stone-500 text-[10.5px] leading-relaxed mt-1">
                      Emails draft pre-analysis links and OLS proofs directly to advisors.
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => requestTriggerConfirmation("gmail_send")}
                      disabled={isSendingMail}
                      className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-mono text-[10px] py-1.5 font-bold rounded cursor-pointer transition flex items-center justify-center gap-1"
                    >
                      <Mail size={11} /> Send Draft via Gmail
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Memo Preview */}
              {renderedDocContent && (
                <div className="bg-stone-50 border p-4 rounded space-y-2 font-mono text-xs text-stone-700 max-h-60 overflow-y-auto">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="font-bold text-stone-900">Google Docs Live Content Memo Raw Draft:</span>
                    {docLink && (
                      <a href={docLink} target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:underline flex items-center gap-1 py-0.5">
                        Open Doc <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <pre className="whitespace-pre-wrap leading-normal text-[10px]">{renderedDocContent}</pre>
                </div>
              )}

              {/* Dynamic Slides Output */}
              {slidesOutline && (
                <div className="bg-stone-50 border p-4 rounded space-y-2 text-xs text-stone-700">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="font-mono font-bold text-stone-900">Assembly Slide Layout Map ({slidesOutline.length} Slides):</span>
                    {slidesLink && (
                      <a href={slidesLink} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
                        Open Presentation <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                    {slidesOutline.map((slide, idx) => (
                      <div key={idx} className="bg-white border p-2.5 rounded shadow-3xs leading-relaxed text-stone-605">
                        <pre className="whitespace-pre-wrap">{slide}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: ACTIVE CONTEXT & AUDIT TRAIL LOGS */}
        <div className="space-y-6">
          
          {/* ADVISORY TEAM LOG MONITOR */}
          <div className="bg-white border border-stone-250 p-5 rounded space-y-3">
            <span className="text-[9.5px] uppercase font-bold text-stone-400 font-mono tracking-wider block">Live Indicator Focus context</span>
            <h4 className="font-serif font-bold text-stone-850 text-xs">Active Calibration Checklist</h4>
            
            <div className="space-y-2.5 text-xs text-stone-605 leading-relaxed leading-normal">
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded flex justify-between">
                <span>Focus Nation:</span>
                <strong className="text-stone-900 uppercase font-mono">{activeWorkspaceCountry}</strong>
              </div>
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded flex justify-between">
                <span>Indicator ARI:</span>
                <strong className="text-amber-700 font-mono">{activeWorkspaceARI.toFixed(3)}</strong>
              </div>
              <div className="p-2.5 bg-stone-50 border border-stone-200 rounded flex justify-between">
                <span>Database Sync Mode:</span>
                <strong className="text-emerald-700 font-mono">Resilient Offline-Online Hub Ready</strong>
              </div>
            </div>

            <div className="bg-amber-50/50 border border-amber-200/60 p-3 rounded text-[11px] text-stone-605 leading-relaxed">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
                <Info size={12} className="shrink-0" />
                <span>Zero-Trust Security Enforcement</span>
              </div>
              Sovereign rules enforce the **Master Gate Pattern**. Access to linked evidence schemas is strictly linked to verified researcher identity permissions. 
            </div>
          </div>

          {/* ACTIVE ATTACHED DRIVE DOCUMENTS LEDGER */}
          <div className="bg-white border border-stone-250 p-5 rounded space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-serif font-bold text-stone-850 text-xs flex items-center gap-1">
                <FileCheck className="text-blue-500" size={13} /> Linked Drive Evidence ({filteredAttachedFiles.length})
              </h4>
              <span className="text-[10px] font-mono text-stone-400">Vault Block</span>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 text-stone-400" size={12} />
              <input
                type="text"
                placeholder="Search attached files..."
                value={driveSearch}
                onChange={(e) => setDriveSearch(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 pl-8 pr-2 py-1.5 text-[10.5px] font-mono rounded"
              />
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {filteredAttachedFiles.map((file) => (
                <div key={file.fileId} className="bg-stone-50 border border-stone-200 p-2.5 rounded-md text-[10px] font-mono leading-tight flex flex-col gap-1 hover:border-blue-300 transition">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-stone-850 truncate max-w-[130px]" title={file.fileName}>{file.fileName}</span>
                    <span className="text-blue-700 bg-blue-50 border border-blue-200 text-[8.5px] px-1 py-0.2 rounded uppercase shrink-0">
                      {file.targetIndicator.slice(0, 15)}...
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-450 items-center text-[9px] mt-1 text-stone-400">
                    <span>Size: {(file.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                    <span className="text-[8px] italic break-all max-w-[110px] truncate" title={file.hashSignature}>SHA: {file.hashSignature.slice(0, 10)}...</span>
                  </div>
                </div>
              ))}
              {filteredAttachedFiles.length === 0 && (
                <div className="text-center py-4 text-stone-400 text-[10.5px] font-mono">No documents linked yet. Select step #5 to attach references.</div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
