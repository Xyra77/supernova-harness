; Compile against the production directory transaction using a private payload and target.
Unicode true
RequestExecutionLevel user
SilentInstall silent
Name "Desktop directory replacement smoke"
OutFile "${OUTPUT_FILE}"
LoadLanguageFile "${NSISDIR}\Contrib\Language files\English.nlf"
LangString decompressionFailed ${LANG_ENGLISH} "Payload extraction failed"

!macro installApplicationFiles
  !insertmacro snhExtractPayload "${PAYLOAD_FILE}"
!macroend
!ifdef SOURCE_DLL
  LoadLanguageFile "${NSISDIR}\Contrib\Language files\SimpChinese.nlf"
  !include "..\..\installer\strings.nsh"
  !define SNH_INSTALLER_LOG_DIR "${REPORT_DIR}"
  !include "..\..\scripts\installer.nsh"
!else
  !include "..\..\scripts\installer-directories.nsh"
!endif

Section
  InitPluginsDir
  FileOpen $0 "${TARGET_DIR}.plugin-dir.tmp" w
  FileWriteUTF16LE /BOM $0 "$PLUGINSDIR"
  FileClose $0
  Rename "${TARGET_DIR}.plugin-dir.tmp" "${TARGET_DIR}.plugin-dir"
  !ifdef SOURCE_DLL
    File "/oname=$PLUGINSDIR\window-frame.dll" "${SOURCE_DLL}"
  !endif
  StrCpy $INSTDIR "${TARGET_DIR}"
  !insertmacro snhStageApplication
  !ifdef RESTORE_CONFLICT
    Rename $snhFinalDirectory $snhOldDirectory
    StrCpy $snhOldMoved "1"
    CreateDirectory $snhFinalDirectory
    FileOpen $0 "$snhFinalDirectory\unrelated.txt" w
    FileWrite $0 "unrelated file"
    FileClose $0
    StrCpy $snhDirectorySource $snhNewDirectory
    StrCpy $snhDirectoryDestination $snhFinalDirectory
    !insertmacro snhDirectoryOperation "$snhDirectorySource" "$snhDirectoryDestination" $snhDirectoryError "promote"
    Call snhRollbackDirectories
    !insertmacro snhReportDirectoryFailure
    Rename $snhFinalDirectory "${TARGET_DIR}.conflict"
    Call snhCleanupDirectories
    SetErrorLevel 2
    Quit
  !endif
  !ifdef CANCELLED
    SetErrorLevel 2
    Call snhCleanupDirectories
    Quit
  !endif
  !ifdef MISSING_STAGE
    ; A missing source makes the second rename fail after the old directory moved.
    RMDir /r "\\?\$snhNewDirectory"
  !endif
  !ifdef LOCKED_STAGE
    System::Call 'kernel32::CreateFileW(w "$snhNewDirectory\asset.txt", i 0x80000000, i 1, p 0, i 3, i 0, p 0) p.r9'
  !endif
  Call snhPromoteDirectories
  IfErrors failed
  !insertmacro snhFinishDirectories
  SetErrorLevel 0
  Quit
  failed:
  !ifdef LOCKED_STAGE
    System::Call 'kernel32::CloseHandle(p r9)'
    Call snhCleanupDirectories
  !endif
  SetErrorLevel 2
  Quit
SectionEnd
